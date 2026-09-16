import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { site } from "@/lib/site";

const exploreLinks = [
  { href: "/events", label: "Upcoming Events" },
  { href: "/book", label: "Book a Hike" },
  { href: "/ticket", label: "Find my ticket" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
];

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cancellation-policy", label: "Cancellation Policy" },
  { href: "/privacy", label: "Privacy Policy" },
];

const socialLinks = [
  { href: site.instagram, label: "Instagram" },
  { href: site.whatsapp, label: "WhatsApp" },
  { href: site.tiktok, label: "TikTok" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-forest-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-clay/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-20 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-forest-300">Ready when you are</p>
            <h2 className="display mt-4 text-4xl text-white sm:text-6xl">
              Your next adventure starts here.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              One booking is all it takes. Pick a hike, choose 5KM or 10KM and
              we will see you at the trailhead.
            </p>
          </div>
          <Link href="/book" className={buttonClasses("ember", "lg", "self-start")}>
            Book Your Spot
            <ArrowIcon />
          </Link>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              A community of 1,000+ hikers exploring South Africa&apos;s best
              trails, camp sites and coastlines — one weekend at a time.
            </p>
            <p className="mt-5 text-sm text-white/60">{site.city}</p>
          </div>

          <div>
            <h3 className="eyebrow text-forest-300">Explore</h3>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-forest-300">Connect</h3>
            <ul className="mt-5 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-forest-300">Legal</h3>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-white/40 transition-colors hover:text-white"
                >
                  Club admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Built for hikers, by hikers. Hike. Connect. Explore.</p>
        </div>
      </div>
    </footer>
  );
}
