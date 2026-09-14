import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Pretoria Hiking Club about hikes, bookings, group events or corporate team building.",
  alternates: { canonical: "/contact" },
};

const faqs = [
  {
    question: "I have never hiked before — can I join?",
    answer:
      "Absolutely. Start on the 5KM route. It is a relaxed pace with a trail leader at the front and a sweeper at the back so nobody is ever alone.",
  },
  {
    question: "Can I bring my kids or my parents?",
    answer:
      "Yes. All ages are welcome. The 5KM route suits most families — just let us know in the notes when you book so we can plan for the group.",
  },
  {
    question: "What happens if it rains?",
    answer:
      "Light rain is part of the adventure. If conditions are unsafe we postpone and move your booking to the new date, or refund you in full.",
  },
  {
    question: "How do I pay?",
    answer:
      "Pay by card when you book for instant confirmation, or choose EFT and we hold your spot for 48 hours while you make the payment.",
  },
  {
    question: "Do you do corporate or private group hikes?",
    answer:
      "We do. Send us a message with your group size and the date you have in mind and we will put a proposal together.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Talk to the crew"
        description="Questions about a hike, a booking or a private group event? We usually reply within 24 hours."
        image="/images/gallery-forest-road.jpg"
        imageAlt="Road leading into a misty forest"
        compact
      />

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-10">
          <div>
            <h2 className="display text-3xl sm:text-4xl">Send us a message</h2>
            <p className="mt-3 text-stone">
              Fill this in and we will come back to you by email.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-4xl border border-forest-900/10 bg-white p-7">
              <h3 className="font-display text-xl font-bold tracking-tight text-forest-900">
                Reach us directly
              </h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  <p className="text-stone">Email</p>
                  <a
                    href={`mailto:${site.email}`}
                    className="font-semibold text-forest-800 underline underline-offset-4"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <p className="text-stone">WhatsApp</p>
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-forest-800 underline underline-offset-4"
                  >
                    Message the crew
                  </a>
                </li>
                <li>
                  <p className="text-stone">Instagram</p>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-forest-800 underline underline-offset-4"
                  >
                    @pretoriahikingclub
                  </a>
                </li>
                <li>
                  <p className="text-stone">Based in</p>
                  <p className="font-semibold text-forest-900">{site.city}</p>
                </li>
              </ul>
            </div>

            <div className="rounded-4xl bg-forest-950 p-7 text-white">
              <h3 className="font-display text-xl font-bold tracking-tight">
                Looking to book?
              </h3>
              <p className="mt-3 text-sm text-white/70">
                You do not need to contact us first — every event can be booked
                straight from the website in about two minutes.
              </p>
              <Link
                href="/book"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-display text-sm font-bold tracking-tight text-forest-900 transition-colors hover:bg-forest-100"
              >
                Book your spot
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand/50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
          <h2 className="display text-3xl sm:text-4xl">Frequently asked</h2>
          <dl className="mt-8 divide-y divide-forest-900/10 border-y border-forest-900/10">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6">
                <dt className="font-display text-lg font-bold tracking-tight text-forest-900">
                  {faq.question}
                </dt>
                <dd className="mt-2.5 leading-relaxed text-stone">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
