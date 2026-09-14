"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitBooking, type BookingFormState } from "@/app/actions/booking";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { availableDistances, formatDate, formatPrice, formatPriceExact } from "@/lib/format";
import { site } from "@/lib/site";
import type { EventWithAvailability, PaymentMethod, TrailDistance } from "@/lib/types";

const initialState: BookingFormState = { status: "idle" };

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-display text-sm font-bold tracking-tight text-forest-900">
          {label}
        </span>
        {hint && <span className="text-xs text-stone">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-xs font-semibold text-clay">{error}</span>}
    </label>
  );
}

const inputClasses =
  "w-full rounded-2xl border border-forest-900/15 bg-white px-4 py-3.5 text-base text-forest-900 outline-none transition-all duration-200 placeholder:text-stone/60 focus:border-forest-600 focus:ring-4 focus:ring-forest-600/10";

function SubmitButton({ total }: { total: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClasses("primary", "lg", "w-full")}
    >
      {pending ? "Confirming your spot…" : `Confirm booking · ${total}`}
      {!pending && <ArrowIcon />}
    </button>
  );
}

export function BookingForm({ event }: { event: EventWithAvailability }) {
  const distances = availableDistances(event);
  const isPaid = event.priceCents > 0;

  const [step, setStep] = useState(0);
  const [distance, setDistance] = useState<TrailDistance>(distances[0] ?? "5KM");
  const [people, setPeople] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isPaid ? "card" : "free");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const [state, formAction] = useActionState(submitBooking, initialState);

  const steps = useMemo(
    () =>
      [
        { id: "trail", label: "Trail" },
        { id: "details", label: "Your details" },
        ...(isPaid ? [{ id: "payment", label: "Payment" }] : []),
        { id: "confirm", label: "Confirm" },
      ] as const,
    [isPaid],
  );

  const total = event.priceCents * people;
  const maxPeople = Math.min(10, event.spotsRemaining);

  const errors = { ...state.fieldErrors, ...localErrors };

  function validateStep(index: number): boolean {
    const next: Record<string, string> = {};
    const current = steps[index].id;

    if (current === "trail") {
      if (people < 1) next.people = "Select at least one spot.";
      if (people > maxPeople) {
        next.people = `Only ${maxPeople} ${maxPeople === 1 ? "spot is" : "spots are"} left.`;
      }
    }

    if (current === "details") {
      if (name.trim().length < 2) next.name = "Please enter your full name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
        next.email = "Please enter a valid email address.";
      }
      if (!/^[0-9+()\s-]{9,20}$/.test(phone.trim())) {
        next.phone = "Please enter a valid phone number.";
      }
    }

    setLocalErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((value) => Math.min(value + 1, steps.length - 1));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: Math.max(0, (document.getElementById("booking-form")?.offsetTop ?? 0) - 110), behavior: "smooth" });
    }
  }

  function goBack() {
    setLocalErrors({});
    setStep((value) => Math.max(value - 1, 0));
  }

  const currentStep = steps[step].id;

  return (
    <div id="booking-form" className="scroll-mt-28">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {steps.map((item, index) => (
          <li key={item.id} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              disabled={index > step}
              className={cn(
                "flex items-center gap-2 text-sm font-semibold transition-colors",
                index === step
                  ? "text-forest-800"
                  : index < step
                    ? "text-forest-600 hover:text-forest-800"
                    : "text-stone/60",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all",
                  index === step
                    ? "border-forest-800 bg-forest-800 text-white"
                    : index < step
                      ? "border-forest-600 bg-forest-100 text-forest-700"
                      : "border-forest-900/15 text-stone/70",
                )}
              >
                {index < step ? "✓" : index + 1}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
            {index < steps.length - 1 && (
              <span className="h-px w-5 bg-forest-900/15 sm:w-8" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      <form action={formAction} className="mt-8">
        <input type="hidden" name="eventSlug" value={event.slug} />
        <input type="hidden" name="distance" value={distance} />
        <input type="hidden" name="people" value={people} />
        <input type="hidden" name="paymentMethod" value={paymentMethod} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="notes" value={notes} />

        {state.status === "error" && state.message && (
          <p
            role="alert"
            className="mb-6 rounded-2xl border border-clay/30 bg-clay/10 px-5 py-4 text-sm font-semibold text-clay"
          >
            {state.message}
          </p>
        )}

        {/* Step 1 — trail + spots ------------------------------------------ */}
        <section hidden={currentStep !== "trail"} className="space-y-7">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Choose your trail</h2>
            <p className="mt-2 text-sm text-stone">
              Both routes start together and finish at the same base camp.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {distances.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDistance(option)}
                  aria-pressed={distance === option}
                  className={cn(
                    "rounded-3xl border p-5 text-left transition-all duration-300",
                    distance === option
                      ? "border-forest-700 bg-forest-900 text-white shadow-[0_18px_40px_-24px_rgba(6,26,17,0.9)]"
                      : "border-forest-900/15 bg-white hover:border-forest-600",
                  )}
                >
                  <span className="font-display text-2xl font-extrabold tracking-tight">
                    {option}
                  </span>
                  <span
                    className={cn(
                      "mt-2 block text-sm",
                      distance === option ? "text-white/70" : "text-stone",
                    )}
                  >
                    {option === "5KM"
                      ? "Relaxed pace, great for first timers and families."
                      : "Longer route with the bigger climbs and views."}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Field
              label="How many people?"
              hint={`${event.spotsRemaining} spots left`}
              error={errors.people}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Remove one person"
                  onClick={() => setPeople((value) => Math.max(1, value - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-forest-900/15 text-xl font-bold text-forest-900 transition-colors hover:border-forest-700 hover:bg-forest-900 hover:text-white"
                >
                  −
                </button>
                <span className="min-w-14 text-center font-display text-3xl font-extrabold tracking-tight text-forest-900">
                  {people}
                </span>
                <button
                  type="button"
                  aria-label="Add one person"
                  onClick={() => setPeople((value) => Math.min(maxPeople, value + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-forest-900/15 text-xl font-bold text-forest-900 transition-colors hover:border-forest-700 hover:bg-forest-900 hover:text-white"
                >
                  +
                </button>
                <span className="ml-2 text-sm text-stone">
                  {isPaid ? `${formatPrice(event.priceCents)} per person` : "Free event"}
                </span>
              </div>
            </Field>
          </div>
        </section>

        {/* Step 2 — details ------------------------------------------------- */}
        <section hidden={currentStep !== "details"} className="space-y-5">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Your details</h2>
            <p className="mt-2 text-sm text-stone">
              We use these to send your confirmation and add you to the event
              WhatsApp group.
            </p>
          </div>

          <Field label="Full name" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Thabo Mokoena"
              autoComplete="name"
              className={inputClasses}
            />
          </Field>

          <Field label="Email address" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.co.za"
              autoComplete="email"
              inputMode="email"
              className={inputClasses}
            />
          </Field>

          <Field label="Phone number" hint="WhatsApp preferred" error={errors.phone}>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="082 123 4567"
              autoComplete="tel"
              inputMode="tel"
              className={inputClasses}
            />
          </Field>

          <Field label="Anything we should know?" hint="Optional">
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Dietary requirements, transport from Pretoria, hiking with kids…"
              className={cn(inputClasses, "resize-y")}
            />
          </Field>
        </section>

        {/* Step 3 — payment -------------------------------------------------- */}
        {isPaid && (
          <section hidden={currentStep !== "payment"} className="space-y-5">
            <div>
              <h2 className="display text-2xl sm:text-3xl">Payment</h2>
              <p className="mt-2 text-sm text-stone">
                {formatPrice(event.priceCents)} × {people}{" "}
                {people === 1 ? "person" : "people"} ={" "}
                <strong className="text-forest-900">{formatPriceExact(total)}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                aria-pressed={paymentMethod === "card"}
                className={cn(
                  "w-full rounded-3xl border p-5 text-left transition-all duration-300",
                  paymentMethod === "card"
                    ? "border-forest-700 bg-forest-900 text-white"
                    : "border-forest-900/15 bg-white hover:border-forest-600",
                )}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="font-display text-lg font-bold tracking-tight">
                    Pay now by card
                  </span>
                  <span className="text-sm opacity-80">Instant confirmation</span>
                </span>
                <span
                  className={cn(
                    "mt-2 block text-sm",
                    paymentMethod === "card" ? "text-white/70" : "text-stone",
                  )}
                >
                  Secure checkout. Your spot is confirmed the moment payment goes
                  through.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("eft")}
                aria-pressed={paymentMethod === "eft"}
                className={cn(
                  "w-full rounded-3xl border p-5 text-left transition-all duration-300",
                  paymentMethod === "eft"
                    ? "border-forest-700 bg-forest-900 text-white"
                    : "border-forest-900/15 bg-white hover:border-forest-600",
                )}
              >
                <span className="flex items-center justify-between gap-4">
                  <span className="font-display text-lg font-bold tracking-tight">
                    Pay by EFT
                  </span>
                  <span className="text-sm opacity-80">48 hours to pay</span>
                </span>
                <span
                  className={cn(
                    "mt-2 block text-sm",
                    paymentMethod === "eft" ? "text-white/70" : "text-stone",
                  )}
                >
                  We hold your spot and email you the banking details with your
                  reference.
                </span>
              </button>
            </div>

            {paymentMethod === "eft" && (
              <div className="rounded-3xl bg-sand/70 p-5 text-sm text-forest-900/80">
                <p className="font-display text-base font-bold tracking-tight text-forest-900">
                  {site.bank.accountName}
                </p>
                <p className="mt-2 leading-relaxed">
                  {site.bank.bank} · Account {site.bank.accountNumber}
                  <br />
                  Branch code {site.bank.branchCode}
                  <br />
                  Use your booking reference as the payment reference.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Step 4 — review --------------------------------------------------- */}
        <section hidden={currentStep !== "confirm"} className="space-y-6">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Check and confirm</h2>
            <p className="mt-2 text-sm text-stone">
              One last look before we lock in your spot.
            </p>
          </div>

          <dl className="divide-y divide-forest-900/10 overflow-hidden rounded-3xl border border-forest-900/10 bg-white">
            {[
              ["Event", event.title],
              ["Date", formatDate(event.date)],
              ["Arrival", `${event.arrivalTime} · hike starts ${event.startTime}`],
              ["Meeting point", event.meetingPoint],
              ["Trail", distance],
              ["People", String(people)],
              ["Name", name || "—"],
              ["Email", email || "—"],
              ["Phone", phone || "—"],
              [
                "Payment",
                isPaid
                  ? paymentMethod === "card"
                    ? `Card · ${formatPriceExact(total)}`
                    : `EFT · ${formatPriceExact(total)}`
                  : "Free event",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-6 px-5 py-3.5">
                <dt className="text-sm text-stone">{label}</dt>
                <dd className="text-right text-sm font-semibold text-forest-900">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-3xl border border-clay/25 bg-clay/8 p-5">
            <p className="font-display text-base font-bold tracking-tight text-forest-950">
              ⏰ Please arrive on time
            </p>
            <p className="mt-2 text-sm text-forest-900/75">
              Late arrivals may not be accommodated once the hike has started. Be
              at {event.meetingPoint} by {event.arrivalTime}.
            </p>
          </div>

          <SubmitButton total={isPaid ? formatPriceExact(total) : "Free"} />

          <p className="text-center text-xs leading-relaxed text-stone">
            By booking you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/cancellation-policy" className="underline underline-offset-2">
              cancellation policy
            </Link>
            .
          </p>
        </section>

        {currentStep !== "confirm" && (
          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button type="button" onClick={goBack} className={buttonClasses("outlineDark", "md")}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" onClick={goNext} className={buttonClasses("primary", "md")}>
              Continue
              <ArrowIcon />
            </button>
          </div>
        )}

        {currentStep === "confirm" && step > 0 && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-semibold text-stone underline underline-offset-4 hover:text-forest-800"
            >
              Back
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
