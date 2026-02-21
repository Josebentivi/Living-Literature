"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { buildAppUrl } from "@/lib/utm";

type CtaVariant = "primary" | "secondary";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  label: string;
  placement: string;
  utmPage?: string;
  destinationUrl?: string;
  variant?: CtaVariant;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const variantClasses: Record<CtaVariant, string> = {
  primary:
    "bg-accent text-white shadow-glow hover:bg-accent-strong hover:shadow-lg active:translate-y-px",
  secondary:
    "border border-surface-muted bg-surface/80 text-text hover:border-accent hover:bg-surface-muted active:translate-y-px",
};

function isPrimary(variant: CtaVariant): boolean {
  return variant === "primary";
}

export function CtaLink({
  label,
  placement,
  utmPage,
  destinationUrl,
  variant = "primary",
  className,
  onClick,
  target,
  rel,
  ...rest
}: CtaLinkProps): React.JSX.Element {
  const fallbackHref = buildAppUrl({ utmPage, placement, destinationUrl });

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const currentUtmPage =
      typeof window !== "undefined" ? window.location.pathname : utmPage ?? "/";
    const referrer = typeof document !== "undefined" ? document.referrer : undefined;

    trackEvent(isPrimary(variant) ? "cta_click_primary" : "cta_click_secondary", {
      label,
      placement,
      page: currentUtmPage,
    });

    trackEvent("outbound_to_app", {
      destination: "pensador_app",
      label,
      placement,
      page: currentUtmPage,
    });

    if (target && target !== "_self") {
      return;
    }

    event.preventDefault();
    window.location.assign(
      buildAppUrl({
        utmPage: currentUtmPage,
        destinationUrl,
        placement,
        referrer,
      }),
    );
  }

  return (
    <a
      {...rest}
      target={target}
      rel={target === "_blank" ? `${rel ?? ""} noopener noreferrer`.trim() : rel}
      href={fallbackHref}
      onClick={handleClick}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {label}
    </a>
  );
}
