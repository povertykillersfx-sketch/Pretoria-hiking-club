import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal information under POPIA.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="What we collect when you book, why we need it and how we look after it."
      image="/images/gallery-forest-bridge.jpg"
      sections={[
        {
          heading: "Who we are",
          paragraphs: [
            `${site.name} is a hiking and outdoor community based in ${site.city}. We are the responsible party for the personal information described in this policy, in terms of the Protection of Personal Information Act (POPIA).`,
          ],
        },
        {
          heading: "What we collect",
          bullets: [
            "Your name, email address and phone number when you book an event or contact us.",
            "The number of people in your booking, your trail choice and any notes you give us (for example dietary requirements).",
            "Payment status for your booking. Card details are handled by our payment provider and are never stored on our servers.",
            "Basic, anonymous analytics about how the website is used.",
          ],
        },
        {
          heading: "Why we use it",
          bullets: [
            "To confirm your booking and send you the event details.",
            "To manage attendee lists, capacity and safety on the day.",
            "To add you to the event WhatsApp group when you ask us to.",
            "To let you know about upcoming hikes. Every email has an unsubscribe link.",
          ],
        },
        {
          heading: "Who we share it with",
          paragraphs: [
            "We do not sell your personal information. We share only what is necessary with service providers who help us run events — for example the email provider that delivers your confirmation, the payment gateway that processes your payment, or a reserve that requires an attendee list for entry.",
          ],
        },
        {
          heading: "How long we keep it",
          paragraphs: [
            "Booking records are kept for three years for accounting and safety reasons. Contact enquiries are kept for one year. You can ask us to delete your information at any time.",
          ],
        },
        {
          heading: "Your rights",
          bullets: [
            "Ask us what personal information we hold about you.",
            "Ask us to correct or delete your information.",
            "Object to receiving marketing emails at any time.",
            "Lodge a complaint with the Information Regulator of South Africa.",
          ],
        },
        {
          heading: "Photography",
          paragraphs: [
            "We photograph our events and use those photos on this website and on social media. Let us know if you would prefer not to appear and we will remove any image you point out.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "This website uses a single session cookie for the club administrator login. No advertising or third-party tracking cookies are used.",
          ],
        },
      ]}
    />
  );
}
