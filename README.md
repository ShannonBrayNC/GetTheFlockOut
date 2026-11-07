# GetTheFlockOut / No More Flock

Complete source snapshot for the North Carolina community petition network.

## Projects

- cities/angier: Angier
- erwin-site, fv-site, holly-springs-site, apex-site, wilmington-site, selma-site, wake-forest-site: independent community petitions
- other-city-site: interest registration; no official emails
- nc-flock-tracker: statewide map, directory, shared-source checks
- operations-site: owner-private monitoring and encrypted backups

See each project's README.md, OPERATIONS.md, research.json and tests. This repository is source control, not a replacement for Sites runtime storage.

## Running

Within a city directory, install with npm ci, validate with node scripts/check-campaign.cjs, run tests/*.cjs except load.cjs, and run npx tsc --noEmit. Build with npm run build. D1 schema migrations are in drizzle/. Native Sites helpers are required for source synchronization and production packaging; preserve .openai/hosting.json identities. Do not publish the operations site publicly.

## Privacy and operation

No runtime secrets, signer records, private backup objects or dependency folders are included. Configure ADMIN_EMAIL, MAIL_FROM, ORGANIZER_CONTACT, RESEND_API_KEY, MAINTENANCE_TOKEN and BACKUP_ENCRYPTION_KEY in each Site's secret settings. Configure RESEND_WEBHOOK_SECRET for authenticated delivery events. Never commit values. Official notices require declared local city/ZIP, consent and organizer residency approval. Private contact email/telephone are excluded. Monitoring copies go to shannonbraync@gmail.com. Other City never contacts officials.

## Readiness review — November 7, 2026 UTC

Wilmington, Selma and Wake Forest were redeployed after their sender keys were saved. The private dry health check reports all three senderReady=true; no notifications were processed or released. All nine configured communities passed health checks. Stored encrypted backups passed readback/decryption checks; production restore was not performed. Provider acceptance is not inbox delivery. Webhook configuration and a monitoring-only inbox test remain separate verification steps. No automatic queue release is authorized by scheduled health checks.

Statewide entries distinguish verified cancellations from reported citizen efforts. Wilmington's city policy is distinct from New Hanover County. Selma and Wake Forest have no confirmed town cancellation in this snapshot. Review each research register for dated evidence and unresolved questions.

## Deployment checklist

1. Confirm municipal scope and official addresses against current primary sources.
2. Configure secrets server-side, deploy the saved version, verify domain/TLS and /api/petition readiness.
3. Send only a clearly labelled monitoring-inbox test when authorized; inspect provider logs and inbox separately.
4. Verify residency approval, withdrawal and duplicate prevention with mocked tests; never create fake production signatures.
5. Verify encrypted backups and perform recovery only into an isolated database with sending disabled.
6. Keep automated maintenance dry-run only; do not release queues through health jobs.

Each city's .openai/hosting.json identifies its existing deployment. Changes to this GitHub repository do not automatically redeploy Sites. Export changes back through the Sites source workflow and retain exact source/build provenance.
