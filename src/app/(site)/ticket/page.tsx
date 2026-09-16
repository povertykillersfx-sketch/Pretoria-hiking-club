import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { TicketLookupForm } from "@/components/booking/ticket-lookup-form";

export const metadata: Metadata = {
  title: "Find my ticket",
  robots: { index: false, follow: false },
};

export default function TicketPage() {
  return (
    <>
      <PageHero
        eyebrow="Your ticket"
        title="Find your check-in QR"
        description="Enter the reference from your confirmation email and the email you booked with. Your code only works for that hike."
        image="/images/hero-group-hike.jpg"
        imageAlt=""
        compact
      />
      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto max-w-lg px-5 sm:px-8">
          <div className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-8">
            <TicketLookupForm />
          </div>
        </div>
      </section>
    </>
  );
}
