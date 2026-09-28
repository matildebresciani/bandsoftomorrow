## Project context

`bandsoftomorrow` is the new, cleaned-up Payload/Next.js boilerplate for the Bands of Tomorrow exam project. The previous implementation lives in `/Users/matildebresciani/Documents/bands-of-tomorrow-eksamen` and provides code, design, and content references. Both WordPress and the old Payload project are content migration sources. Make changes in this repository unless the task explicitly targets the old project.

The application is a monorepo. The main web application is in `apps/web`, with source code in `apps/web/src`. It uses Next.js, React, TypeScript, Payload CMS, MongoDB through Payload's MongoDB adapter, `next-intl`, Tailwind CSS, and Biome.

## Feature approval workflow

- Implement one feature/checkpoint at a time, including only its necessary wiring. Avoid unrelated refactors.
- Complete the relevant checks before presenting the feature for review.
- Explain what changed, list the changed files, describe how to inspect the result, and report checks and limitations. Provide a suitable review surface such as a diff, CMS example, rendered component, screenshot, or migration report.
- Stop after each checkpoint and wait for explicit user approval before starting the next one. Approval of the overall roadmap does not authorize completing every feature without stopping.
- Requests for adjustments keep the current checkpoint open. Make and verify those corrections before presenting it again.
- If an unplanned feature is required, explain the dependency and revise the sequence with the user before expanding scope.
- The first checkpoint changes only this `AGENTS.md`; application implementation belongs to later checkpoints.

## Current architectural direction

- Keep the codebase organized by domain and responsibility. Follow the existing `collections`, `components`, `lib/field-templates`, `lib/collection-templates`, `lib/utilities`, `i18n`, and `app` structure instead of adding unrelated top-level folders.
- Use the shared collection and field templates where they exist. Keep collection-specific hooks next to the collection that owns them.
- Use English for code identifiers, collection slugs, field names, route definitions, and other canonical configuration. Danish is content/UI translation, not a reason to hardcode Danish strings in application logic.
- Keep both `en` and `da` supported. English is the canonical/primary language for project structure and route configuration, while Danish remains `defaultLocale` for the application. Localized paths and UI strings belong in the locale configuration and message files.
- The Payload database is MongoDB. Keep the model and field naming predictable and reasonably close to the old WordPress REST representation so the database migration can map fields without unnecessary transformations.

## Content model

All editorial articles are represented by one Payload `posts` collection. Do not create separate collections or top-level content routes for interviews, reviews, or weekly releases.

- `posts` is the single collection for interviews, reviews, `ugens-udgivelser`, news, and future editorial post types.
- Replace `post-categories` with `tag-groups` and `tags`. Each tag belongs to exactly one group, and posts can reference multiple reusable tags. Posts select tags rather than separately selecting groups.
- The initial tag groups are Article type, Review type, Genre, Topic, and Artist. Use stable slugs and localized display names.
- Replace fixed article classification and artist fields with tag relationships. Map existing article types, review subtypes, genres, and artist values explicitly rather than losing their meaning.
- Use a separate public `authors` collection with names, optional biographies, and portraits. Authors do not require CMS accounts; posts reference authors in display order.
- Keep post routes generic (`posts`/localized equivalent and a post slug). Do not encode category or article type into the canonical post route.
- Use one generic post archive with search, pagination, and grouped tag filters represented in the URL. Defer dedicated tag pages.
- All CMS users are trusted publishers. Support draft/public publishing and working preview; defer approval roles and workflows. Keep unpublished content inaccessible to anonymous visitors.
- Preserve title, slug, publication/update dates, publication status, excerpt, rich content, authors, featured media, tags, related posts, and SEO data needed for migration or presentation.

## Editorial blocks and components

- Use a fixed post frame that renders the title, featured image, excerpt, publication date, byline, and related posts from post-level fields. Do not make editors recreate these sections as body blocks.
- The flexible post body supports Paragraph, Media, Quote, Embed, and Divider blocks. Media includes single images and simple image grids with captions and attribution; structured embeds initially support Spotify and YouTube.
- Keep separate Editorial Hero, Latest Posts, Featured Post, and Post Slider blocks. Share post queries and card components underneath these editor-facing blocks.
- Distinguish the curated Editorial Hero from the new boilerplate's text Hero; they serve different purposes.
- Adapt the old post-card visual variants to the new model. Remove dependencies on fixed article types and old article collections.
- Use manual related-post selections first, then shared-tag recommendations. Respect publication status and preserve manual ordering.
- Reuse the new shared components, collection/field templates, and styling foundations. Use the old implementation as a reference for branding and useful layouts rather than copying it wholesale.
- Keep supported saved layouts reusable without allowing recursive saved-layout nesting.

## First-release scope and deferred features

- The first release covers editorial posts, the homepage, the searchable/filterable archive, and basic information pages.
- Defer team/recruitment features, forms, reusable quote libraries and quote sliders, concerts, standalone galleries, and dedicated author/tag landing pages.
- Inline article images/grids and inline quotes remain in scope; they do not require standalone galleries or a quote library.
- Retain existing FAQ records, but defer the FAQ presentation block. Defer standalone Heading and Text Card blocks; use supported rich text and Text Image content for initial information pages.
- Preserve source data for deferred features even when their collections, blocks, and frontend presentation are not carried into the first release.

## WordPress and old Payload migration compatibility

The old WordPress API represents this content as `type: "post"`. A representative record includes `id`, `date`, `modified`, `slug`, `status`, rendered `title`, rendered HTML `content`, rendered `excerpt`, `author`, `featured_media`, numeric `categories`, numeric `tags`, and a legacy `link`.

When adding or changing fields, preserve straightforward migration paths:

- Map WordPress posts and old Payload articles into `posts`, rather than splitting them by old article URL (`anmeldelser`, `interviews`, or `ugens-udgivelser`).
- Map WordPress categories and `post_tag` terms, plus old Payload genres, article types, review subtypes, and artist values, into grouped tags through explicit mappings. Do not recreate `post-categories` as the destination taxonomy.
- Audit available source exports for actual collection/block usage, locales, relationships, and legacy URLs before defining content mappings. Repository code alone does not establish which features have stored content; report missing source access explicitly.
- Preserve complete source snapshots, including deferred and unsupported content. Retain source-system identifiers, original dates and statuses, slugs, legacy URLs, and original content separately from new-system metadata.
- Flag conflicting WordPress/Payload versions for explicit review. Do not silently prefer either source or merge records solely because titles or names match.
- Convert old block-level author selections into post-level author relationships and report disagreements. Public author profiles remain separate from login accounts.
- Convert imported content into supported body blocks, retaining media references, captions, attribution, ordering, and internal links. Report unsupported content and keep affected imports unpublished rather than silently discarding it.
- Keep imports repeatable through stable source identifiers, with dry-run reports and safe reruns that do not create duplicate records.
- Prefer stable relationships and explicit migration metadata over one-off hardcoded ID mappings.
- Isolate WordPress and old Payload migration adapters from normal frontend rendering code. Resolve relationships and legacy redirects against the new records.

## Implementation checkpoints

Each item is a separate deliverable and approval stop, in this order:

1. Project instructions (`AGENTS.md` only).
2. Migration inventory from available exports, including missing-access and unsupported-content reports.
3. Tag groups collection.
4. Tags collection and group relationship.
5. Posts taxonomy integration, preserving existing assignments.
6. Authors collection.
7. Post authors integration and old author mapping rules.
8. Draft/public publishing, preview, and public access.
9. Generic localized post routing and link generation.
10. Shared post card and visual variants.
11. Fixed post frame.
12. Paragraph block and imported rich-text formatting.
13. Media block for single images and simple grids.
14. Quote block.
15. Structured Spotify/YouTube Embed block.
16. Divider block styling and post-body integration.
17. Related posts.
18. Editorial Hero.
19. Latest Posts.
20. Featured Post.
21. Post Slider.
22. Post archive with server-side search, grouped filters, pagination, and URL state.
23. Header and desktop/mobile navigation.
24. Footer.
25. Saved layouts using supported blocks without recursive nesting.
26. Basic information pages using supported layouts.
27. WordPress importer with dry run and repeatable imports.
28. Old Payload importer for articles, supported layouts, references, and relevant settings.
29. Conflict resolution and legacy redirects.
30. Release verification, import reconciliation, and representative page review.

## Validation by checkpoint

- Collection changes: validate relationships, access, localization, and generated types.
- Publishing: verify public pages, APIs, lists, and caches do not expose drafts, and that authenticated preview can display them.
- Components: check representative content, responsive layouts, keyboard behavior, heading hierarchy, image descriptions, and reduced motion where relevant.
- Archive: verify combined filters, search, pagination, reloads, and browser navigation.
- Imports: verify safe reruns, preserved metadata, unresolved relationships, unsupported content, and conflicting records.
- Routing: verify localized URLs, previews, canonical metadata, sitemaps, and legacy redirects.
- Run applicable TypeScript/Biome checks and focused tests for each checkpoint; run the production build at integration milestones. Documentation-only changes need diff and consistency checks rather than application tests.

## Styling and CSS

Tailwind CSS remains in use. SCSS is being converted to regular CSS; do not reintroduce SCSS for new work.

- Preserve the existing visual system and variable values while converting syntax from SCSS to CSS.
- Keep shared design tokens as CSS custom properties in the global CSS layer. The values and names should remain equivalent to the old project unless a change is explicitly requested.
- Keep the JavaScript breakpoint map in `apps/web/src/cssVariables.ts` synchronized with the CSS custom properties and Tailwind theme configuration.
- Put reusable styling in the existing CSS files under `apps/web/src/lib/styles` or the appropriate component stylesheet. Use Tailwind utilities for component-level layout and styling where that is the established pattern.
- Do not replace the styling system with a new framework or perform an unrelated visual redesign as part of the SCSS-to-CSS conversion.

## Skills

Use the repo-local [`typescript-standards`](.agents/skills/typescript-standards/SKILL.md) skill for shared TypeScript, TSX, React, and application-logic work in this repository.
Use the repo-local [`commit-message-standards`](.agents/skills/commit-message-standards/SKILL.md) skill when generating commit messages for this repository.
Use the repo-local [`pnpm-scripts`](.agents/skills/pnpm-scripts/SKILL.md) skill when running shared `pnpm` scripts in this repository.
