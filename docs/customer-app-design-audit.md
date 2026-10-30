# Customer app mobile design audit — 2026-10-30

Scores are heuristic review scores, not usability-study results. **1** means the task cannot be completed or understood, **5** means usable with clear friction, **8** means polished and reliably testable, and **10** requires validated use with customers and real integrations. The prior `/app` had brand cards and event tickets in one long page; the new shell was checked in a browser at 375, 390, 430, 768, and 1440 CSS pixels. The preview journeys were exercised to their review states. Real mobile device and assistive-technology testing remains.

| Screen | Hierarchy | Density | Touch | Navigation | Motion | Accessibility | Conversion | Recovery | Performance | Consistency |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Previous `/app` | 5 | 4 | 6 | 4 | 3 | 6 | 3 | 5 | 7 | 5 |
| Home | 7 | 7 | 7 | 7 | 6 | 7 | 5 | 6 | 7 | 7 |
| Explore | 7 | 7 | 7 | 7 | 6 | 7 | 5 | 6 | 7 | 7 |
| Activity | 7 | 7 | 7 | 7 | 6 | 7 | 4 | 6 | 7 | 7 |
| Account | 6 | 6 | 7 | 7 | 5 | 6 | 5 | 6 | 7 | 6 |
| Pearl & Leaf preview | 8 | 7 | 8 | 8 | 7 | 7 | 4 | 6 | 7 | 8 |
| Parking preview | 8 | 8 | 8 | 8 | 7 | 7 | 4 | 6 | 7 | 8 |

## Why the scores are bounded

- The Home screen has one dominant visual route and four compact secondary routes. Production copy does not promise unbuilt ordering or parking. The next lift is real menu and booking availability.
- Explore keeps healthcare outside retail interests. Floor, hours, and contact data are not shown until verified.
- Activity retains real QR tickets and honest empty states. Its value grows when actual orders and passes can be attached.
- Account has working email OTP but needs a dedicated pass for profile editing, provider linking, sign-out feedback, and large-text layouts.
- The first preview pass made Pearl & Leaf and parking look like the same form. It also put the main task below the first mobile screen and left the app bottom navigation in the way. The revised Pearl & Leaf journey uses the approved brand asset, product photography, and a menu-first layout. Parking opens directly to date, arrival, and duration. Both now have compact progress, editable earlier inputs, visible disabled states, and no false purchase confirmation. Their conversion scores are intentionally low because payment is inactive.
- Motion uses short step-entry, count-change, press, and selection feedback, with `prefers-reduced-motion` support. Sheets and confirmation motion are deferred until those functions exist.

## Design rules applied

- Four stable top-level destinations with text labels and safe-area padding. This follows [Apple’s tab-bar guidance](https://developer.apple.com/design/human-interface-guidelines/tab-bars) as a design reference for a web app, not a claim of native iOS compliance.
- Visible focus, semantic controls, and at least 48 CSS-pixel primary controls. [WCAG 2.2 AA target size](https://www.w3.org/TR/WCAG22/#target-size-minimum) is a 24 CSS-pixel minimum with exceptions; 48 pixels here is our more generous product choice.
- Sample pickup and parking review screens avoid hidden prices, forced add-ons, and fake urgency. [Baymard’s checkout research](https://baymard.com/blog/checkout-flow-ux-optimization) informs the emphasis on clear review and low-friction steps.

## Remaining design validation

The revised previews were checked in a browser at 320, 375, 390, 430, 768, and 1024 CSS pixels. Both sample journeys reached review, images loaded, and no page overflow or browser exceptions appeared. Test screen readers, keyboard-only journeys, 200% text zoom, slow network, authenticated ticket access, and real iOS/Android safe areas. Re-score after an approved menu and parking rules exist; do not infer checkout quality from the preview alone.
