# No More Flock operations — 2026-11-06

## Before sharing
Check /api/petition for signingReady (city sites). Verify the native and custom URLs. Save sender secrets and republish to apply them. New local signatures enter pending_review. Verify municipal residency using a reliable record or direct confirmation; record the method, without collecting sensitive identity numbers. Only then approve originally authorized notifications. Nonresidents and Other City never enter an official email queue.

## Email maintenance
Owner-private operations controller calls /api/maintenance using MAINTENANCE_TOKEN. Each city uses a database lease, small batches and delay. Provider 429/5xx responses back off; retries use the stored exact payload and original idempotency key, stop after 23 hours from the first attempt and require manual review thereafter. Do not reset or invent idempotency keys for ambiguous sends. Initial form submission does not send messages. Tests contact only the configured monitoring inbox. Email processing remains dependent on the scheduler being enabled.

## Webhooks — external setup required
Create a Resend webhook for https://CITY.nomoreflock.org/api/webhooks/resend (use the working native origin if the custom domain is not active). Select email.delivered, email.bounced, email.delivery_delayed, email.failed, email.suppressed and email.complained. Enter its unique signing secret as RESEND_WEBHOOK_SECRET in that city Site's environment and republish. The receiving endpoint verifies the raw-body HMAC, five-minute timestamp tolerance and event-id deduplication. Do not treat a delivered event as proof of reading. Review to/BCC scopes in the provider before claiming a particular recipient received a message. Sending-only keys cannot create provider webhooks; use your Resend dashboard or an appropriately authorized admin key outside this public Site.

## Records, privacy and withdrawal
Exports are paginated by offset=0,500,1000... until nextOffset is null. Download signatures, deliveries, provider events and audit pages. Do not publish private exports. Withdraw first to cancel unsent notifications. A message already in flight may still reach the provider and cannot be recalled. Active-store erasure is a separate irreversible confirmed action. Review backup copies and provider-held records before stating that deletion is complete. Review active petition records within 90 days after closure, documenting any accountability hold. Other City inactive records require review after 12 months. No automatic destructive purge runs.

## Encrypted backups and recovery
Each project has isolated R2 storage and BACKUP_ENCRYPTION_KEY (AES-256-GCM). Maintenance writes paginated encrypted objects and an encrypted manifest only after every part passes readback/decryption. Store the recovery key securely in your password manager, separate from downloaded backups. Keep a copy of the schema migrations and exported evidence. Never rotate the key without retaining the old key for existing backups.

Download all parts of a selected manifest from the authenticated admin backup URLs. Run scripts/restore-backup.py into a NEW isolated SQLite database, using the project's drizzle directory and recovery key file. The script refuses to overwrite an existing database and disables restored notification queues. Compare table counts, references and timestamps. Never import a restored queue into an enabled sender without reconciling accepted, withdrawn and ambiguous deliveries. A scheduled readback check is not a production restore test.

## Maintenance source
The statewide repository stores canonical shared city code in shared-city/. Run scripts/check-shared.py against the project workspace before publishing future template changes. Campaign configuration, consent history, migrations, evidence and databases remain city-specific. Existing migration files are immutable.
