# SetuAI Editorial Studio

This is a standalone Sanity Studio for SetuAI's future editorial work.

- Project ID: `c243kj7a`
- Dataset: `production`
- Local Studio URL: `http://localhost:3333`
- Website app: `../web`

Run:

```bash
npm install
npm run dev
```

The Studio stays separate from the website. Do not add an embedded `/studio`
route to the Next.js app. The public site currently uses the custom SetuAI
admin and Upstash as its content source of truth. Do not set
`SANITY_CONTENT_ENABLED=true` until the dataset has been deliberately
populated, reviewed, and a migration plan has been approved.

Deploy schema:

```bash
npm run schema:deploy
```
