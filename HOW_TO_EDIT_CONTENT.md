# How To Edit Website Content

This project separates content from page layout.
Most text updates can be done in one file without touching JSX page structure.

## Primary content file

- `content/site-copy.ts`

## Buttons and links

You can change button labels and destinations in `content/site-copy.ts`:

- Home hero:
  - `SITE_COPY.home.hero.primaryCta*`
  - `SITE_COPY.home.hero.secondaryCtaHref`
- Library overview:
  - `SITE_COPY.libraryOverview.appCatalogSection.items[].href`
  - `SITE_COPY.libraryOverview.guaranteesSection.primaryCta*`
  - `SITE_COPY.libraryOverview.guaranteesSection.secondaryCtaHref`
- Library/Pensador:
  - `SITE_COPY.libraryPensador.intro.backHref`
  - `SITE_COPY.libraryPensador.tierSection.primaryCta*`
  - `SITE_COPY.libraryPensador.tierSection.secondaryCtaHref`
- How To Use intro:
  - `SITE_COPY.howToUse.intro.primaryCta*`

## Sections mapped in `SITE_COPY`

- `home`
- `research`
- `libraryOverview`
- `libraryPensador`
- `howToUse`

## Typical update workflow

1. Edit text in `content/site-copy.ts`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Preview locally with `npm run dev` or `npm start` after build.

## Route map

- `/` uses `SITE_COPY.home`
- `/research` uses `SITE_COPY.research`
- `/library` uses `SITE_COPY.libraryOverview`
- `/library/pensador` uses `SITE_COPY.libraryPensador`
- `/how-to-use` uses `SITE_COPY.howToUse`

## When code changes are still needed

- Adding a new page route (for example `/library/jurisai`)
- Changing layout, components, or animation behavior
- Adding new data fields that do not exist in `SITE_COPY` yet
