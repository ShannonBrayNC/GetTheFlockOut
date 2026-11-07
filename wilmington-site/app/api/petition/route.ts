import {state} from '../../operations';
import { getChatGPTUser } from '../../chatgpt-auth';
import { cfg, officials, selected, sendOne, sameOrigin, version, consentVersion, validSubmission, bodyJSON, ready, eligibleForOfficialMail, outgoingPayload } from '../../lib';
export async function GET() {
    const e = cfg();
    const count = await e.DB.prepare('SELECT count(*) AS n,SUM(resident) AS residents,SUM(prior_paper) AS paper FROM signatures WHERE withdrawn_at IS NULL').first();
    return Response.json({ count: count.n, residents: count.residents || 0, priorPaper: count.paper || 0, recipients: officials.map(({ id, name, role, email }) => ({ id, name, role, email })), selected: await selected(), mailReady: !!(e.RESEND_API_KEY && e.MAIL_FROM), signingReady: ready(), contact: e.ORGANIZER_CONTACT || null }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(r: Request) {
    if (!sameOrigin(r))
        return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
    const u = await getChatGPTUser();
    if (!u)
        return Response.json({ error: 'Please sign in with ChatGPT before signing.' }, { status: 401 });
    let b: any;
    try {
        b = await bodyJSON(r);
    }
    catch {
        return Response.json({ error: 'Invalid or oversized request.' }, { status: 400 });
    }
    const ids = await selected();
    if (!validSubmission(b, ids))
        return Response.json({ error: 'Check the form and consent. If the petition or recipients changed, refresh and review before signing.' }, { status: 400 });
    if (!ready() || !ids.length)
        return Response.json({ error: 'Signing is paused until the organizer finishes sender and privacy-contact setup.' }, { status: 503 });
    if(await state('campaign_closed_at'))return Response.json({error:'This campaign is closed to new signatures.'},{status:403});
    const e = cfg(), id = crypto.randomUUID(), now = new Date().toISOString();
    const existing = await e.DB.prepare('SELECT id FROM signatures WHERE user_id=? OR email=?').bind(u.userId, u.email.toLowerCase()).first();
    if (existing)
        return Response.json({ error: 'This account or email has already signed. Thank you.' }, { status: 409 });
    const localResident = eligibleForOfficialMail(b);
    const mailIds = localResident ? ids : [];
    try {
        await e.DB.batch([
            e.DB.prepare('INSERT INTO signatures(id,user_id,email,name,city,zip,resident,created,version,consent_version,prior_paper,contact_email,telephone,get_involved) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id, u.userId, u.email.toLowerCase(), b.name.trim(), b.city.trim(), b.zip, localResident ? 1 : 0, now, version, consentVersion, 0, b.contactEmail.trim().toLowerCase(), b.telephone?.trim() || null, b.getInvolved === 'yes' ? 1 : 0),
            ...mailIds.map((recipient: string) => e.DB.prepare("INSERT INTO deliveries(id,signature,recipient,status,attempts,updated,payload) VALUES(?,?,?,'pending_review',0,?,?)").bind(id + '-' + recipient, id, recipient, now, outgoingPayload({id,name:b.name.trim(),city:b.city.trim(),zip:b.zip,created:now},officials.find(o=>o.id===recipient))))
        ]);
    }
    catch {
        return Response.json({ error: 'Unable to record a new signature. Refresh before trying again; the account may already have signed.' }, { status: 409 });
    }
    return Response.json({id,accepted:0,total:mailIds.length,message:localResident?'Your signature is recorded. Official notifications are held for organizer verification of city residency. No emails have been sent yet.':'Your support is recorded separately. No official or monitoring emails were sent.'});
}
