# DM Plaza website compliance change process

This is an operating checklist for the current pre-opening homepage and careers portal. It is not a substitute for counsel's review of the final public notices. Do not describe an item as live until it has been verified in production.

## Before publishing a site change

1. Check every factual public claim against its current owner. The main site should say the opening date will be announced, and Meridian Hill should advertise **planned capacity of up to 120 guests per floor**, subject to final layout and approvals. Do not restore a combined capacity or new opening date without written confirmation.
2. Confirm that English, Bengali, Spanish, and Simplified Chinese show the same material facts and form choices. Check mobile and desktop views, keyboard access, and links.
3. Check every newly added third-party script, font, form, embed, and analytics tag against the privacy and cookies notice. Nonessential analytics must stay off until the visitor opts in.
4. Check the source and usage rights for every new photo, illustration, font, testimonial, and video. Keep the license or permission record with the asset.
5. Before adding a payment, reservation deposit, ticket, order, or subscription flow, publish transaction-specific terms, all mandatory charges, and cancellation/refund rules beside that flow.

## Opening-updates list

- The homepage sends names, email, optional interest/message, and separate `email_consent` and `sms_consent` values to the server-side GHL webhook. A mobile number is sent only for SMS opt-ins. Verify a test contact and both consent flags in GHL after each deployment; do not add a test address to a real campaign.
- In GHL, branch email and SMS marketing enrollment on their matching `yes` consent flags. Check that `no` never enrolls a contact.
- Do not send a marketing campaign until the sending tool has a functioning unsubscribe link, a suppression list, and DM Plaza's valid postal address in the email template. Test opt-out end to end before the first send.
- Remove a contact from GHL when the person opts out or requests deletion, subject to any narrow record needed to prevent re-sending. Do not reimport suppressed contacts.

## Privacy and applicant-data requests

1. Route website and email-list requests from `info@dhanmondiplaza.com`; route hiring requests from `admin@dhanmondiplaza.com`. Record the request date, type, assigned owner, and completion date in a restricted internal log. Do not copy résumés or sensitive details into that log.
2. Verify the requester using the submitted email address or another proportionate method. Do not ask for government ID by default.
3. Identify all relevant records: Formspree signup; the hiring application in DM Plaza OS/Supabase; any uploaded PDFs in the private `hiring-resumes` bucket; and any connected email-sending list. Check whether a provider has additional retrievable data tied to the person.
4. Before deletion, check applicable hiring-record preservation duties, active disputes, and any other legal hold. The applicant notice currently says records may need to be retained for at least one year where applicable. Do not promise immediate erasure of records subject to a hold.
5. Export, correct, delete, or restrict each eligible record as requested. Check both the application record and its uploaded files; deleting only one is incomplete. Confirm the outcome to the requester without exposing another applicant's information.
6. Track jurisdiction-specific response periods and rights if DM Plaza becomes subject to CCPA, GDPR, or UK GDPR. Have counsel approve the retention schedule, notice language, and any cross-border transfer terms before claiming compliance with those regimes.

## Still to decide before expansion

- Counsel-approved website terms and transaction-specific refund/cancellation rules.
- A written applicant retention schedule and a named DM Plaza OS owner for deletion/export requests.
- An outbound email platform and tested unsubscribe/suppression workflow.
- A vendor/data-flow register for Vercel, Supabase, Formspree, Google Analytics, Google Fonts, and future brand-site integrations.
- Manual WCAG AA review of the homepage, careers pages, and future customer app.
