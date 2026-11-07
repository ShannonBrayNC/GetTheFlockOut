import { campaign } from './campaign';
import { env } from 'cloudflare:workers';
import { petition, priorPetition, version, consentVersion } from './public-copy';
export { petition, version, consentVersion };
export const officials = campaign.officials;
export const cfg = () => env as any;
export function ready() { const e = cfg(); return !!(e.ADMIN_EMAIL && e.RESEND_API_KEY && e.MAIL_FROM && e.ORGANIZER_CONTACT); }
export async function selected() {
    const current = await cfg().DB.prepare("SELECT value FROM settings WHERE key='recipients_v3'").first();
    const legacy = current ? null : await cfg().DB.prepare("SELECT value FROM settings WHERE key='recipients'").first();
    const ids = current ? JSON.parse(current.value) : legacy ? [...new Set([...JSON.parse(legacy.value), 'chief'])] : officials.map(o => o.id);
    return officials.filter(o => Array.isArray(ids) && ids.includes(o.id)).map(o => o.id);
}
// Residency is a declaration, not independent address verification.
// Both new submissions and every queued/retried delivery must pass this gate.
export function eligibleForOfficialMail(s: any) {
    return !!s && (s.resident === 'yes' || s.resident === 1) &&
        typeof s.city === 'string' && s.city.trim().toLowerCase().replace(/[\s–—-]+/g, ' ') === campaign.city.toLowerCase().replace(/[\s–—-]+/g, ' ') &&
        typeof s.zip === 'string' && campaign.localZipCodes.includes(s.zip.trim());
}
export function sameOrigin(r: Request) { return r.headers.get('origin') === new URL(r.url).origin; }
export function validSubmission(b: any, ids: string[]) {
    if (!b || typeof b !== 'object' || Array.isArray(b))
        return false;
    const clean = (x: any, n: number) => typeof x === 'string' && x.trim().length >= n && x.length <= 100 && !/[\x00-\x1f\x7f]/.test(x);
    return typeof b.contactEmail === 'string' && b.contactEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contactEmail) &&
        (b.telephone === undefined || b.telephone === '' || (typeof b.telephone === 'string' && b.telephone.length <= 40 && /^[+()0-9 .-]+$/.test(b.telephone) && b.telephone.replace(/\D/g, '').length >= 7)) &&
        (b.getInvolved === undefined || b.getInvolved === 'yes') && b.consent === 'yes' && !b.website && clean(b.name, 2) && clean(b.city, 1) && typeof b.zip === 'string' && /^\d{5}$/.test(b.zip) &&
        (b.resident === undefined || b.resident === 'yes') && (b.priorPaper === undefined || b.priorPaper === 'yes') &&
        b.version === version && b.consentVersion === consentVersion && Array.isArray(b.recipients) && b.recipients.length === ids.length &&
        new Set(b.recipients).size === b.recipients.length && b.recipients.every((x: any) => typeof x === 'string' && ids.includes(x));
}
export async function bodyJSON(r: Request) {
    if (!r.headers.get('content-type')?.toLowerCase().includes('application/json'))
        throw new Error('Expected JSON');
    const reader = r.body?.getReader();
    if (!reader)
        throw new Error('Empty body');
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
        const v = await reader.read();
        if (v.done)
            break;
        size += v.value.length;
        if (size > 8192) {
            await reader.cancel();
            throw new Error('Request too large');
        }
        chunks.push(v.value);
    }
    const bytes = new Uint8Array(size);
    let at = 0;
    for (const c of chunks) {
        bytes.set(c, at);
        at += c.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
}
// A provider acknowledgement is not proof of inbox delivery or that an official read it.
export async function sendOne(input: {
    id: string;
}) {
    const e = cfg();
    if (!e.RESEND_API_KEY || !e.MAIL_FROM)
        return false;
    const row = await e.DB.prepare('SELECT * FROM deliveries WHERE id=?').bind(input.id).first();
    if (!row || ['sent', 'accepted', 'cancelled', 'review_required', 'rejected'].includes(row.status))
        return false;
    if (row.attempts > 0 && !row.first_attempt) {
        await e.DB.prepare("UPDATE deliveries SET status='review_required' WHERE id=?").bind(row.id).run();
        return false;
    }
    if (row.first_attempt && Date.now() - Date.parse(row.first_attempt) > 23 * 3600000) {
        await e.DB.prepare("UPDATE deliveries SET status='review_required' WHERE id=?").bind(row.id).run();
        return false;
    }
    const o = officials.find(o => o.id === row.recipient);
    if (!o)
        return false;
    const s = await e.DB.prepare('SELECT * FROM signatures WHERE id=?').bind(row.signature).first();
    if (!s)
        return false;
    if (!eligibleForOfficialMail(s)) {
        await e.DB.prepare("UPDATE deliveries SET status='cancelled',reason='not_local_resident',updated=? WHERE id=?").bind(new Date().toISOString(), row.id).run();
        return false;
    }
    if(s.withdrawn_at || s.verification !== 'approved') { await e.DB.prepare("UPDATE deliveries SET status=?,reason=? WHERE id=?").bind(s.withdrawn_at?'cancelled':'pending_review',s.withdrawn_at?'signer_withdrawn':'residency_review_required',row.id).run(); return false; }
    if(row.next_attempt && Date.parse(row.next_attempt)>Date.now()) return false;
    const text = s.version === version ? petition : campaign.slug === 'angier' && s.version === '2026-11-05-v1' ? priorPetition : null;
    if (!text) {
        await e.DB.prepare("UPDATE deliveries SET status='review_required' WHERE id=?").bind(row.id).run();
        return false;
    }
    const now = new Date().toISOString();
    const payload = row.payload || JSON.stringify({ from: e.MAIL_FROM, to: [o.email], ...(campaign.monitoringRecipients.length ? { bcc: campaign.monitoringRecipients } : {}), subject: campaign.brand + ' — ' + campaign.city + ': a new petition supporter', text: 'Dear ' + o.name + ',\n\n' + s.name + ' of ' + s.city + ' (' + s.zip + ') has signed the ' + campaign.brand + ' — ' + campaign.city + ' community advocacy petition.\n\n' + text + '\n\nSigned: ' + s.created + '\nPetition version: ' + s.version + '\nReference: ' + s.id + '\n\nThis single notification was authorized by the signer. Their email is not shared. This is an independent community petition, not a ' + campaign.governmentName + ' service.' });
    // Claim only an idle delivery, or a stale lease. Persist the exact payload before the network call.
    const claim = await e.DB.prepare("UPDATE deliveries SET status='sending',first_attempt=COALESCE(first_attempt,?),payload=COALESCE(payload,?),attempts=attempts+1,updated=? WHERE id=? AND (status IN ('queued','failed') OR (status='sending' AND updated<?))").bind(now, payload, now, row.id, new Date(Date.now() - 120000).toISOString()).run();
    if (claim.meta?.changes !== 1)
        return false;
    try {
        const current=await e.DB.prepare('SELECT withdrawn_at,verification FROM signatures WHERE id=?').bind(s.id).first();
        if(current?.withdrawn_at || current?.verification!=='approved'){await e.DB.prepare("UPDATE deliveries SET status='cancelled',reason='withdrawn_before_network' WHERE id=?").bind(row.id).run();return false;}
        const result = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(15000), headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': row.id }, body: payload });
        const reply: any = await result.json().catch(() => ({}));
        const accepted = result.ok && typeof reply.id === 'string';
        const retrySeconds=Math.max(60,Math.min(3600,Number(result.headers?.get('retry-after'))||Math.pow(2,Math.min(row.attempts||0,6))*60));
        await e.DB.prepare('UPDATE deliveries SET next_attempt=? WHERE id=?').bind(accepted?null:new Date(Date.now()+retrySeconds*1000).toISOString(),row.id).run();
        const status = accepted ? 'accepted' : result.ok ? 'review_required' : result.status === 429 || result.status >= 500 ? 'failed' : 'rejected';
        await e.DB.prepare('UPDATE deliveries SET status=?,provider_id=?,reason=?,updated=? WHERE id=?').bind(status, accepted ? reply.id : null, accepted ? null : 'provider_http_' + result.status, new Date().toISOString(), row.id).run();
        return accepted;
    }
    catch {
        await e.DB.prepare("UPDATE deliveries SET status='failed',reason='network_or_acknowledgement_error',updated=?,next_attempt=? WHERE id=?").bind(new Date().toISOString(),new Date(Date.now()+300000).toISOString(),row.id).run();
        return false;
    }
}

// Explicit organizer test; never creates a signature or contacts an official.
export async function sendTestEmail() {
    const e = cfg();
    if (!ready()) return { ok: false, error: 'Complete sender configuration first.' };
    if (!campaign.monitoringRecipients.length) return { ok: false, error: 'Configure a monitoring recipient first.' };
    try {
        const r = await fetch('https://api.resend.com/emails', {
            method: 'POST', signal: AbortSignal.timeout(15000),
            headers: { Authorization: 'Bearer ' + e.RESEND_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: e.MAIL_FROM, to: campaign.monitoringRecipients,
                subject: '[TEST] ' + campaign.brand + ' — ' + campaign.city + ' email setup',
                text: 'This is an organizer-requested email configuration test for ' + campaign.city + ', ' + campaign.state + '. No petition signature was created and no officials were contacted. If you can read this message, delivery to this inbox succeeded. Test time: ' + new Date().toISOString() })
        });
        const b: any = await r.json().catch(() => ({}));
        if (!r.ok || typeof b.id !== 'string') return { ok: false, error: 'Test email was not accepted (provider HTTP ' + r.status + '). Check the sending key and verified From domain in Resend.' };
        return { ok: true, message: 'Test accepted by Resend. Check your monitoring inbox and spam folder to confirm delivery.', providerId: b.id };
    } catch { return { ok: false, error: 'Test request did not receive an acknowledgement. Check Resend logs before retrying.' }; }
}

export function outgoingPayload(s:any,o:any){return JSON.stringify({from:cfg().MAIL_FROM,to:[o.email],...(campaign.monitoringRecipients.length?{bcc:campaign.monitoringRecipients}:{}),subject:campaign.brand+' — '+campaign.city+': a new petition supporter',text:'Dear '+o.name+',\n\n'+s.name+' of '+s.city+' ('+s.zip+') has signed the '+campaign.brand+' — '+campaign.city+' community advocacy petition.\n\n'+petition+'\n\nSigned: '+s.created+'\nPetition version: '+version+'\nReference: '+s.id+'\n\nThis notification was authorized by the signer. Their private contact details are not shared. This is an independent community petition.'});}
