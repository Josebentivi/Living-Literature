import type { Metadata } from "next";

import { PageCta } from "@/components/page-cta";
import { SITE_COPY } from "@/content/site-copy";

const copy = SITE_COPY.research;

export const metadata: Metadata = {
  title: "Research",
  description: copy.metadataDescription,
  alternates: {
    canonical: "/research",
  },
};

export default function ResearchPage(): React.JSX.Element {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="animate-rise-in" data-section="research_intro">
        <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">{copy.intro.badge}</p>
        <h1 className="mt-3 section-heading max-w-4xl">{copy.intro.heading}</h1>
        <p className="mt-4 text-base leading-7 text-text-subtle sm:text-lg">
          {copy.intro.contrastLineOnePrefix} <strong className="text-text">{copy.intro.contrastLineOneEmphasis}</strong>
          <br />
          {copy.intro.contrastLineTwoPrefix} <strong className="text-text">{copy.intro.contrastLineTwoEmphasis}</strong>
        </p>
        <p className="section-lead mt-4">
          {copy.intro.leadPrefix} <strong className="text-text">{copy.intro.leadVectorStoreEmphasis}</strong>{" "}
          {copy.intro.leadJoiner} <strong className="text-text">{copy.intro.leadDiscussionEmphasis}</strong>
        </p>
      </section>

      <section data-section="research_architecture">
        <h2 className="section-heading">{copy.architectureSection.heading}</h2>
        <p className="section-lead">{copy.architectureSection.lead}</p>
        <ol className="mt-6 grid gap-3">
          {copy.architectureSection.items.map((line, index) => (
            <li
              key={line}
              className="surface-card animate-rise-in flex items-start gap-4 p-4"
              style={{ animationDelay: `${100 + index * 90}ms` }}
            >
              <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent-strong">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-text-subtle">{line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section data-section="research_capabilities">
        <h2 className="section-heading">{copy.capabilitiesSection.heading}</h2>
        <p className="section-lead">{copy.capabilitiesSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {copy.capabilitiesSection.items.map((capability, index) => (
            <article
              key={capability.title}
              className="surface-card animate-fade-in p-5"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <h3 className="font-display text-xl font-semibold text-text">{capability.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{capability.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="research_hats">
        <h2 className="section-heading">{copy.hatsSection.heading}</h2>
        <p className="section-lead">{copy.hatsSection.lead}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.hatsSection.items.map((item, index) => (
            <article
              key={item.hat}
              className="surface-card animate-rise-in p-5"
              style={{ animationDelay: `${100 + index * 80}ms` }}
            >
              <h3 className="font-display text-xl font-semibold text-text">{item.hat}</h3>
              <p className="mt-2 text-sm font-medium text-accent-strong">{item.perspective}</p>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{item.output}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-section="research_ohp">
        <h2 className="section-heading">{copy.ohpSection.heading}</h2>
        <p className="section-lead">{copy.ohpSection.lead}</p>
        <ol className="mt-6 grid gap-4 md:grid-cols-5">
          {copy.ohpSection.items.map((stage, index) => (
            <li
              key={stage.stage}
              className="surface-card animate-fade-in p-5"
              style={{ animationDelay: `${110 + index * 70}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-accent-strong">
                Stage {index + 1}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-text">{stage.stage}</h3>
              <p className="mt-2 text-sm leading-6 text-text-subtle">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <PageCta
        utmPage="/research"
        title={copy.finalCta.title}
        description={copy.finalCta.description}
        primaryCtaLabel={copy.finalCta.primaryCtaLabel}
        secondaryCtaLabel={copy.finalCta.secondaryCtaLabel}
      />
    </div>
  );
}
