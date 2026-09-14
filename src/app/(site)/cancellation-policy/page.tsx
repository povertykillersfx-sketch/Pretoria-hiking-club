import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `How cancellations, refunds and transfers work for ${site.name} events.`,
  alternates: { canonical: "/cancellation-policy" },
};

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cancellation Policy"
      intro="Plans change. Here is exactly how cancellations, transfers and refunds work."
      image="/images/gallery-mountain-lake.jpg"
      sections={[
        {
          heading: "Cancelling a day hike",
          bullets: [
            "More than 7 days before the event: full refund, or move your spot to another hike at no cost.",
            "3 to 7 days before the event: 50% refund, or a full credit towards another hike within 6 months.",
            "Less than 3 days before the event: no refund, because permits, catering and reserve fees are already paid. You may send someone else in your place.",
          ],
        },
        {
          heading: "Cancelling a camping weekend or getaway",
          paragraphs: [
            "Overnight trips are booked and paid for in advance with accommodation providers, so the timelines are longer.",
          ],
          bullets: [
            "More than 30 days before departure: full refund less a 10% administration fee.",
            "14 to 30 days before departure: 50% refund.",
            "Less than 14 days before departure: no refund. You may transfer your spot to another person.",
          ],
        },
        {
          heading: "Transferring your spot",
          paragraphs: [
            `You can give your spot to someone else at any time before the event at no charge. Email ${site.email} with your booking reference and the new hiker's name, email and phone number so that we can update the attendee list.`,
          ],
        },
        {
          heading: "If we cancel",
          paragraphs: [
            "If we cancel an event because of weather, safety or access issues, you choose between a full refund or moving your booking to the next available date. We always try to postpone rather than cancel.",
          ],
        },
        {
          heading: "No shows and late arrivals",
          paragraphs: [
            "Late arrivals may not be accommodated once the hike has started, and no-shows are not refunded. Please arrive within the arrival window on your event page.",
          ],
        },
        {
          heading: "How to cancel",
          paragraphs: [
            `Email ${site.email} or WhatsApp us with your booking reference. Refunds are processed back to the original payment method within 10 working days.`,
          ],
        },
      ]}
    />
  );
}
