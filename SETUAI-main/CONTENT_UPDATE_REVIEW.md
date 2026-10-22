# SetuAI content and information architecture update

## What changed

The homepage now introduces the publication effort, “14,000 students reached,” recommendations, chapter applications, and platform beta before the existing mission, learning approach, collaboration map, partnerships, updates, and participation paths. Navigation gives Textbook, Chapters, and Platform direct destinations. The current brand, About/team content, existing URLs, program and update records, authentication, and standalone Sanity Studio are retained.

The textbook and impact destinations retain their original URLs and now use the extended Upstash content model. Extra editorial sections with distinct titles remain visible below the updated pages. Legacy textbook/impact template sections are replaced where they contradict the new publication and reach facts; their stored records remain available to administrators and exports.

Four exact excerpts appear with signatories, roles, scope, letter dates where supplied, and subtle organization-name links. They are labeled as perspectives from recommendation letters for Siddhi Meena discussing the textbook, rather than universal endorsements of SetuAI. No review scores, awards, or sponsorship relationships were invented. Public excerpt PDFs contain the selected words and context; original letters, private contact details, and signatures are not committed or published.

The links were checked against the organizations’ own websites:

- [OneStage](https://theonestage.org/)
- [Learnovate Robotics](https://learnovaterobotics.com/)
- [Indigo Knowledge Prism Foundation](https://knowledgeprism.org/)
- [The Creative Thinkers Forum](https://tctfindia.org/)

The provided letters also document educational adoption/implementation relationships. These appear separately from the existing founding and technology relationships. Projected audiences from the letters were not added to SetuAI’s reach total.

Chapters have program details, support, responsibilities, process, FAQs, and an application. The platform has international-collaboration context and a beta-interest form. Neither form promises automatic acceptance or immediate access. A resources index now points to working material and participation destinations; no unapproved sample or fake book cover/interface is displayed.

All inquiry types route server-side to `setuai.edu@gmail.com`. Notifications use a configured organization-domain sender, validated applicant Reply-To, recognizable subjects, all submitted fields, timestamp, and source page. Provider failures are recorded, surfaced in admin, and retryable. A saved request remains successful when its notification fails; the public UI distinguishes storage from provider acceptance and never claims confirmed inbox delivery.

Submission records use atomic per-record insertion in a Redis hash. Identical payloads receive a durable shared ID, preventing duplicate records across retries/reloads and concurrent requests. Provider idempotency and a notification lock prevent competing sends. Existing legacy submissions remain readable. Newsletter opt-in remains separate, chapter/beta applicants are not subscribed, and returned provider errors no longer count as successful newsletter sends.

## Routes and major files

| Area | Routes | Main implementation |
| --- | --- | --- |
| Public hierarchy | `/` | `web/src/app/page.tsx`, `web/src/components/site-header.tsx` |
| Textbook and reach | `/textbook`, `/impact` | `web/src/app/(site)/[slug]/page.tsx`, `web/src/components/initiative-pages.tsx` |
| New destinations | `/recommendations`, `/chapters`, `/platform` | Corresponding `web/src/app/*/page.tsx` files |
| Resources and partners | `/resources`, `/partners` | Existing route files, `partner-directory.tsx` |
| Content model and migration | `/api/site-content` | `content/initiatives.ts`, `content/editable-site.ts`, `lib/cms.ts`, `lib/initiative-content.ts` |
| Protected editing | `/admin/site-content` | `components/initiative-editor.tsx`, `components/admin-forms.tsx`, protected site-content API |
| Forms and notification recovery | `/api/forms`, `/admin/submissions`, `/api/admin/submissions/[id]/notify` | `content/form-fields.ts`, `components/lead-form.tsx`, `lib/inquiry-email.ts` |
| Consistency and discovery | Metadata, sitemap, chatbot context | `content/site.ts`, `lib/chatbot-context.ts`, `app/sitemap.ts`, `app/api/chat/route.ts` |
| Public letter assets | `/letters/*-excerpt.pdf` | Four files in `web/public/letters/` |
| Automated verification | `npm --prefix web test` | Five Vitest suites in `web/tests/` |

The old generic textbook/impact admin page editor points editors to Full-site content for the current initiative fields. The legacy records are preserved. Blank logo, book-image, sample, screenshot, and platform URL fields remain hidden. New recommendations and partners default to draft/pending; both publication and approval are required for public display. Draft entries and internal source-document fields are stripped from public JSON and client props.

## Published-content handling

`web/src/lib/cms.ts` remains the public source of truth; Sanity is not enabled or migrated.

The `launched-2026-08` public CMS response was read from the live site and replayed against an isolated local Redis test server. The new `literacy-2026-10` read-through migration correctly updated current facts without requiring a production database write.

The migration changes the owner-authorized hero/textbook summary, impact defaults, homepage metadata, general inbox, and navigation. It preserves unrelated copy, visuals, custom navigation destinations, footer links, and original imagery. Existing founding-partner edits initialize the new partner model. Saving through the protected content editor persists the normalized model. Deliberately empty arrays and current-version edits are preserved. Pages, posts, newsletter subscribers, authentication, gallery/media, and historical updates are not reset. Public CMS-backed pages and sitemap render current data rather than a build-time snapshot.

New submission records use `skypa:cms:submissions:records`; legacy `skypa:cms:submissions` data remains in place and is merged by ID for admin review. Notification locks use the existing submission-key prefix. No production Redis keys were edited during this task.

## Checks performed

- Repository lint, TypeScript checking, and Next.js production build pass.
- 23 automated tests across five suites pass: migration preservation, empty-array semantics, draft/approval filtering, safe links, content save/reload/public projection, application validation and pause flags, spam/rate controls, duplicate and concurrent storage, notification routing/Reply-To/escaping, provider/configuration failures, storage/email partial failure, legacy submissions, newsletter confirmation, and unsubscribe.
- All four displayed excerpts were compared against whitespace-normalized text extracted from the original supplied PDFs. All matched exactly. Each public PDF was rendered and visually inspected.
- HTTP checks returned 200 for homepage, textbook, recommendations, chapters, platform, contact, About, Impact, Partners, Updates, Get involved, Schools, Resources, Privacy, Safeguarding, Accessibility, Programs, and all four excerpt PDFs. Sitemap contains the new destinations.
- Browser review at 1440 px desktop and 390 px mobile checked hierarchy, recommendation attribution/links, form labels, and horizontal overflow. New recommendation, textbook, and platform views fit the mobile viewport. Mobile menu navigation to the textbook was exercised with Enter.
- Chapter and beta forms were submitted through the browser to an isolated local Redis mock, with no Resend credentials. Records contained the expected fields/source page, no marketing opt-in, and an honest notification-pending success state. No real emails were sent.
- Existing map typing exposed a baseline lint error; the marker now uses the proper Leaflet type. A broken external footer-logo dependency was removed while retaining the attribution link. The documented Hindi review flag is now enforced so unreviewed partial translations cannot be selected.

## Missing inputs and verification limits

- Actual approved textbook cover, sample spreads, or sample PDF/link.
- Platform URL and approved real screenshot/demo media.
- Separate approved organization logo assets. The supplied letterhead logos were not repurposed without a separate logo asset.
- A letter date for Indigo Knowledge Prism Foundation; the supplied letter does not state one.
- A reporting date and fuller underlying source record for the owner-provided 14,000 reach figure. The source note is editable and currently identifies it as owner supplied.
- Names and agreed scopes of any additional technology partnerships beyond the existing documented Summit relationship.
- Production Resend/sender configuration, private CMS credentials, and a production admin session were not accessible. The connected Vercel team returned no matching SetuAI project. Authenticated production admin editing and actual inbox delivery still require a controlled live check. The local/mock checks are not represented as live email delivery.

These content gaps do not block review or use of the working inquiry/application flows once production storage and email are configured. Missing assets and URLs stay absent rather than displaying placeholders or unsupported availability buttons.

## Exact production configuration

No production environment variables, production content, deployment, or authentication settings were changed.

For the eventual approved deployment, verify in the actual SetuAI project:

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.setuai.org
INQUIRY_NOTIFY_TO=setuai.edu@gmail.com
INQUIRY_FROM_EMAIL="SetuAI inquiries <EXISTING_RESEND_VERIFIED_ORGANIZATION_SENDER>"
RESEND_API_KEY=<existing valid private key>
UPSTASH_REDIS_REST_URL=<existing private CMS URL>
UPSTASH_REDIS_REST_TOKEN=<existing private CMS token>
NEXT_PUBLIC_HINDI_CONTENT_REVIEWED=false
```

Use the already verified Resend sender; do not literally use the placeholder, the applicant address, or a Gmail sender. Keep the existing `UPDATES_FROM_EMAIL`, newsletter secrets, admin/session settings, and AI Gateway settings. `INQUIRY_NOTIFY_TO` is retained for deployment consistency; the application enforces the required Gmail recipient even if an older value remains configured. No secret belongs in source control.

After an approved deployment, send one controlled inquiry, confirm provider acceptance and receipt at `setuai.edu@gmail.com`, check applicant Reply-To, inspect its admin record, and verify retry behavior with a controlled provider failure. Then test a separate consenting newsletter address through confirmation and unsubscribe. A provider-accepted status alone is not proof of inbox delivery.

## Preview instructions and remaining release steps

From the repository’s `SETUAI-main/` directory:

```bash
npm --prefix web ci
npm run dev:web
```

Open the printed localhost URL. Without private Upstash/email configuration the public content renders from defaults, but submissions cannot be saved. Configure private development credentials to exercise the protected admin and actual form storage, or run the non-delivering automated suites:

```bash
npm run lint:web
npm run typecheck
npm --prefix web test
npm run build:web
```

The review branch is `codex/setuai-content-and-recommendations`. No merge or production deployment is part of this delivery. Remaining release gates are review/merge authorization, verification of the actual deployment environment, and controlled live delivery/admin checks. Additional assets and publication/platform destinations can be supplied through the existing protected editor as they become approved.

## Hosted PR checks

GitHub’s Vercel integration generated protected previews after the branch push. The `setuai-main-1` check completed successfully. A correctly rooted `setuai-main-1-n9ew` preview is also linked from the PR. The previews require Vercel team authentication; their page content could not be inspected with the available account.

- [Vercel preview for setuai-main-1-n9ew](https://setuai-main-1-n9ew-git-codex-setuai-content-and-282846-setu-ai1.vercel.app)
- [Alternate Vercel build failure](https://vercel.com/setu-ai1/setuai-main-1-7oov/Ao3LSF9ShHbKY79TdqAdF7dLobEi)
- [Netlify deploy-preview failure](https://app.netlify.com/projects/moonlit-sawine-ef3d3a/deploys/6ad984b6a8ebd98171a84456)

The `setuai-main-1-7oov` and Netlify integrations reported failures. Their causes are unverified because the connected Vercel account lacks access to the `setu-ai1` team and the deployment logs are private. The Vercel CLI also cannot access that scope. Do not interpret passing local checks as passing every hosted check. Review the intended hosting target and the failed integrations before merge/release; production hosting settings were not changed.
