import type { Metadata } from "next";

import { CtaLink } from "@/components/cta-link";
import { PageCta } from "@/components/page-cta";
import { SITE_COPY } from "@/content/site-copy";

const copy = SITE_COPY.howToUse;

export const metadata: Metadata = {
  title: "How To Use",
  description: copy.metadataDescription,
  alternates: {
    canonical: "/how-to-use",
  },
};

export default function HowToUsePage(): React.JSX.Element {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="animate-rise-in" data-section="howto_intro">
        <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">{copy.intro.badge}</p>
        <h1 className="mt-3 section-heading max-w-4xl">{copy.intro.heading}</h1>
        <p className="section-lead">{copy.intro.lead}</p>
        <div className="mt-6">
          <CtaLink
            label={copy.intro.primaryCtaLabel}
            placement={copy.intro.primaryCtaPlacement}
            utmPage={copy.intro.primaryCtaUtmPage}
          />
        </div>
      </section>

      <section data-section="howto_quickstart">
        <h2 className="section-heading">{copy.workflowSection.heading}</h2>
        <p className="section-lead">{copy.workflowSection.lead}</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {copy.workflowSection.steps.map((step, index) => (
            <li
              key={step.title}
              className="surface-card animate-rise-in p-5"
              style={{ animationDelay: `${100 + index * 80}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.14em] text-accent-strong">
                Step {index + 1}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section data-section="howto_mistakes">
        <h2 className="section-heading">{copy.mistakesSection.heading}</h2>
        <p className="section-lead">{copy.mistakesSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.mistakesSection.items.map((mistake, index) => (
            <article
              key={mistake.title}
              className="surface-card animate-fade-in p-5"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <h3 className="font-display text-lg font-semibold text-text">{mistake.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">
                <span className="font-semibold text-text">Best practice:</span> {mistake.fix}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="howto_faq">
        <h2 className="section-heading">{copy.faqSection.heading}</h2>
        <p className="section-lead">{copy.faqSection.lead}</p>
        <div className="mt-6 space-y-3">
          {copy.faqSection.items.map((faq, index) => (
            <details
              key={faq.question}
              data-faq-item={`faq_${index + 1}`}
              className="surface-card group animate-fade-in px-5 py-4"
              style={{ animationDelay: `${110 + index * 60}ms` }}
            >
              <summary className="cursor-pointer list-none font-display text-lg font-semibold text-text marker:hidden focus-visible:outline-none">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <PageCta
        utmPage="/how-to-use"
        title={copy.finalCta.title}
        description={copy.finalCta.description}
      />
    </div>
  );
}
