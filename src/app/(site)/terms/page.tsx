import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms and conditions that apply to ${site.name} events and bookings.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="By registering for or participating in any Pretoria Hiking Club event, you agree to these terms."
      image="/images/gallery-green-valley.jpg"
      sections={[
        {
          heading: "1. Acceptance of terms",
          paragraphs: [
            'By registering for or participating in any event, hike, or activity organised by the Pretoria Hiking Club ("the Club"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not book or participate in our events.',
          ],
        },
        {
          heading: "2. Eligibility & health requirements",
          paragraphs: [
            "Participants are responsible for ensuring they are physically fit and medically able to take part in the chosen hike or event. Should you have any pre-existing medical conditions, injuries, or concerns, please consult a medical professional before joining and inform the organisers in advance.",
          ],
        },
        {
          heading: "3. Assumption of risk",
          paragraphs: [
            "Hiking and outdoor activities carry inherent risks, including but not limited to uneven terrain, weather exposure, wildlife encounters, and physical exertion. By participating, you acknowledge these risks and voluntarily assume full responsibility for your own safety and wellbeing during Club events.",
          ],
        },
        {
          heading: "4. Cancellation policy",
          paragraphs: [
            "Events may be cancelled by the organisers due to unforeseen bad weather or location-related issues, in which case a full refund will be issued upon request. Refunds will not be provided for cancellations initiated by participants or for any other circumstances. See our full Cancellation Policy for details.",
          ],
        },
        {
          heading: "5. Code of conduct",
          paragraphs: [
            "Participants are expected to treat fellow hikers, organisers, and the natural environment with respect. The Club reserves the right to remove any participant from an event without refund for behaviour that endangers others, damages the environment, or disrupts the group.",
          ],
        },
        {
          heading: "6. Photography and media",
          paragraphs: [
            "By attending our events, you automatically consent to being photographed or filmed for promotional purposes, including on social media.",
          ],
        },
        {
          heading: "7. Changes to these terms",
          paragraphs: [
            "The Club reserves the right to amend these Terms and Conditions at any time. Continued participation in events following any changes constitutes acceptance of the updated terms.",
          ],
        },
      ]}
    />
  );
}
