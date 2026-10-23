"use client";

import { useEffect } from "react";

export function StartYocoCheckout({ url }: { url: string }) {
  useEffect(() => {
    window.location.assign(url);
  }, [url]);

  return (
    <p className="mt-3 text-sm text-forest-900/70">
      Opening Yoco checkout…
    </p>
  );
}
