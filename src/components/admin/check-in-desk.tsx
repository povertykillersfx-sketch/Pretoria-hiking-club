"use client";

import jsQR from "jsqr";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchCheckIn, submitCheckIn, type CheckInView, type SearchHit } from "@/app/actions/checkin";
import { cn } from "@/lib/cn";

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

export function CheckInDesk({
  eventId,
  eventTitle,
}: {
  eventId: number;
  eventTitle: string;
}) {
  const [result, setResult] = useState<CheckInView | null>(null);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<{ query: string; rows: SearchHit[] }>({
    query: "",
    rows: [],
  });
  const lock = useRef(false);
  const paused = Boolean(result) || busy;
  const visibleHits = hits.query === query ? hits.rows : [];
  const searching = query.trim().length >= 2 && hits.query !== query;

  const handleCode = useCallback(
    async (code: string) => {
      if (lock.current) return;
      lock.current = true;
      setBusy(true);
      try {
        const next = await submitCheckIn(eventId, code);
        setResult(next);
      } catch {
        setResult({
          ok: false,
          message: "Check-in could not be completed. Sign in again if your session expired.",
        });
        lock.current = false;
      } finally {
        setBusy(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    if (query.trim().length < 2) return;
    const requested = query;
    const timer = window.setTimeout(() => {
      searchCheckIn(eventId, requested)
        .then((rows) => setHits({ query: requested, rows }))
        .catch(() => setHits({ query: requested, rows: [] }));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [eventId, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <h2 className="font-display text-xl font-bold tracking-tight text-white">Scan QR</h2>
        <p className="mt-1 text-sm text-white/55">
          Point the camera at the hiker&apos;s phone. Checking in for {eventTitle}.
        </p>
        <QrCamera paused={paused} onCode={handleCode} onError={setCameraError} />
        {cameraError ? (
          <p className="mt-3 rounded-2xl bg-ember/15 px-4 py-3 text-sm font-semibold text-ember">
            {cameraError} Use the search box if the camera is not available.
          </p>
        ) : null}
      </section>

      <section className="space-y-5">
        {result ? (
          <ResultCard
            result={result}
            onNext={() => {
              lock.current = false;
              setResult(null);
              setQuery("");
              setHits({ query: "", rows: [] });
            }}
          />
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Phone won&apos;t show the QR?
            </h2>
            <p className="mt-1 text-sm text-white/55">Search by name or booking ID.</p>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, PHC-… or booking ID"
              className="mt-4 w-full rounded-2xl border border-white/15 bg-forest-950 px-4 py-3 text-white outline-none ring-forest-400 placeholder:text-white/35 focus:ring-2"
            />
            <ul className="mt-3 divide-y divide-white/8">
              {visibleHits.map((hit) => (
                <li key={hit.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{hit.name}</p>
                    <p className="text-xs text-white/50">
                      {hit.reference} · ID {hit.id} · {hit.distance} · {hit.people}{" "}
                      {hit.people === 1 ? "spot" : "spots"}
                      {hit.checkedInAt ? " · already in" : ""}
                      {hit.status === "cancelled" ? " · cancelled" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || hit.status === "cancelled"}
                    onClick={() => handleCode(String(hit.id))}
                    className="shrink-0 rounded-full bg-forest-500 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-40"
                  >
                    {hit.checkedInAt ? "View" : "Check in"}
                  </button>
                </li>
              ))}
            </ul>
            {searching ? (
              <p className="mt-3 text-sm text-white/45">Searching…</p>
            ) : query.trim().length >= 2 && visibleHits.length === 0 ? (
              <p className="mt-3 text-sm text-white/45">No matching bookings for this hike.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultCard({ result, onNext }: { result: CheckInView; onNext: () => void }) {
  const tone =
    result.ok
      ? "border-forest-400/40 bg-forest-500/20"
      : result.reason === "already_checked_in"
        ? "border-ember/40 bg-ember/15"
        : "border-ember/50 bg-ember/20";

  const heading = result.ok
    ? "Checked in"
    : result.reason === "wrong_event"
      ? "Invalid for this event"
      : result.reason === "already_checked_in"
        ? "Already checked in"
        : result.reason === "cancelled"
          ? "Booking cancelled"
          : "Not checked in";

  return (
    <div className={cn("rounded-3xl border p-6", tone)}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{heading}</p>
      <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
        {result.name ?? "Unknown ticket"}
      </h3>
      <p className="mt-3 text-base font-semibold text-white/90">{result.message}</p>
      {result.reference ? (
        <dl className="mt-5 space-y-1 text-sm text-white/75">
          <div className="flex justify-between gap-4">
            <dt>Reference</dt>
            <dd className="font-semibold text-white">{result.reference}</dd>
          </div>
          {result.distance ? (
            <div className="flex justify-between gap-4">
              <dt>Trail</dt>
              <dd className="font-semibold text-white">{result.distance}</dd>
            </div>
          ) : null}
          {result.people ? (
            <div className="flex justify-between gap-4">
              <dt>People</dt>
              <dd className="font-semibold text-white">{result.people}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {result.paymentWarning ? (
        <p className="mt-4 rounded-2xl bg-black/20 px-3 py-2 text-sm font-semibold text-ember">
          {result.paymentWarning}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        className="mt-6 w-full rounded-full bg-white px-5 py-3 font-display font-bold tracking-tight text-forest-950"
      >
        Scan next person
      </button>
    </div>
  );
}

function QrCamera({
  paused,
  onCode,
  onError,
}: {
  paused: boolean;
  onCode: (code: string) => void;
  onError: (message: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastCode = useRef("");
  const pausedRef = useRef(paused);
  const onCodeRef = useRef(onCode);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    pausedRef.current = paused;
    onCodeRef.current = onCode;
    onErrorRef.current = onError;
  }, [paused, onCode, onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stream: MediaStream | undefined;
    let frame = 0;
    let alive = true;
    const detector: Detector | null =
      typeof window !== "undefined" && "BarcodeDetector" in window
        ? new (window as unknown as { BarcodeDetector: new (options: { formats: string[] }) => Detector }).BarcodeDetector({
            formats: ["qr_code"],
          })
        : null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!alive || !video) return;
        video.srcObject = stream;
        await video.play();
        onErrorRef.current(null);
        tick();
      } catch {
        onErrorRef.current("Camera access was blocked.");
      }
    }

    async function tick() {
      if (!alive) return;
      frame = requestAnimationFrame(tick);
      if (pausedRef.current || !video || video.readyState < 2) return;

      let value = "";
      try {
        if (detector) {
          const codes = await detector.detect(video);
          value = codes[0]?.rawValue ?? "";
        } else {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const width = video.videoWidth;
          const height = video.videoHeight;
          if (!width || !height) return;
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) return;
          context.drawImage(video, 0, 0);
          const image = context.getImageData(0, 0, width, height);
          value = jsQR(image.data, width, height)?.data ?? "";
        }
      } catch {
        return;
      }

      if (value && value !== lastCode.current) {
        lastCode.current = value;
        onCodeRef.current(value);
      }
    }

    start();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!paused) lastCode.current = "";
  }, [paused]);

  return (
    <div className="relative mt-4 overflow-hidden rounded-3xl bg-black">
      <video ref={videoRef} className="aspect-4/5 w-full object-cover sm:aspect-video" playsInline muted />
      <div className="pointer-events-none absolute inset-0 border-[12px] border-white/10">
        <div className="absolute inset-10 rounded-3xl border-2 border-white/70" />
      </div>
      {paused ? (
        <div className="absolute inset-0 grid place-items-center bg-forest-950/70 text-sm font-semibold text-white">
          Scanner paused
        </div>
      ) : null}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
