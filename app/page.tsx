import type { Metadata } from "next";
import Link from "next/link";

import { CtaLink } from "@/components/cta-link";
import { PageCta } from "@/components/page-cta";
import { SITE_COPY } from "@/content/site-copy";
import { TESTIMONIALS } from "@/lib/site";

const copy = SITE_COPY.home;

export const metadata: Metadata = {
  title: "Home",
  description: copy.metadataDescription,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage(): React.JSX.Element {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section
        className="animate-rise-in overflow-hidden rounded-3xl bg-gradientHero p-[1px] shadow-glow"
        data-section="home_hero"
      >
        <div className="rounded-[calc(1.5rem-1px)] bg-white px-6 py-10 dark:bg-surface/95 sm:px-10">
          <p className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
            {copy.hero.badge}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-3xl font-semibold tracking-tight text-text sm:text-5xl">
            {copy.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-text-subtle sm:text-lg">
            {copy.hero.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CtaLink
              label={copy.hero.primaryCtaLabel}
              placement={copy.hero.primaryCtaPlacement}
              utmPage={copy.hero.primaryCtaUtmPage}
            />
            <Link
              href={copy.hero.secondaryCtaHref}
              className="inline-flex items-center justify-center rounded-xl border border-surface-muted bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            >
              {copy.hero.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section data-section="home_discursive_methodology">
        <article className="surface-card animate-rise-in p-6 sm:p-8">
          <h2 className="section-heading">{copy.discursiveMethodologySection.heading}</h2>
          <p className="section-lead mt-4">
            {copy.discursiveMethodologySection.intro}
          </p>
          <p className="mt-4 text-sm leading-6 text-text-subtle sm:text-base">
            {copy.discursiveMethodologySection.transition}
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-text-subtle sm:text-base">
            {copy.discursiveMethodologySection.items.map((item) => (
              <li key={item} className="list-disc pl-5 marker:text-accent-strong">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-text sm:text-base">
            <strong>{copy.discursiveMethodologySection.principle}</strong>
          </p>
        </article>
      </section>

      <section data-section="home_without_methodology">
        <article className="surface-card animate-rise-in p-6 sm:p-8">
          <h2 className="section-heading">{copy.withoutMethodologySection.heading}</h2>
          <p className="section-lead mt-4">{copy.withoutMethodologySection.intro}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-text-subtle sm:text-base">
            {copy.withoutMethodologySection.items.map((item) => (
              <li key={item.title} className="list-disc pl-5 marker:text-accent-strong">
                <strong className="text-text">{item.title}:</strong> {item.detail}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-text sm:text-base">
            <strong>{copy.withoutMethodologySection.conclusion}</strong>
          </p>
        </article>
      </section>

      <section data-section="home_outcomes">
        <h2 className="section-heading">{copy.pillarsSection.heading}</h2>
        <p className="section-lead">{copy.pillarsSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.pillarsSection.items.map((item, index) => (
            <article
              key={item.title}
              className="surface-card animate-rise-in p-5"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <h3 className="font-display text-xl font-semibold text-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="home_workflow">
        <h2 className="section-heading">{copy.loopSection.heading}</h2>
        <p className="section-lead">{copy.loopSection.lead}</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.loopSection.items.map((item, index) => (
            <li
              key={item.step}
              className="surface-card animate-rise-in p-5"
              style={{ animationDelay: `${140 + index * 100}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">
                Step {index + 1}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{item.step}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section data-section="home_catalog_preview">
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

      <section data-section="home_testimonials">
        <h2 className="section-heading">{copy.testimonialsSection.heading}</h2>
        <p className="section-lead">{copy.testimonialsSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <blockquote
              key={`${testimonial.name}-${testimonial.company}`}
              className="surface-card animate-fade-in p-5"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <p className="text-sm leading-6 text-text">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="mt-4 border-t border-surface-muted/70 pt-3 text-xs text-text-subtle">
                <p className="font-semibold text-text">{testimonial.name}</p>
                <p>
                  {testimonial.role}, {testimonial.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <PageCta
        utmPage="/"
        title={copy.finalCta.title}
        description={copy.finalCta.description}
        primaryCtaLabel={copy.finalCta.primaryCtaLabel}
        secondaryCtaLabel={copy.finalCta.secondaryCtaLabel}
      />
    </div>
  );
}
