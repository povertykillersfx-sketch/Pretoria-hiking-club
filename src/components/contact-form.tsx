"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactFormState } from "@/app/actions/booking";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const initialState: ContactFormState = { status: "idle" };

const input =
  "w-full rounded-2xl border border-forest-900/15 bg-white px-4 py-3.5 text-base text-forest-900 outline-none transition-all placeholder:text-stone/60 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "w-full")}>
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  if (state.status === "sent") {
    return (
      <div className="rounded-4xl border border-forest-600/30 bg-forest-100 p-8 text-center">
        <p className="font-display text-2xl font-bold tracking-tight text-forest-900">
          Message sent 🥾
        </p>
        <p className="mt-3 text-forest-900/70">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="font-display text-sm font-bold tracking-tight text-forest-900">
          Your name
        </span>
        <input name="name" className={cn(input, "mt-2")} placeholder="Thabo Mokoena" />
        {state.fieldErrors?.name && (
          <span className="mt-1.5 block text-xs font-semibold text-clay">
            {state.fieldErrors.name}
          </span>
        )}
      </label>

      <label className="block">
        <span className="font-display text-sm font-bold tracking-tight text-forest-900">
          Email address
        </span>
        <input name="email" type="email" className={cn(input, "mt-2")} placeholder="you@email.co.za" />
        {state.fieldErrors?.email && (
          <span className="mt-1.5 block text-xs font-semibold text-clay">
            {state.fieldErrors.email}
          </span>
        )}
      </label>

      <label className="block">
        <span className="font-display text-sm font-bold tracking-tight text-forest-900">
          Message
        </span>
        <textarea
          name="message"
          rows={5}
          className={cn(input, "mt-2 resize-y")}
          placeholder="Which hike are you interested in?"
        />
        {state.fieldErrors?.message && (
          <span className="mt-1.5 block text-xs font-semibold text-clay">
            {state.fieldErrors.message}
          </span>
        )}
      </label>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm font-semibold text-clay">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
