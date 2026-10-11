"use client";

import { useMemo } from "react";
import { computeBookingTotalCents, formatPriceExact } from "@/lib/format";

export function BookingTotal({
  priceCents,
  quantity,
}: {
  priceCents: number;
  quantity: number;
}) {
  const totalCents = useMemo(
    () => computeBookingTotalCents(priceCents, quantity),
    [priceCents, quantity],
  );

  if (priceCents <= 0) {
    return (
      <p className="rounded-3xl bg-sand/70 px-5 py-4 text-sm font-semibold text-forest-900">
        This hike is free.
      </p>
    );
  }

  return (
    <div
      className="rounded-3xl border border-forest-900/10 bg-sand/60 p-5"
      data-booking-total
      data-price-cents={priceCents}
      data-quantity={quantity}
    >
      <p className="eyebrow text-forest-600">Your total</p>
      <dl className="mt-3 space-y-2 text-sm text-forest-900/80">
        <div className="flex items-center justify-between gap-4">
          <dt>Price per person</dt>
          <dd className="font-semibold text-forest-950">{formatPriceExact(priceCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>Tickets</dt>
          <dd className="font-semibold text-forest-950">{quantity}</dd>
        </div>
      </dl>
      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">
          Total due
        </span>
        <input
          readOnly
          aria-readonly="true"
          tabIndex={-1}
          value={formatPriceExact(totalCents)}
          className="mt-2 w-full cursor-default rounded-2xl border border-forest-900/10 bg-white px-4 py-3 font-display text-2xl font-extrabold tracking-tight text-forest-950 outline-none"
        />
      </label>
    </div>
  );
}
