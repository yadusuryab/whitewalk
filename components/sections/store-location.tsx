"use client";

import { useState } from "react";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

// Edit these to match your store
const STORE_NAME = "Visit our store.";
const ADDRESS = "Seethukickz, Para, Elappully, 678622, Keralam, India";
const HOURS = "Open daily, 10 am to 8 pm";
const INSTAGRAM_HANDLE = "whitewalk.in";

const EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6968823389184!2d76.75137579999999!3d10.757828099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba86b002dd6fa9d%3A0xd5417945847cd5c4!2sSEETHUKICKZ!5e0!3m2!1sen!2sin!4v1793164928067!5m2!1sen!2sin";
const OPEN_HREF = "https://www.google.com/maps?q=10.7578281,76.7513758";
const INSTAGRAM_HREF = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

/* ---------- Page section ---------- */

export function StoreLocation() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section
      className={`${display.className} w-full px-5 py-10 text-neutral-950 sm:px-8`}
    >
      {/* Powered by */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
        </span>
        Whitewalk powered by <span className="font-extrabold">SEETHUKICKZ</span>
      </div>

      {/* Headline */}
      <h2 className="text-balance text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-6xl md:text-7xl">
        {STORE_NAME}
      </h2>

      {/* Address + hours */}
      <div className="mt-4 space-y-1 text-base font-medium text-neutral-600 sm:text-lg">
        <p>{ADDRESS}</p>
        <p>{HOURS}</p>
      </div>

      {/* Map */}
      <div className="relative mt-7 aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-neutral-100 sm:aspect-[2/1]">
        <iframe
          title="Store location on Google Maps"
          src={EMBED_SRC}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          onLoad={() => setMapLoaded(true)}
          className={`absolute inset-0 h-full w-full border-0 grayscale transition-all duration-700 hover:grayscale-0 ${
            mapLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!mapLoaded && (
          <div className="absolute inset-0 animate-pulse bg-neutral-200" />
        )}
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3">
        <a
          href={OPEN_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-16 items-center justify-between rounded-full bg-neutral-950 pl-7 pr-2 text-white transition-colors duration-300 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-950 sm:h-[4.5rem]"
        >
          <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
            Get directions
          </span>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45 sm:h-14 sm:w-14"
          >
            <ArrowUpRight className="h-6 w-6" />
          </span>
        </a>

        <a
          href={INSTAGRAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-16 items-center justify-between rounded-full border-2 border-neutral-950 pl-7 pr-2 text-neutral-950 transition-colors duration-300 hover:border-blue-600 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-950 sm:h-[4.5rem]"
        >
          <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
            @{INSTAGRAM_HANDLE}
          </span>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:rotate-45 sm:h-14 sm:w-14"
          >
            <ArrowUpRight className="h-6 w-6" />
          </span>
        </a>
      </div>
    </section>
  );
}