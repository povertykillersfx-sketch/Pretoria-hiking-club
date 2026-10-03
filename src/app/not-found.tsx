import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-forest-950 px-5 text-center">
      <Image
        src="/images/gallery-forest-road.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="-z-10 object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-forest-950/80 via-forest-950/70 to-forest-950" />

      <p className="eyebrow text-forest-300">Off the trail</p>
      <h1 className="display mt-5 text-[clamp(3rem,12vw,7rem)] text-white">404</h1>
      <p className="mt-4 max-w-md text-lg text-white/70">
        This path does not go anywhere. Let&apos;s get you back to the group.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses("light", "lg")}>
          Back home
        </Link>
        <Link href="/events" className={buttonClasses("outline", "lg")}>
          See upcoming hikes
        </Link>
      </div>
    </div>
  );
}
