import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/actions/admin";
import { LogoMark } from "@/components/logo";
import { isAuthenticated, usingDefaultPassword } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Club admin",
  robots: { index: false, follow: false },
};

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/events/new", label: "New event" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  return (
    <div className="flex min-h-screen flex-col bg-forest-950">
      {authenticated && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-950/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
            <Link href="/admin" className="flex items-center gap-2.5 text-white">
              <LogoMark className="h-8 w-8" />
              <span className="font-display text-base font-extrabold tracking-tight">
                PHC Admin
              </span>
            </Link>

            <nav className="flex flex-1 flex-wrap items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/20 px-3.5 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white hover:text-forest-950"
              >
                View site
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          {usingDefaultPassword() && (
            <p className="bg-ember px-5 py-2 text-center text-xs font-semibold text-ink sm:px-8">
              Demo mode: set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your
              environment before going live.
            </p>
          )}
        </header>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
}
