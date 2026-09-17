import type { MetadataRoute } from "next";
import { getUpcomingEvents } from "@/lib/events";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/events", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/book", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/gallery", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cancellation-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  let events: MetadataRoute.Sitemap = [];

  try {
    events = getUpcomingEvents().map((event) => ({
      url: `${site.url}/events/${event.slug}`,
      lastModified: new Date(event.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch {
    events = [];
  }

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...events,
  ];
}
