# Angier Against Flock

Community advocacy petition; not an elections petition. Read public/petition-review.html for the legal-source review, technical findings, paper procedures, corrected wording and launch conditions. Printable paper form: public/petition-sheet.html. Review date November 5, 2026 ET.

## Current state
Owner-private deployed review version. No real signatures or official messages created by tests. Public launch remains blocked on verified sender/domain, organizer contact, final retention/withdrawal operations, delivery reconciliation and current clerk instructions. Presence of runtime keys enables the signing API but does not itself certify readiness. Do not enable before completing the review checklist.

## Runtime configuration
ADMIN_EMAIL: organizer ChatGPT sign-in email; every admin API operation verifies it.
RESEND_API_KEY: secret for authorized Resend account.
MAIL_FROM: domain-verified organizer sender; never spoof a signer's email.
ORGANIZER_CONTACT: public contact displayed to signers.
Set through Sites runtime environment tools; never store secrets in source. Redeploy after environment changes. /admin selects from the fixed mayor/commissioner allowlist; changes affect only new signatures. Default all five.

## Signing
Server enforces same-origin writes, sign-in, strict bounded JSON, exact statement and consent versions, exact displayed recipient set, explicit consent and typed fields. Duplicate account/email constrained in D1. Account/email is not a verified person, voter or resident. Residency and prior-paper declaration are self-reported. Atomic batch inserts signature and delivery rows. One original notification per recipient; no marketing.

## Outbox
Statuses: queued, sending, accepted, failed, rejected, review_required; legacy sent is treated as terminal but not proof of delivery. Exact message payload and immutable first_attempt persist before sending. A compare-and-set claim limits concurrency; stale sending leases can be retried after two minutes. Provider deduplication key remains the delivery ID. Retry stops at 23 hours from the first attempt; unknown outcomes then require manual provider reconciliation. Never blindly reset a row or first_attempt. Never delete an accepted row and resend as a new ID. Capture provider_id for reconciliation. Sender changes cannot alter an in-flight payload. Older v1 uses original wording; unknown versions stop.

No unattended worker, bounce/delivery webhook or automatic recipient revalidation has been implemented. /admin processes up to 25 queued/failed/stale notifications per action. Staff must review terminal rejection/manual-review states. Provider acceptance is not delivery or reading. Add authenticated scheduled retries, provider event verification and alerting before relying on unattended volume. Test against controlled recipients, not officials.

## Paper and counting
No paper-import implementation. Use statement-versioned sheets and a restricted ledger, retain originals, and reconcile matches manually. Never count notifications as supporters or sum both channels as unique people before deduplication. Prior-paper is only a matching clue. Separate resident/other and pending duplicate counts. Do not email automatically from paper signatures without separate authorization.

## Privacy
No public signer list; admin view excludes emails; sender omits signer email/account ID. Public-records disclosure warning shown. Final retention schedule and correction/withdrawal workflow must be established before launch. Historical government records cannot be recalled. Do not expose scans/contact data. A retention period in the review is only a proposed organizer policy, not a timer.

## Verification
npm run db:generate (after schema edits only)
node tests/mail.cjs
node tests/validation.cjs
python tests/database.py
npx tsc --noEmit
node <Sites plugin root>/scripts/build-site.mjs
Use the maintained Sites source workflow for packaging and deployment. Migration history is append-only. Provider tests mock all network requests.
