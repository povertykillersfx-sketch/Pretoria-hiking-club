"use client";

import { useEffect } from "react";

export function PaymentUnlockPoller({ reference }: { reference: string }) {
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch(`/api/bookings/${reference}/status`, {
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { qrUnlocked?: boolean };
        if (data.qrUnlocked) window.location.reload();
      } catch {
        // Keep waiting — Yoco may still be confirming.
      }
    }

    const timer = window.setInterval(() => {
      void check();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [reference]);

  return null;
}
