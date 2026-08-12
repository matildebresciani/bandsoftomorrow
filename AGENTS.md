## Project context

`bandsoftomorrow` is the new, cleaned-up Payload/Next.js boilerplate for the Bands of Tomorrow exam project. The previous implementation lives in `/Users/matildebresciani/Documents/bands-of-tomorrow-eksamen` and is the source of the existing editorial content and migration requirements. Make changes in this repository unless the task explicitly targets the old project.

The application is a monorepo. The main web application is in `apps/web`, with source code in `apps/web/src`. It uses Next.js, React, TypeScript, Payload CMS, MongoDB through Payload's MongoDB adapter, `next-intl`, Tailwind CSS, and Biome.

## Current architectural direction

- Keep the codebase organized by domain and responsibility. Follow the existing `collections`, `components`, `lib/field-templates`, `lib/collection-templates`, `lib/utilities`, `i18n`, and `app` structure instead of adding unrelated top-level folders.
- Use the shared collection and field templates where they exist. Keep collection-specific hooks next to the collection that owns them.
- Use English for code identifiers, collection slugs, field names, route definitions, and other canonical configuration. Danish is content/UI translation, not a reason to hardcode Danish strings in application logic.
- Keep both `en` and `da` supported. English is the canonical/primary language for project structure and route configuration, while Danish remains `defaultLocale` for the application. Localized paths and UI strings belong in the locale configuration and message files.
- The Payload database is MongoDB. Keep the model and field naming predictable and reasonably close to the old WordPress REST representation so the database migration can map fields without unnecessary transformations.

## Content model

All editorial articles are represented by one Payload `posts` collection. Do not create separate collections or top-level content routes for interviews, reviews, or weekly releases.

- `posts` is the single collection for interviews, reviews, `ugens-udgivelser`, news, and future editorial post types.
- Use the `post-categories` relationship to classify posts. The old article types should become categories rather than separate collections or route trees.
- Add and use a `tags` collection for many-to-many post tags. Tags are separate from categories and should be reusable across posts.
- Keep post routes generic (`posts`/localized equivalent and a post slug). Do not encode category or article type into the canonical post route.
- Concerts and galleries are out of scope for the current migration and application model. Do not add them while working on the current posts/categories/tags refactor unless explicitly requested.
- Preserve common editorial concepts such as title, slug, publication/update dates, status, excerpt, rich content, author, featured media, categories, tags, and related posts where they are needed for migration or presentation.

## WordPress migration compatibility

The old WordPress API represents this content as `type: "post"`. A representative record includes `id`, `date`, `modified`, `slug`, `status`, rendered `title`, rendered HTML `content`, rendered `excerpt`, `author`, `featured_media`, numeric `categories`, numeric `tags`, and a legacy `link`.

When adding or changing fields, preserve straightforward migration paths:

- Map WordPress posts into Payload `posts`, rather than splitting them by old article URL (`anmeldelser`, `interviews`, or `ugens-udgivelser`).
- Map WordPress categories to `post-categories` and WordPress `post_tag` terms to `tags`.
- Retain source identifiers, dates, publication status, slugs, and legacy URLs when a migration/redirect field is required; do not discard them casually.
- Prefer stable relationships and explicit migration metadata over one-off hardcoded ID mappings.
- Keep imported article content capable of representing the existing WordPress post body and media references. Migration-specific code should be isolated from normal frontend rendering code.

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
