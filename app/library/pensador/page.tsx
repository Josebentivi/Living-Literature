import type { Metadata } from "next";
import Link from "next/link";

import { CtaLink } from "@/components/cta-link";
import { PageCta } from "@/components/page-cta";
import { SITE_COPY } from "@/content/site-copy";

const copy = SITE_COPY.libraryPensador;

export const metadata: Metadata = {
  title: "Library / Pensador",
  description: copy.metadataDescription,
  alternates: {
    canonical: "/library/pensador",
  },
};

export default function PensadorLibraryPage(): React.JSX.Element {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="animate-rise-in" data-section="library_pensador_intro">
        <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">{copy.intro.badge}</p>
        <h1 className="mt-3 section-heading max-w-4xl">{copy.intro.heading}</h1>
        <p className="section-lead">{copy.intro.lead}</p>
        <div className="mt-6">
          <Link
            href={copy.intro.backHref}
            className="inline-flex items-center rounded-xl border border-surface-muted bg-surface px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            {copy.intro.backLabel}
          </Link>
        </div>
      </section>

      <section data-section="library_pensador_thinker_library">
        <div className="surface-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">
            {copy.thinkerLibrarySection.badge}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {copy.thinkerLibrarySection.thinkers.map((thinker, index) => (
              <article
                key={thinker.name}
                className="animate-fade-in rounded-xl border border-surface-muted bg-surface-muted/40 p-4"
                style={{ animationDelay: `${100 + index * 60}ms` }}
              >
                <h3 className="font-display text-lg font-semibold text-text">{thinker.name}</h3>
                <p className="mt-1 text-sm text-text-subtle">{thinker.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-section="library_pensador_catalog">
        <h2 className="section-heading">{copy.valueBlocksSection.heading}</h2>
        <p className="section-lead">{copy.valueBlocksSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.valueBlocksSection.items.map((tool, index) => (
            <article
              key={tool.name}
              className="surface-card animate-fade-in p-5"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">
                {tool.category}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{tool.name}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{tool.useCase}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="library_pensador_methodology">
        <h2 className="section-heading">{copy.methodologySection.heading}</h2>
        <p className="section-lead">{copy.methodologySection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.methodologySection.items.map((method, index) => (
            <article
              key={method.name}
              className="surface-card animate-rise-in p-5"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">{method.layer}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{method.name}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{method.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="library_pensador_tier_compare">
        <h2 className="section-heading">{copy.tierSection.heading}</h2>
        <p className="section-lead">{copy.tierSection.lead}</p>
        <div className="surface-card mt-6 overflow-x-auto" data-tier-compare="true">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Pensador tier comparison table</caption>
            <thead className="bg-surface-muted/60 text-xs uppercase tracking-[0.14em] text-text-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
                <th className="px-4 py-3 font-semibold">Primary benefit</th>
                <th className="px-4 py-3 font-semibold">Usage profile</th>
              </tr>
            </thead>
            <tbody>
              {copy.tierSection.rows.map((row) => (
                <tr
                  key={row.name}
                  data-tier-plan={row.name.toLowerCase()}
                  tabIndex={0}
                  className="border-t border-surface-muted/70 transition hover:bg-surface-muted/50 focus:bg-surface-muted/60 focus:outline-none"
                >
                  <th className="px-4 py-4 font-display text-lg font-semibold text-text">
                    {row.name}
                  </th>
                  <td className="px-4 py-4 text-text-subtle">{row.bestFor}</td>
                  <td className="px-4 py-4 text-text-subtle">{row.benefit}</td>
                  <td className="px-4 py-4 text-text-subtle">{row.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <CtaLink
            label={copy.tierSection.primaryCtaLabel}
            placement={copy.tierSection.primaryCtaPlacement}
            utmPage={copy.tierSection.primaryCtaUtmPage}
          />
          <Link
            href={copy.tierSection.secondaryCtaHref}
            className="inline-flex items-center justify-center rounded-xl border border-surface-muted bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          >
            {copy.tierSection.secondaryCtaLabel}
          </Link>
        </div>
      </section>

      <PageCta
        utmPage="/library/pensador"
        title={copy.finalCta.title}
        description={copy.finalCta.description}
      />
    </div>
  );
}
