import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { site } from "@/lib/site";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  image,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={intro} image={image} compact />

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8 lg:px-10">
          <p className="text-sm text-stone">
            Last updated{" "}
            {new Date().toLocaleDateString("en-ZA", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-4 leading-relaxed text-forest-900/80">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 leading-relaxed text-forest-900/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-4xl border border-forest-900/10 bg-white p-7">
            <h2 className="font-display text-lg font-bold tracking-tight text-forest-950">
              Questions about this policy?
            </h2>
            <p className="mt-3 text-forest-900/75">
              Email us at{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-forest-700 underline underline-offset-4"
              >
                {site.email}
              </a>{" "}
              or{" "}
              <Link href="/contact" className="font-semibold text-forest-700 underline underline-offset-4">
                send us a message
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
