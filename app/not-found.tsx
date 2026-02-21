import Link from "next/link";

import { CtaLink } from "@/components/cta-link";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-surface-muted/70 bg-surface/80 px-7 py-12 text-center shadow-glow">
      <p className="text-xs uppercase tracking-[0.18em] text-accent-strong">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-text">Page not found</h1>
      <p className="mt-3 text-sm leading-6 text-text-subtle">
        The route you requested is unavailable. Return to the home page or jump directly into the
        app.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-surface-muted bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          Back to Home
        </Link>
        <CtaLink label="Start Using Pensador" placement="404_primary" utmPage="/404" />
      </div>
    </section>
  );
}
