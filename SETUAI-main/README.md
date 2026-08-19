# SetuAI Website

SetuAI is an active AI literacy initiative building practical learning with
schools, educators, and community partners. This monorepo contains its public
Next.js website and a separate Sanity Studio. The public site should describe
what SetuAI does today, while keeping public claims grounded in reviewed
content and clear operational standards.

## Source of Truth

- `web/`: public Next.js 16 website and protected custom admin workspace.
- `web/src/lib/cms.ts`: Upstash-backed public content source of truth.
- `studio/`: standalone Sanity Studio for future editorial work. It is not
  queried by the public site unless `SANITY_CONTENT_ENABLED=true` is set after
  a deliberate, reviewed migration.

## Content Rules

- Publish only verified facts, dated updates, approved images, and reviewed
  learning materials.
- Keep proposed work, active pilots, and completed outcomes visibly distinct.
- Do not publish student names, school names, personal data, tax claims, or
  impact metrics without documented permission and evidence.
- The custom admin defaults new pages and learning pathways to drafts.

## Commands

```bash
npm run dev:web
npm run dev:studio
npm run lint:web
npm run typecheck
npm run build:web
```

## Required Production Environment

Set these in Vercel or another private deployment environment. Never commit
real values.

```bash
NEXT_PUBLIC_SITE_URL=https://your-confirmed-domain.example
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
ADMIN_SESSION_SECRET=at-least-32-random-characters
ADMIN_BOOTSTRAP_TOKEN=a-long-one-time-setup-token
ADMIN_ALLOWED_EMAILS=owner@example.org
AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=amazon/nova-micro
RESEND_API_KEY=...
UPDATES_FROM_EMAIL=updates@your-verified-domain.example
INQUIRY_FROM_EMAIL=inquiries@your-verified-domain.example
INQUIRY_NOTIFY_TO=team@your-verified-domain.example
UPDATES_WEBHOOK_SECRET=...
```

Optional, standalone Sanity configuration is documented in `studio/README.md`.

## Assistant and Language Gates

- The public assistant is configured to use `amazon/nova-micro`, the lowest-cost
  text model currently available through this project's Vercel AI Gateway
  account. The key must be active and the Vercel account must have AI Gateway
  billing activation completed before live replies are available.
- Hindi is intentionally held behind `NEXT_PUBLIC_HINDI_CONTENT_REVIEWED` until
  a qualified Hindi reviewer has approved the editorial content. Do not claim a
  complete Hindi edition while untranslated or unreviewed pages remain.

## Verification Before Launch

Run the build and type checks, configure the actual domain and mailboxes,
complete admin bootstrap and authenticator-app enrollment, review every public
claim, complete legal/policy review, and test the confirmed email flow with a
non-production subscriber. Confirm that AI Gateway billing is active before
announcing the public assistant, and complete Hindi editorial review before
enabling the Hindi edition.

## Next.js 16 Note

Read `web/node_modules/next/dist/docs/` before changing routing, metadata,
route handlers, caching, or file conventions. In this version, App Router
`params` and `searchParams` are promise-based.
