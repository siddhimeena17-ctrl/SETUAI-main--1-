# Admin API

These route handlers power the custom Upstash-backed dashboard.

They are server-only and should never expose raw environment secrets to client code.

Every handler must call `requireAdminApi(request)` before reading request bodies or mutating Upstash. That check validates signed admin sessions, confirms the session still exists in Upstash, and rejects cross-site mutation attempts.
