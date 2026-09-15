"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveEvent, type EventFormState } from "@/app/actions/admin";
import { cn } from "@/lib/cn";
import { DEFAULT_SCHEDULE } from "@/lib/seed-data";
import type { EventWithAvailability, ScheduleItem } from "@/lib/types";

const initialState: EventFormState = { status: "idle" };

const input =
  "w-full rounded-2xl border border-white/15 bg-forest-950/60 px-4 py-3 text-white outline-none transition-all placeholder:text-white/25 focus:border-forest-400 focus:ring-4 focus:ring-forest-400/15";

function Label({
  title,
  hint,
  error,
  children,
}: {
  title: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-display text-sm font-bold tracking-tight text-white">
          {title}
        </span>
        {hint && <span className="text-xs text-white/40">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-xs font-semibold text-ember">{error}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-7">
      <h2 className="font-display text-lg font-bold tracking-tight text-white">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function SaveButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-forest-500 px-7 py-3.5 font-display font-bold tracking-tight text-white transition-colors hover:bg-forest-400 disabled:opacity-60"
    >
      {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
    </button>
  );
}

export function EventForm({
  event,
  library,
}: {
  event?: EventWithAvailability;
  library: string[];
}) {
  const [state, formAction] = useActionState(saveEvent, initialState);
  const errors = state.fieldErrors ?? {};

  const [image, setImage] = useState(event?.image ?? library[0] ?? "/images/event-magaliesberg.jpg");
  const [gallery, setGallery] = useState<string[]>(event?.gallery ?? []);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    event?.schedule?.length ? event.schedule : DEFAULT_SCHEDULE,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [libraryImages, setLibraryImages] = useState<string[]>(library);

  async function upload(file: File, target: "cover" | "gallery") {
    setUploading(true);
    setUploadError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }

      setLibraryImages((current) => [data.url!, ...current.filter((item) => item !== data.url)]);
      if (target === "cover") {
        setImage(data.url);
      } else {
        setGallery((current) => [...current, data.url!]);
      }
    } catch {
      setUploadError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function updateScheduleItem(index: number, patch: Partial<ScheduleItem>) {
    setSchedule((current) =>
      current.map((item, position) => (position === index ? { ...item, ...patch } : item)),
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="gallery" value={gallery.join("\n")} />
      <input type="hidden" name="schedule" value={JSON.stringify(schedule)} />

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-2xl border border-ember/40 bg-ember/10 px-5 py-3.5 text-sm font-semibold text-ember">
          {state.message}
        </p>
      )}

      <Section title="The basics">
        <Label title="Event title" error={errors.title}>
          <input name="title" defaultValue={event?.title} className={input} placeholder="Magaliesberg Sunrise Hike" />
        </Label>

        <div className="grid gap-5 sm:grid-cols-2">
          <Label title="Category" error={errors.category}>
            <select name="category" defaultValue={event?.category ?? "hike"} className={input}>
              <option value="hike">Hike</option>
              <option value="camping">Camping</option>
              <option value="getaway">Getaway</option>
              <option value="social">Social</option>
            </select>
          </Label>
          <Label title="Difficulty" error={errors.difficulty}>
            <select name="difficulty" defaultValue={event?.difficulty ?? "Moderate"} className={input}>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </Label>
        </div>

        <Label title="Card summary" hint="One or two sentences" error={errors.summary}>
          <textarea name="summary" rows={2} defaultValue={event?.summary} className={input} />
        </Label>

        <Label
          title="Full description"
          hint="Blank line between paragraphs"
          error={errors.description}
        >
          <textarea name="description" rows={7} defaultValue={event?.description} className={input} />
        </Label>

        <Label title="URL slug" hint="Leave blank to generate from the title" error={errors.slug}>
          <input name="slug" defaultValue={event?.slug} className={input} placeholder="magaliesberg-sunrise-hike" />
        </Label>
      </Section>

      <Section title="When and where">
        <div className="grid gap-5 sm:grid-cols-2">
          <Label title="Date" error={errors.date}>
            <input type="date" name="date" defaultValue={event?.date} className={input} />
          </Label>
          <Label title="Location" error={errors.location}>
            <input name="location" defaultValue={event?.location} className={input} placeholder="Magaliesberg, North West" />
          </Label>
        </div>

        <Label title="Meeting point" error={errors.meetingPoint}>
          <input
            name="meetingPoint"
            defaultValue={event?.meetingPoint}
            className={input}
            placeholder="Mountain Sanctuary Park gate"
          />
        </Label>

        <Label title="Map link" hint="Optional" error={errors.mapUrl}>
          <input name="mapUrl" defaultValue={event?.mapUrl ?? ""} className={input} placeholder="https://maps.google.com/?q=..." />
        </Label>

        <div className="grid gap-5 sm:grid-cols-3">
          <Label title="Arrival time" error={errors.arrivalTime}>
            <input name="arrivalTime" defaultValue={event?.arrivalTime ?? "07:00"} className={input} />
          </Label>
          <Label title="Start time" error={errors.startTime}>
            <input name="startTime" defaultValue={event?.startTime ?? "08:30"} className={input} />
          </Label>
          <Label title="End time" hint="Optional">
            <input name="endTime" defaultValue={event?.endTime ?? ""} className={input} placeholder="15:00" />
          </Label>
        </div>
      </Section>

      <Section title="Trails, price and capacity">
        <div className="flex flex-wrap gap-3">
          {[
            { name: "distance5km", label: "5KM route", checked: event?.distance5km ?? true },
            { name: "distance10km", label: "10KM route", checked: event?.distance10km ?? true },
          ].map((option) => (
            <label
              key={option.name}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-forest-950/60 px-5 py-3 text-white"
            >
              <input
                type="checkbox"
                name={option.name}
                defaultChecked={option.checked}
                className="h-4 w-4 accent-forest-400"
              />
              <span className="font-semibold">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.distance5km && (
          <p className="text-xs font-semibold text-ember">{errors.distance5km}</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Label title="Price per person (R)" hint="0 for a free event" error={errors.priceRands}>
            <input
              type="number"
              name="priceRands"
              min={0}
              step="1"
              defaultValue={event ? event.priceCents / 100 : 0}
              className={input}
            />
          </Label>
          <Label
            title="Capacity"
            hint={event ? `${event.spotsBooked} already booked` : undefined}
            error={errors.capacity}
          >
            <input
              type="number"
              name="capacity"
              min={1}
              defaultValue={event?.capacity ?? 60}
              className={input}
            />
          </Label>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-forest-950/60 px-5 py-3 text-white">
            <input
              type="checkbox"
              name="published"
              defaultChecked={event?.published ?? true}
              className="h-4 w-4 accent-forest-400"
            />
            <span className="font-semibold">Published on the website</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/15 bg-forest-950/60 px-5 py-3 text-white">
            <input
              type="checkbox"
              name="bookingsClosed"
              defaultChecked={event?.bookingsClosed ?? false}
              className="h-4 w-4 accent-forest-400"
            />
            <span className="font-semibold">Bookings closed</span>
          </label>
        </div>
      </Section>

      <Section title="Photos">
        <div>
          <p className="font-display text-sm font-bold tracking-tight text-white">Cover photo</p>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <div className="relative h-28 w-44 overflow-hidden rounded-2xl border border-white/15">
              <Image src={image} alt="Selected cover" fill sizes="11rem" className="object-cover" />
            </div>
            <label className="cursor-pointer rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950">
              {uploading ? "Uploading…" : "Upload new photo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(changeEvent) => {
                  const file = changeEvent.target.files?.[0];
                  if (file) void upload(file, "cover");
                  changeEvent.target.value = "";
                }}
              />
            </label>
          </div>
          {uploadError && <p className="mt-2 text-xs font-semibold text-ember">{uploadError}</p>}
          {errors.image && <p className="mt-2 text-xs font-semibold text-ember">{errors.image}</p>}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {libraryImages.slice(0, 18).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setImage(option)}
                className={cn(
                  "relative aspect-4/3 overflow-hidden rounded-xl border-2 transition-all",
                  image === option ? "border-forest-400" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={option} alt="" fill sizes="8rem" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-bold tracking-tight text-white">
            Gallery photos
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {gallery.map((item) => (
              <span key={item} className="relative h-20 w-28 overflow-hidden rounded-xl">
                <Image src={item} alt="" fill sizes="7rem" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setGallery((current) => current.filter((value) => value !== item))}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-forest-950/80 text-xs text-white"
                >
                  ✕
                </button>
              </span>
            ))}
            <label className="cursor-pointer rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950">
              + Add photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(changeEvent) => {
                  const file = changeEvent.target.files?.[0];
                  if (file) void upload(file, "gallery");
                  changeEvent.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {libraryImages.slice(0, 12).map((option) => (
              <button
                key={`gallery-${option}`}
                type="button"
                onClick={() =>
                  setGallery((current) =>
                    current.includes(option) ? current : [...current, option],
                  )
                }
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 transition-colors hover:border-forest-400 hover:text-white"
              >
                + {option.split("/").pop()}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Programme for the day">
        <p className="-mt-2 text-sm text-white/50">
          Each event has its own schedule. Edit the times below or remove the
          steps you do not need.
        </p>

        <div className="space-y-3">
          {schedule.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-2xl border border-white/10 bg-forest-950/40 p-4 sm:grid-cols-[9rem_1fr_auto]"
            >
              <input
                value={item.time}
                onChange={(changeEvent) => updateScheduleItem(index, { time: changeEvent.target.value })}
                placeholder="07:00 – 07:30"
                className={input}
              />
              <div className="space-y-2">
                <input
                  value={item.title}
                  onChange={(changeEvent) => updateScheduleItem(index, { title: changeEvent.target.value })}
                  placeholder="Arrival"
                  className={input}
                />
                <input
                  value={item.description ?? ""}
                  onChange={(changeEvent) =>
                    updateScheduleItem(index, { description: changeEvent.target.value })
                  }
                  placeholder="Optional detail"
                  className={input}
                />
              </div>
              <button
                type="button"
                onClick={() => setSchedule((current) => current.filter((_, position) => position !== index))}
                className="self-start rounded-full border border-white/20 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-ember hover:text-ink"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSchedule((current) => [...current, { time: "", title: "", description: "" }])}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
          >
            + Add step
          </button>
          <button
            type="button"
            onClick={() => setSchedule(DEFAULT_SCHEDULE)}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white hover:text-forest-950"
          >
            Reset to standard schedule
          </button>
        </div>
      </Section>

      <Section title="Details for hikers">
        <Label title="What's included" hint="One per line">
          <textarea
            name="includes"
            rows={5}
            defaultValue={event?.includes.join("\n")}
            className={input}
            placeholder={"Trail leaders on both routes\nReserve entry fees"}
          />
        </Label>
        <Label title="What to bring" hint="One per line">
          <textarea
            name="bring"
            rows={5}
            defaultValue={event?.bring.join("\n")}
            className={input}
            placeholder={"2 litres of water\nSunscreen and a hat"}
          />
        </Label>
      </Section>

      <div className="flex flex-wrap items-center gap-4">
        <SaveButton isEdit={Boolean(event)} />
        <Link
          href="/admin/events"
          className="rounded-full border border-white/20 px-6 py-3.5 font-display font-bold tracking-tight text-white/80 transition-colors hover:bg-white hover:text-forest-950"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
