# Shared Library

Small helpers for SEO, URLs, class names, structured data, the Upstash-backed CMS, and admin authentication live here.

Keep this folder framework-aware but content-agnostic.

`cms.ts` is server-only in practice. It stores structured admin dashboard content in Upstash Redis.

`admin-auth.ts`, `admin-store.ts`, `admin-session.ts`, and `totp.ts` protect the custom dashboard with password auth, signed HttpOnly sessions, Upstash-backed session records, rate limits, and authenticator-app TOTP verification.
