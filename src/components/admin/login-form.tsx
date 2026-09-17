"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/actions/admin";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-forest-500 px-6 py-3.5 font-display font-bold tracking-tight text-white transition-colors hover:bg-forest-400 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="font-display text-sm font-bold tracking-tight text-white">
          Admin password
        </span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full rounded-2xl border border-white/15 bg-forest-950/60 px-4 py-3.5 text-white outline-none transition-all placeholder:text-white/30 focus:border-forest-400 focus:ring-4 focus:ring-forest-400/15"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p role="alert" className="text-sm font-semibold text-ember">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
