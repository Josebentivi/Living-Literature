import { CtaLink } from "@/components/cta-link";
import { cn } from "@/lib/cn";

type PageCtaProps = {
  title: string;
  description: string;
  utmPage: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  className?: string;
};

export function PageCta({
  title,
  description,
  utmPage,
  primaryCtaLabel = "Start Using Pensador",
  secondaryCtaLabel = "Try Free",
  className,
}: PageCtaProps): React.JSX.Element {
  return (
    <section
      className={cn(
        "rounded-3xl bg-gradientHero p-[1px] shadow-glow",
        "animate-rise-in",
        className,
      )}
      data-section="final_cta"
    >
      <div className="rounded-[calc(1.5rem-1px)] bg-white px-6 py-7 dark:bg-surface/95 sm:px-8 sm:py-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-subtle">{description}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <CtaLink
            label={primaryCtaLabel}
            placement={`${utmPage}_final_primary`}
            utmPage={utmPage}
          />
          <CtaLink
            label={secondaryCtaLabel}
            placement={`${utmPage}_final_secondary`}
            utmPage={utmPage}
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}
