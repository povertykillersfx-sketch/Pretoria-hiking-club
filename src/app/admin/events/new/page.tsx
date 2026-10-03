import Link from "next/link";
import { redirect } from "next/navigation";
import { EventForm } from "@/components/admin/event-form";
import { isAuthenticated } from "@/lib/auth";
import { getImageLibrary } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/admin/events"
        className="text-sm font-semibold text-forest-300 underline underline-offset-4"
      >
        ← Back to events
      </Link>
      <h1 className="display mt-5 text-4xl text-white sm:text-5xl">New event</h1>
      <p className="mt-3 text-white/60">
        Set the date, capacity, trail options and price. Publish it and it goes
        live on the website immediately.
      </p>

      <div className="mt-10">
        <EventForm library={getImageLibrary()} />
      </div>
    </div>
  );
}
