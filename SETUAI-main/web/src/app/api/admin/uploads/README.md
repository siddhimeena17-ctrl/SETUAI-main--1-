# Admin Uploads API

Protected route for CMS image uploads from the custom admin dashboard.

The handler requires an authenticated admin session, accepts only image multipart uploads, validates basic file signatures, stores approved files in the Upstash-backed CMS media store, and returns the public `/api/media/[id]` path that should be stored in CMS image fields.
