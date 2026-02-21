import type { Metadata } from "next";
import Link from "next/link";

import { PageCta } from "@/components/page-cta";
import { SITE_COPY } from "@/content/site-copy";

const copy = SITE_COPY.libraryOverview;

export const metadata: Metadata = {
  title: "Library",
  description: copy.metadataDescription,
  alternates: {
    canonical: "/library",
  },
};

export default function LibraryPage(): React.JSX.Element {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="animate-rise-in" data-section="library_intro">
        <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">{copy.intro.badge}</p>
        <h1 className="mt-3 section-heading max-w-4xl">{copy.intro.heading}</h1>
        <p className="section-lead">{copy.intro.lead}</p>
      </section>

      <section data-section="library_decision_guide">
        <article className="surface-card animate-rise-in p-6 sm:p-8">
          <h2 className="section-heading">{copy.decisionGuideSection.heading}</h2>
          <p className="section-lead mt-4">{copy.decisionGuideSection.lead}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-text-subtle sm:text-base">
            {copy.decisionGuideSection.items.map((item) => (
              <li key={item.decisionType} className="list-disc pl-5 marker:text-accent-strong">
                <strong className="text-text">{item.decisionType}</strong>
                {" -> "}
                {item.outcome}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section data-section="library_apps">
        <h2 className="section-heading">{copy.appCatalogSection.heading}</h2>
        <p className="section-lead">{copy.appCatalogSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.appCatalogSection.items.map((app, index) => {
            const stack = "stack" in app ? app.stack : undefined;
            const actionLabel = "actionLabel" in app ? app.actionLabel : undefined;
            const href = "href" in app ? app.href : undefined;

            const cardContent = (
              <>
                <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">{app.status}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-text">{app.name}</h3>
                <p className="mt-2 text-sm font-medium text-text">{app.category}</p>
                <p className="mt-3 text-sm leading-6 text-text-subtle">{app.summary}</p>
                {stack ? <p className="mt-3 text-sm leading-6 text-text-subtle">{stack}</p> : null}
                {actionLabel ? (
                  <span className="mt-4 inline-flex text-sm font-semibold text-accent-strong transition group-hover:translate-x-1">
                    {actionLabel}
                  </span>
                ) : null}
              </>
            );

            if (href) {
              return (
                <Link
                  key={app.slug}
                  href={href}
                  className="group animate-rise-in block h-full overflow-hidden rounded-lg bg-gradientHero p-[1px] shadow-glow transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
                  style={{ animationDelay: `${120 + index * 90}ms` }}
                >
                  <div className="h-full rounded-[calc(0.5rem-1px)] bg-white p-5 dark:bg-surface/95">
                    {cardContent}
                  </div>
                </Link>
              );
            }

            return (
              <article
                key={app.slug}
                className="animate-rise-in block h-full overflow-hidden rounded-lg bg-gradientHero p-[1px] shadow-glow"
                style={{ animationDelay: `${120 + index * 90}ms` }}
              >
                <div className="h-full rounded-[calc(0.5rem-1px)] bg-white p-5 dark:bg-surface/95">
                  {cardContent}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section data-section="library_guarantees">
        <h2 className="section-heading">{copy.guaranteesSection.heading}</h2>
        <p className="section-lead">{copy.guaranteesSection.lead}</p>
        <div className="mt-6 grid gap-3">
          {copy.guaranteesSection.items.map((line, index) => (
            <article
              key={line}
              className="surface-card animate-fade-in p-4"
              style={{ animationDelay: `${110 + index * 80}ms` }}
            >
              <p className="text-sm leading-6 text-text-subtle">{line}</p>
            </article>
          ))}
        </div>
      </section>

      <PageCta
        utmPage="/library"
        title={copy.finalCta.title}
        description={copy.finalCta.description}
        primaryCtaLabel={copy.finalCta.primaryCtaLabel}
        secondaryCtaLabel={copy.finalCta.secondaryCtaLabel}
      />
    </div>
  );
}
