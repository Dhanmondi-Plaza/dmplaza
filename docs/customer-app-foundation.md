# DM Plaza customer app: current foundation and activation path

## What exists in this branch

- `/app` has four destinations: Home, Explore, Activity, and Account. Existing email OTP sign-in, saved brands, and published free-event tickets remain on the same Supabase client and `os_api` tables.
- `/app/preview` contains interactive Pearl & Leaf pickup and parking journeys. It is available only in development, a Vercel preview deployment, or when `CUSTOMER_APP_PREVIEW_ENABLED=true`. Its items and vehicle labels are samples. It does not submit, hold inventory, charge, or create a customer record.
- The directory links to the existing Desi Dragon, Pearl & Leaf, Nature’s Bazaar, and Meridian Hill microsites. Healthcare appears separately and does not enter the retail save or offer flow. Saireen Medical has no verified public detail page yet.

## Data and integration audit

| Area | Existing source of truth | Current limit |
| --- | --- | --- |
| Identity | Supabase Auth user ID and `os_api.customer_profiles` | Email OTP is implemented; Apple, Google, phone, verified linking, and account deletion are not complete. |
| Free events | `os_api.customer_events` and `customer_event_registrations` | No confirmed published event. Existing QR ticket behavior is retained. |
| Hospitality menus and orders | Draft menu records exist elsewhere in DM Plaza OS | No approved public menu, Toast write/payment contract, or live pickup capacity in this app. |
| Parking | Square is the intended payment rail; 21 spaces are the planned initial capacity | No live inventory, rates, operating rules, holds, checkout, or webhook reconciliation. |
| Meridian Hill | Existing microsite inquiry flow | An inquiry is not a reservation, proposal, contract, or deposit. |
| Rewards and visits | No customer app ledger or visit orchestration | Wait for verified transaction attribution and approved earning/redemption rules. |

## Next usable end-to-end slices

1. **Pearl & Leaf pickup:** approve the real menu, modifier/pricing source, pickup rules, Toast permissions, payment handoff, and order webhooks. Then replace sample item selection with the approved catalog and implement one real order through confirmation and failure recovery.
2. **Parking:** approve rates, hours, cancellation rules, numbered-space versus capacity-only allocation, and Square account configuration. Create transactional parking holds with expiration and idempotent payment/webhook processing before enabling checkout.
3. **Other businesses:** add Nature’s Bazaar inventory and substitution handling, Desi Dragon reservation inventory, and Meridian Hill proposal/contract steps only when their operational systems are confirmed.
4. **Shared retention:** attach verified transactions to the immutable Supabase customer UUID, then build the Visit view and a configurable rewards ledger. Keep each merchant’s cart, payment, refund, and fulfillment distinct.

Before any payment or reservation launch, publish the applicable price, fees, cancellation/refund terms, and privacy language next to the action. Test a complete payment failure and retry path, duplicate webhook delivery, inventory concurrency, and account isolation. The preview must never be promoted to a live transaction without those checks.
