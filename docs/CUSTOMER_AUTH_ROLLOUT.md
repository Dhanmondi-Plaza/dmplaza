# DM Plaza customer identity rollout

The canonical customer ID is the Supabase Auth user UUID. `os_api.customer_profiles` keeps existing brand interests and now supports an optional display name. The additive migration `20261021053709_customer_identity_foundation.sql` adds append-only marketing consent events, deletion requests, and a read-only-to-customers external identity mapping. No account is merged by name, email, phone, or Toast data.

## Current release boundary

- Email one-time-code sign-in and returning web sessions use the existing Supabase Auth project. Confirm that the Supabase email template sends `{{ .Token }}` as a six-digit code and test delivery, expiry, wrong-code rejection, sign-out, and restoration with a controlled inbox before calling it fully verified.
- Apple, Google, and SMS controls are feature-gated off by default. Enable each only after provider configuration and a real-device end-to-end test. `DM_CUSTOMER_APPLE_ENABLED`, `DM_CUSTOMER_GOOGLE_ENABLED`, and `DM_CUSTOMER_SMS_ENABLED` are server-side flags; set one to `true` only after its provider passes tests.
- Manual OAuth identity linking is separately gated by `DM_CUSTOMER_LINKING_ENABLED`. Enable Supabase manual linking and require a recent authentication step before turning this on. If an identity is already attached to another account, stop and use a support-reviewed recovery process. Never merge records automatically.
- Phone number addition to an existing account is withheld. Supabase's current `phone_change` behavior can be ambiguous when stale pending changes share a number. Resolve and test that case before offering phone linking. Keep SMS sign-in off until the linking and duplicate-account policy is ready.
- The web client uses Supabase's supported persisted session and token refresh. A native iOS/Android client and secure OS keychain storage do not exist in this repository, so native session acceptance tests remain open.

## Provider setup and verification

1. In Supabase Auth, configure a production email sender, six-digit OTP template, redirect allowlist for `https://www.dhanmondiplaza.com/account`, OTP expiry, rate limits, and CAPTCHA. Test with a controlled inbox without logging codes.
2. Configure Apple and Google providers in Supabase Auth and their developer consoles. Register the exact Supabase callback URL and site domain. For Apple, configure private relay delivery from the approved sending domain; test Hide My Email without requiring a personal email.
3. For SMS, configure an approved provider, US delivery, spending alert/cap, CAPTCHA, per-IP and project limits, OTP expiry, resend limits, and monitoring. Test valid, invalid, expired, and repeated attempts before enabling the flag. The browser has a 60-second resend cooldown and five-attempt UI limit; provider-side controls remain mandatory.
4. Test email and each enabled provider on web and supported mobile browsers. Native Apple sign-in and native secure token storage need a separate iOS/Android client before they can be claimed.
5. Verify RLS using two controlled customer accounts. Each must read and change only its own profile, consent history, and deletion requests; anonymous access must fail. Test account deletion-request triage with an administrator.

## Product integration still required

The customer app preview still stores exploration progress on one device and is blocked from production. There are no customer event-ticket, QR check-in, purchase, or loyalty tables in the current production database. Build one actual event registration flow, then persist its ticket under the Auth user UUID and return users to it after authentication. Do the same for authenticated ordering when write access and payment processing are approved. The Toast mapping table must receive rows only from a verified authenticated order or staff-reviewed linkage; unmatched transactions stay unmatched. Marketing consent records must be connected to campaign suppression before using them to send messages. Deletion requests require a staff processing workflow and retention review.

Do not turn on a provider or claim the full journey is live based on the presence of a button or table alone.
