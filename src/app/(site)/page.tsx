import { JsonLd } from "@/components/json-ld";
import { AboutClub } from "@/components/home/about-club";
import { Community } from "@/components/home/community";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { Hero } from "@/components/home/hero";
import { HikingDay } from "@/components/home/hiking-day";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { WhatWeDo } from "@/components/home/what-we-do";
import { getUpcomingEvents } from "@/lib/events";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = getUpcomingEvents(6);

  const organisation = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    name: site.name,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    areaServed: "South Africa",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pretoria",
      addressRegion: "Gauteng",
      addressCountry: "ZA",
    },
    sameAs: [site.instagram, site.tiktok],
    image: `${site.url}/images/hero-group-hike.jpg`,
  };

  const eventList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/events/${event.slug}`,
      name: event.title,
    })),
  };

  return (
    <>
      <JsonLd data={organisation} />
      <JsonLd data={eventList} />
      <Hero />
      <UpcomingEvents events={events} />
      <WhatWeDo />
      <HikingDay />
      <AboutClub />
      <Community />
      <GalleryStrip />
    </>
  );
}
