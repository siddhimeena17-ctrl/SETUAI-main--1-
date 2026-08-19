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
