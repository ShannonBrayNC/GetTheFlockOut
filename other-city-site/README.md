# No More Flock — Other City

Separate private interest register for communities without an active local page. This is not a petition. No email provider, official recipient list, delivery queue, or messaging integration is present. Registration never sends notifications or automatically becomes a city signature.

Public form requires ChatGPT sign-in, same-origin POST, bounded JSON, validated fields and explicit local-organizing contact consent. Saves name, city/state, county, ZIP, contact email, telephone, message, involvement preference and consent metadata to this project's isolated D1 database. Duplicate account submissions update an existing record. Identity and residency are not verified.

ADMIN_EMAIL is configured separately. Authorized organizer can review grouped city interest and page/export private records in batches of 500 at /admin. Contact permission does not authorize official email campaigns. No RESEND_API_KEY is needed.

Checks: npx tsc --noEmit; node tests/registry.cjs. Tests mock storage and networking and create no live registrations.
