# DM Plaza careers — setup and operations

## Current architecture

The public careers site is part of the `Dhanmondi-Plaza/dmplaza` Next.js app deployed as the Vercel `dmplazahome` project. Public URL: https://www.dhanmondiplaza.com/careers. The staff link at `/careers/admin` redirects to DM Plaza OS; this website has no separate admin account or applicant inbox.

The shared Supabase project is `ymjfucolxwutiwaneakm`. DM Plaza OS manages `hiring.jobs`, `hiring.applicants`, and `hiring.applications`. The public site reads listed jobs through `os_api.list_careers_jobs_v3`. Submitted application data is saved to `hiring.applications`; PDF files go to the private `hiring-resumes` Storage bucket. `private.careers_intakes` temporarily holds submission data for safe retries. The public site never receives the Supabase secret key.

The roles are already published. **Actual submissions remain disabled** until the server credentials, origin, and end-to-end intake check are complete. The application form requires a PDF résumé. PDF files together may total up to 3 MB; the request cap leaves separate room for form answers. A visible public hiring process comes from `hiring.jobs.public_hiring_process`; staff can update it through the existing `os_api.save_hiring_job` patch API. The DM Plaza OS job editor may need a field added before nontechnical staff can edit that copy.

## Make submissions live

1. Apply `supabase/migrations/20261011010000_careers_process_and_retention.sql` to the shared Supabase project. Check that the new public job RPC returns listed roles and that applicant tables and the `hiring-resumes` bucket remain private. Do not apply the old standalone `20260928014013_careers_portal.sql` migration; it targets an abandoned data model.
2. In the Vercel **dmplazahome** project, set these server-side Environment Variables for Production and the intended Preview environments: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ORGANIZATION_ID`, `SUPABASE_SECRET_KEY`, `CAREERS_RATE_LIMIT_SECRET` (at least 32 random characters), `CAREERS_ORIGIN=https://www.dhanmondiplaza.com`, and `OS_ORIGIN`. Use the shared Supabase project's **secret** API key for `SUPABASE_SECRET_KEY`. Do not prefix it with `NEXT_PUBLIC_` or commit it. Follow `.env.example` for names.
3. Leave `CAREERS_APPLICATIONS_ENABLED=false` while deploying and checking the public job listings, job details, and hiring process. Confirm the canonical HTTPS URL matches `CAREERS_ORIGIN` exactly. The apex-domain redirect must send applicants to `www` before they submit.
4. On a controlled preview with its own correct `CAREERS_ORIGIN`, set `CAREERS_APPLICATIONS_ENABLED=true`. Submit one clearly marked fictional application with a PDF and long answers. Confirm the receipt, exactly one record in `hiring.applications`, its linked `hiring.applicants` record, private file upload, and visibility to an authorized DM Plaza OS hiring user. Retry the same request to check idempotency. Remove the test candidate and its file through a reviewed admin process afterward.
5. Set `CAREERS_APPLICATIONS_ENABLED=true` for Production and redeploy. Submit and verify one controlled live test, then confirm the form works on mobile and that new applicants are visible in DM Plaza OS. Do not send real applicant information into a preview environment.

## Privacy and maintenance

Run `node scripts/cleanup-careers-intakes.mjs` from a trusted shell with `SUPABASE_URL` and `SUPABASE_SECRET_KEY` set. It defaults to a dry run. Review the IDs, then run with `--execute`. Run this at least weekly. It removes abandoned PDF uploads through the Storage API before purging reserved intakes older than two days. It also clears duplicate completed-intake payloads after 30 days, while preserving the canonical applications and attached resumes. The intake row retains non-content IDs and a purge timestamp. The command handles 100 intakes per run; repeat until the dry run shows zero. Never delete directly from `storage.objects`.

This retention procedure covers only transient intake copies. A separate business/legal decision is still needed for how long to retain canonical applicant records and their resumes; the cleanup command does not delete them.

## Verification

Run `npm run build` before release. Check `/careers`, at least one `/careers/[slug]`, `/careers/admin`, the resume upload, and the application receipt. With intake disabled, applicants should see “Applications opening soon” and no usable submission form. All eight currently listed roles should still appear with the correct hiring steps and no private interview notes.
