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
const LAT = 10.759707;
const LNG = 76.737694;
const STORE_NAME = "Visit our store.";
const ADDRESS = "WHITEWALK, KUNNACHI EALAPULLY PARA, PALAKKAD, 678622, Kerala, India";
const HOURS = "Open daily, 10 am to 8 pm";

const EMBED_SRC = `https://www.google.com/maps?q=${LAT},${LNG}&z=16&output=embed`;
const OPEN_HREF = `https://www.google.com/maps?q=${LAT},${LNG}`;

export function StoreLocation() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section
      className={`${display.className} w-full px-5 py-10 text-neutral-950 sm:px-8`}
    >
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
          referrerPolicy="no-referrer-when-downgrade"
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

      {/* CTA */}
      <a
        href={OPEN_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 flex h-16 items-center justify-between rounded-full bg-neutral-950 pl-7 pr-2 text-white transition-colors duration-300 hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-950 sm:h-[4.5rem]"
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
    </section>
  );
}