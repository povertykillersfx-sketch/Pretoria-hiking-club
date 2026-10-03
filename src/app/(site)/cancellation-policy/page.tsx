import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: `When ${site.name} issues refunds, and how to request one if we cancel an event.`,
  alternates: { canonical: "/cancellation-policy" },
};

export default function CancellationPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cancellation Policy"
      intro="Please read this before you book. Refunds are only issued when we cancel or postpone an event."
      image="/images/gallery-mountain-lake.jpg"
      sections={[
        {
          heading: "Event cancellations by organisers",
          paragraphs: [
            "The Pretoria Hiking Club reserves the right to cancel or postpone any scheduled hike or event due to unforeseen circumstances, including but not limited to adverse weather conditions or issues affecting the safety or accessibility of the hiking location. In such cases, participants will be notified as soon as possible, and a full refund will be issued.",
          ],
        },
        {
          heading: "Participant cancellations",
          paragraphs: [
            "Except in the case of an organiser-initiated cancellation as outlined above, refunds will not be provided for hikes or events. We encourage participants to confirm their availability before booking.",
          ],
        },
        {
          heading: "How to request a refund",
          paragraphs: [
            "If your event is cancelled by the organisers, please contact us on +27 67 986 2379 with your booking reference and proof of payment, and your refund will be processed promptly.",
            "Thank you for your understanding and for being part of the Pretoria Hiking Club community.",
          ],
        },
      ]}
    />
  );
}
