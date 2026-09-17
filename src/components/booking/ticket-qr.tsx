"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { buttonClasses } from "@/components/ui/button";
import { qrPayload } from "@/lib/qr";

export function TicketQr({
  token,
  reference,
}: {
  token: string;
  reference: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayload(token), {
      width: 360,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#061a11", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="rounded-4xl border border-forest-900/10 bg-white p-6 text-center">
      <p className="eyebrow text-forest-600">Your check-in code</p>
      <p className="mt-2 text-sm text-stone">
        Show this at the trailhead. It only works for this hike.
      </p>
      <div className="mx-auto mt-5 flex h-56 w-56 items-center justify-center rounded-3xl bg-bone p-3">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL
          <img src={dataUrl} alt={`Check-in QR code for ${reference}`} className="h-full w-full" />
        ) : (
          <p className="text-sm text-stone">Loading code…</p>
        )}
      </div>
      <p className="mt-4 font-display text-lg font-extrabold tracking-tight text-forest-950">
        {reference}
      </p>
      <a
        href={`/api/bookings/${reference}/qr.png`}
        download={`${reference}-checkin.png`}
        className={buttonClasses("outlineDark", "md", "mt-5")}
      >
        Download QR
      </a>
    </div>
  );
}
