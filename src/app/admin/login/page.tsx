import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/logo";
import { isAuthenticated, usingDefaultPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur sm:p-10">
        <LogoMark tone="light" className="h-14" />
        <h1 className="display mt-6 text-3xl text-white">Club admin</h1>
        <p className="mt-3 text-sm text-white/60">
          Sign in to manage events, check hikers in, and view attendee lists.
        </p>

        <LoginForm />

        {usingDefaultPassword() && (
          <p className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/50">
            No <code className="text-forest-300">ADMIN_PASSWORD</code> is set, so
            the demo password <strong className="text-white">trailboss</strong>{" "}
            is active. Set the environment variable before going live.
          </p>
        )}
      </div>
    </div>
  );
}
