# SetuAI Production Readiness & Security

This repo contains a public Next.js marketing site, a separate admin dashboard, and server-side API routes for CMS content, uploads, chatbot replies, form submissions, subscribers, and update emails.

## Implemented In Code

- Admin access requires password verification plus authenticator-app TOTP.
- Admin passwords use Node `scrypt` with per-password salts.
- Admin sessions are signed, HttpOnly, same-site cookies backed by Upstash session records.
- Admin sessions are bound to hashed IP and user-agent context.
- Admin setup supports a private bootstrap token and optional email allowlist.
- Admin API mutations require an authenticated admin session and same-origin request checks.
- Admin security events and admin API mutation attempts are logged with hashed IP/user-agent identifiers.
- Audit records are chained with SHA-256 hashes for tamper-evident integrity checks.
- Public chat, form, and update subscription endpoints are rate-limited.
- Public forms sanitize and length-bound submitted text and include a honeypot field.
- Update email sending fails closed unless `UPDATES_WEBHOOK_SECRET` is configured.
- Global security headers include CSP, frame denial, MIME sniffing protection, referrer policy, permissions policy, and production HSTS.
- Secrets are read from environment variables and `.env*` files are ignored by git.
- CI runs lint, typecheck, and production build for the web app.
- Dependabot watches web/studio npm dependencies and GitHub Actions.

## Required Deployment Setup

Set these environment variables in the hosting provider, never in committed files:

- `NEXT_PUBLIC_SITE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_SESSION_SECRET`
- `ADMIN_BOOTSTRAP_TOKEN`
- `ADMIN_ALLOWED_EMAILS`
- `AI_GATEWAY_API_KEY` or `VERCEL_AI_GATEWAY_API_KEY`
- `RESEND_API_KEY`
- `UPDATES_WEBHOOK_SECRET`
- `UPDATES_FROM_EMAIL`
- Sanity variables if Sanity remains connected

Generate strong random values:

```bash
openssl rand -base64 48 # ADMIN_SESSION_SECRET
openssl rand -base64 32 # ADMIN_BOOTSTRAP_TOKEN
openssl rand -base64 32 # UPDATES_WEBHOOK_SECRET
```

## Verification

From `web/`:

```bash
npm run verify
```

This runs ESLint, TypeScript, and `next build`.

## Not Fully Solvable In Code Alone

- GDPR, HIPAA, COPPA, and nonprofit/privacy compliance require legal review, published policies, consent language, subprocessors/DPAs, retention rules, and operational procedures.
- HTTPS/TLS certificate rotation is handled by the production host, but must be verified after deployment.
- Disaster recovery requires Upstash export/backup policy, restore testing, domain recovery access, and documented owner access.
- Load, stress, chaos, and resilience testing require a deployed staging or production-like environment.
- Formal accessibility certification requires manual assistive-technology review in addition to automated linting.
- Full e2e regression coverage should be added once final page flows and admin workflows are frozen.
