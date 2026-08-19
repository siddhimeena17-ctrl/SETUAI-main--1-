# Update Subscription Confirmation

The confirmation route activates an Upstash subscriber only after the visitor
uses the random token sent by email. It redirects back to `/updates` and never
exposes subscriber data in the browser.
