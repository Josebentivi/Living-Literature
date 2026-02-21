"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/analytics";

export function BehaviorTracker(): null {
  const pathname = usePathname();

  useEffect(() => {
    const seenSections = new Set<string>();
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const section = entry.target.getAttribute("data-section");
          if (!section || seenSections.has(section)) {
            return;
          }

          seenSections.add(section);
          trackEvent("section_view", {
            page: pathname,
            section,
          });
        });
      },
      { threshold: 0.35 },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const onToggle = (event: Event): void => {
      const target = event.target as HTMLDetailsElement;
      if (target.tagName !== "DETAILS" || !target.open) {
        return;
      }

      const faq = target.dataset.faqItem;
      if (!faq) {
        return;
      }

      trackEvent("faq_expand", { page: pathname, faq });
    };

    const onTierInteraction = (event: Event): void => {
      const target = event.target as HTMLElement;
      const tierPlan = target.closest<HTMLElement>("[data-tier-plan]");
      if (!tierPlan) {
        return;
      }
      const tierTable = target.closest<HTMLElement>("[data-tier-compare]");
      if (!tierTable) {
        return;
      }

      trackEvent("tier_compare_interaction", {
        page: pathname,
        interaction: event.type,
        tier: tierPlan.dataset.tierPlan ?? "unknown",
      });
    };

    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("click", onTierInteraction, true);
    document.addEventListener("focusin", onTierInteraction, true);

    return () => {
      sectionObserver.disconnect();
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("click", onTierInteraction, true);
      document.removeEventListener("focusin", onTierInteraction, true);
    };
  }, [pathname]);

  return null;
}
