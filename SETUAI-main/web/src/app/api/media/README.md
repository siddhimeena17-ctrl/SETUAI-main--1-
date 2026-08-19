# Public Media API

Serves CMS-uploaded images by media ID.

Admin uploads are stored in the Upstash-backed CMS media store. Public pages can use the returned `/api/media/[id]` path as an image source without exposing admin-only routes or environment secrets.
