"use client";

import { useActionState } from "react";
import { lookupTicket, type TicketLookupState } from "@/app/actions/ticket";
import { buttonClasses } from "@/components/ui/button";

const initial: TicketLookupState = { status: "idle" };

export function TicketLookupForm() {
  const [state, action, pending] = useActionState(lookupTicket, initial);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-forest-900">Booking reference</span>
        <input
          name="reference"
          required
          autoComplete="off"
          placeholder="PHC-8F3K21"
          className="mt-2 w-full rounded-2xl border border-forest-900/15 bg-white px-4 py-3 text-forest-950 outline-none ring-forest-400 focus:ring-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-forest-900">Email you booked with</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.co.za"
          className="mt-2 w-full rounded-2xl border border-forest-900/15 bg-white px-4 py-3 text-forest-950 outline-none ring-forest-400 focus:ring-2"
        />
      </label>
      {state.status === "error" && state.message ? (
        <p className="rounded-2xl bg-ember/10 px-4 py-3 text-sm font-semibold text-clay">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "w-full")}>
        {pending ? "Looking up…" : "Show my QR code"}
      </button>
    </form>
  );
}
