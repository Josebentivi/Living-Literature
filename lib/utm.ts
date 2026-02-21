import { APP_URL, DEFAULT_UTM } from "@/lib/site";

type BuildAppUrlOptions = {
  utmPage?: string;
  destinationUrl?: string;
  placement?: string;
  referrer?: string;
};

const FALLBACK_PAGE = "marketing_home";

function sanitize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, "")
    .slice(0, 100);
}

function normalizeUtmPage(value?: string): string {
  if (!value || value === "/") {
    return FALLBACK_PAGE;
  }

  return sanitize(value.replace(/^\//, "").replace(/\//g, "_")) || FALLBACK_PAGE;
}

export function buildAppUrl(options: BuildAppUrlOptions = {}): string {
  const destinationUrl = options.destinationUrl ?? APP_URL;
  const url = new URL(destinationUrl);
  const utmPage = normalizeUtmPage(options.utmPage);

  url.searchParams.set("utm_source", DEFAULT_UTM.source);
  url.searchParams.set("utm_medium", DEFAULT_UTM.medium);
  url.searchParams.set("utm_campaign", DEFAULT_UTM.campaign);
  url.searchParams.set("utm_content", sanitize(options.placement ?? "primary_cta"));
  url.searchParams.set("utm_page", utmPage);

  if (options.referrer) {
    try {
      const referrerHost = new URL(options.referrer).hostname;
      if (referrerHost) {
        url.searchParams.set("utm_referrer_host", sanitize(referrerHost));
      }
    } catch {
      // Invalid referrer values are intentionally ignored.
    }
  }

  return url.toString();
}
