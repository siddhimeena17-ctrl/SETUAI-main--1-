# SetuAI Website App

This is the Next.js app for SetuAI's public website. Do not claim
registration, tax status, confirmed delivery, impact, partners, or student
outcomes unless an authorized editor has verified and published them.

The custom `/admin` workspace and Upstash store are the public site's content
source of truth. The Sanity Studio is intentionally separate in `../studio`.
It is not queried by the public site unless `SANITY_CONTENT_ENABLED=true` is
set after a reviewed migration.

The assistant defaults to Vercel AI Gateway's lowest-cost available text model,
`amazon/nova-micro`. A valid gateway key and Vercel AI Gateway billing
activation are required for live responses. Hindi public content remains gated
until editorial review is complete.

Run locally:

```bash
npm install
npm run dev
```

## Application and inquiry forms

Public inquiry/application forms post through `/api/forms` to the SetuAI-owned
Formspree project: https://formspree.io/projects/3117901080550178574/overview.
`src/lib/formspree.ts` maps the eight form types to their public Formspree IDs.
Notification recipients are configured in Formspree; every created form targets
`setuai.edu@gmail.com`. No API secret or Vercel environment update is needed for
this submission path. The validated applicant email becomes Reply-To, and the
server supplies the recognizable subject, consent, reference, and source fields.

Review new applications in Formspree. Legacy Redis submissions remain in the
protected SetuAI admin. CMS content and admin authentication still use Redis.
Newsletter requests keep the separate confirmation/unsubscribe system; inquiry
success does not imply a newsletter subscription or confirmed inbox delivery.

The local per-instance rate limit and client submit lock run independently of
Redis, alongside Formspree's default Formshield spam filtering and provider limits.
Concurrent requests and 15-minute retries coalesce on a warm server instance.
Cross-instance retries can produce duplicates: Formspree has no documented durable
idempotency API, so every record includes a stable `submission_id` for review.
Network failures are not automatically retried or sent through a second provider.

The current free Formspree tier has an account-wide allowance of 50 submissions
per month and 30 days of submission history. Check usage and export applications
regularly in Formspree; upgrading is an account-owner action.
