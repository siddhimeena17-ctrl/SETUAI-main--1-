# Admin Entry

This folder is the custom editor/operator dashboard.

The main editing workflow uses structured Upstash-backed screens so non-technical editors know exactly what they are changing.

Sanity remains available as a standalone Studio in the root `studio/` folder, but the public admin experience should stay focused on this custom dashboard.

Admin access is private. `/admin/login`, `/admin/setup`, `/admin/2fa`, and `/admin/2fa/setup` are the only public admin routes; every dashboard page calls the server-side admin session verifier before reading CMS data.
