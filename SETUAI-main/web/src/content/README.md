# Public Content Baseline

`site.ts` contains the active public baseline, public route inventory, and
chatbot grounding facts. Do not add projected impact, unsupported partner
claims, program outcomes, or legal claims without evidence.

`editable-site.ts` contains the editable homepage, navigation, footer, and
visual settings baseline used by the custom admin and Upstash source of truth.

The standalone Sanity Studio is intentionally not a public runtime override
unless `SANITY_CONTENT_ENABLED=true` is enabled after a reviewed migration.
