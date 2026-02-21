import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const routes = ["", "/research", "/library", "/library/pensador", "/how-to-use"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
