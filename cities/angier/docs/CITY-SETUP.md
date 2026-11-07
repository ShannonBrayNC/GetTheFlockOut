# No More Flock — separate city deployments

Each participating city is a separate Sites project, subdomain, D1 database, administrator and recipient selection. Do not route submissions between cities or reuse Angier's database/hosting identity in a new city deployment.

## Configure a new city

1. Create a new Sites project with a new database. Copy the source template without Git identity, `.openai/hosting.json`, credentials, local runtime data or existing signatures. Register the new project and bind its own database; apply the schema migrations.
2. Edit `app/campaign.ts` before publishing. Set city/state, slug, hostname, government name, sender name/address, public organizer contact, monitoring recipients, and the full official list. Use stable, unique official IDs. Verify addresses against the new city's official directory. Never keep Angier officials as defaults for another city.
3. Replace the local petition, petition version and consent version in `app/public-copy.ts`. Review all local copy, evidence, source documents, residency wording, officials' statements and URLs in `app/petition.tsx` and `app/education.tsx`; Angier evidence is not a statewide template. Set metadata in `app/layout.tsx`.
4. Configure runtime secrets on the new Site: `ADMIN_EMAIL`, `ORGANIZER_CONTACT`, `MAIL_FROM` and `RESEND_API_KEY`. `MAIL_FROM` should match the sender name/address in the city config. Each Site can use its own domain-scoped sending key. Keys are never included in source/client code.
5. Bind the city's subdomain, then add the DNS records returned for that exact project. Do not copy another site's verification tokens.
6. Run `node scripts/check-campaign.cjs`, mail/validation checks and the production build. Verify the local label, displayed official list, monitoring disclosure and sender.
7. Test an explicitly labeled email to a controlled organizer inbox; do not create fake petition signatures or send test petitions to officials. Then validate actual authorized submissions and provider delivery events.
8. Add the new city's published campaign link to the statewide tracker only when it is ready.

## Address examples — reserved configuration, not deployed sites/mailboxes

| City | Website | Sending identity |
|---|---|---|
| Angier | angier.nomoreflock.org | angier@nomoreflock.org |
| Apex | apex.nomoreflock.org | apex@nomoreflock.org |
| Holly Springs | hollysprings.nomoreflock.org | hollysprings@nomoreflock.org |

A verified `nomoreflock.org` sending domain can support these From identities. Verification and an outgoing identity do not create an inbox or email forwarding. Configure inbound mail separately if replies must reach those addresses.

Public settings are compiled per deployment. Changes require a build/deploy. Officials may be selected in the authenticated organizer dashboard; changing the official address list or monitoring addresses requires updating this city's configuration and reviewing consent. A notification's exact provider payload is persisted on first attempt so retries keep their original recipients. Do not repurpose an existing city's live database for a different campaign.

## Current email status

Angier domain verification was shown as successful by the organizer. API key configuration and a controlled delivery test are still pending. Monitoring copies do not establish that the official received or read a message. Each official notification gets its own monitoring copy.

## Residency notification gate
Official notifications require a municipal-residency declaration, exact city match (case-insensitive/trimmed) and a ZIP in campaign.localZipCodes. Set the ZIP list for each city during setup. ZIP and city are only consistency checks; they do not establish municipal boundaries. Residency remains self-reported. Other supporters are stored with resident=0 and no delivery rows. The mailer rechecks saved records and cancels ineligible queued/retry records with not_local_resident before any network call. Tests to monitoring inboxes remain available independently. Previously sent emails cannot be recalled.
