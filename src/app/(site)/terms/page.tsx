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
      intro="The house rules that keep our events safe, organised and enjoyable for everyone."
      image="/images/gallery-green-valley.jpg"
      sections={[
        {
          heading: "1. Booking and confirmation",
          paragraphs: [
            "A booking is only confirmed once you receive a confirmation email with your booking reference. Card payments confirm immediately. EFT bookings are held for 48 hours and are released if payment has not been received.",
            "Each booking may include up to 10 people. Every person attending must be included in the number of spots you book, including children.",
          ],
        },
        {
          heading: "2. Capacity and sold out events",
          paragraphs: [
            "Every event has a fixed capacity so that our trail leaders can look after the group properly. When an event is fully booked, online bookings close automatically and the event is marked as sold out. Waiting list requests can be sent to " +
              site.email +
              ".",
          ],
        },
        {
          heading: "3. Arrival times",
          paragraphs: [
            "Please arrive within the arrival window shown on your event page. Late arrivals may not be accommodated once the hike has started, and no refund is given in that case. This is a safety requirement, not an inconvenience — we cannot send people onto a trail behind a moving group.",
          ],
        },
        {
          heading: "4. Fitness, health and safety",
          paragraphs: [
            "Hiking carries inherent risk. By booking you confirm that you are medically fit to take part in the route you have selected, and that you will follow the instructions of the trail leaders at all times.",
            "Tell us about any medical condition, allergy or injury in the notes field when you book, or email us before the event. We carry a basic first aid kit but we are not a medical service.",
          ],
          bullets: [
            "Choose the 5KM route if you are unsure of your fitness level.",
            "Children must be accompanied by a responsible adult at all times.",
            "Alcohol is not permitted on the trail, only at the social afterwards where it is allowed by the venue.",
          ],
        },
        {
          heading: "5. Liability",
          paragraphs: [
            `${site.name}, its organisers and volunteers are not liable for personal injury, loss or damage to property arising from participation in any event, except where caused by gross negligence. Participants take part at their own risk.`,
          ],
        },
        {
          heading: "6. Photography",
          paragraphs: [
            "We take photos and video at our events and use them on this website and on social media. If you would prefer not to appear in club photos, tell us on the day or email us and we will remove the images.",
          ],
        },
        {
          heading: "7. Conduct",
          paragraphs: [
            "We are a welcoming, inclusive community. Harassment, discrimination or aggressive behaviour of any kind results in removal from the event and the club without a refund. Leave the trail cleaner than you found it — everything you carry in, you carry out.",
          ],
        },
        {
          heading: "8. Changes to events",
          paragraphs: [
            "Routes, schedules and venues can change because of weather, access permissions or safety. We communicate changes by email and on the event WhatsApp group as early as possible. If we cancel an event, you can move your booking to another date or receive a full refund.",
          ],
        },
      ]}
    />
  );
}
