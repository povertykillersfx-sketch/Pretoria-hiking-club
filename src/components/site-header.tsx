"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/events", label: "Upcoming Hikes" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#hiking-day", label: "The Day" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onDarkHero = pathname === "/";
  const solid = scrolled || !onDarkHero || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "border-b border-forest-900/10 bg-bone/90 backdrop-blur-xl"
          : "bg-linear-to-b from-black/45 to-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
        <Link href="/" aria-label={`${"Pretoria Hiking Club"} home`} className="shrink-0">
          <Logo tone={solid ? "dark" : "light"} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
                  solid
                    ? active
                      ? "bg-forest-900/5 text-forest-800"
                      : "text-forest-900/70 hover:bg-forest-900/5 hover:text-forest-800"
                    : "text-white/85 hover:bg-white/10 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/book"
            className={cn(
              buttonClasses(solid ? "primary" : "light", "sm", "hidden sm:inline-flex"),
            )}
          >
            Book Your Spot
            <ArrowIcon />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden",
              solid
                ? "border-forest-900/15 text-forest-900"
                : "border-white/30 text-white",
            )}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3.5 w-5">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300",
                  open ? "top-1.5 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1.5 block h-0.5 w-5 rounded bg-current transition-all duration-200",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-5 rounded bg-current transition-all duration-300",
                  open ? "top-1.5 -rotate-45" : "top-3",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-forest-900/10 bg-bone transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-5 sm:px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3.5 font-display text-xl font-bold tracking-tight text-forest-900 transition-colors hover:bg-forest-900/5"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/book" className={buttonClasses("primary", "lg", "mt-3 w-full")}>
            Book Your Spot
            <ArrowIcon />
          </Link>
        </nav>
      </div>
    </header>
  );
}
