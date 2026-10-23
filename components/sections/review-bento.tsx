
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight, Star } from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

// Edit these to match your site
const READ_HREF = "/reviews";
const WRITE_HREF = "/reviews"; // change if you have a dedicated write-a-review page
const IMAGES = [
  { src: "/r1.jpeg", alt: "Customer review screenshot 1" },
  { src: "/r2.jpeg", alt: "Customer review screenshot 2" },
];

export function ReviewsBento() {
  // Reveal once, when the block scrolls into view
  const ref = useRef<HTMLElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = `transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
    show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
  }`;
  const delay = (ms: number) => ({ transitionDelay: show ? `${ms}ms` : "0ms" });

  return (
    <section ref={ref} className="w-full sm:px-8">
      <div
        className={`${display.className} group relative rounded-[1.75rem] bg-neutral-950 p-6 text-white ring-1 ring-white/10 sm:p-10`}
      >
        {/* Stars + headline */}
        <div className={reveal} style={delay(0)}>
          <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-5 text-white"
                fill="currentColor"
                aria-hidden="true"
              />
            ))}
          </div>

          <h2 className="mt-4 text-balance text-[3.25rem] font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl">
            Happy customers.
          </h2>

          <p className="mt-4 text-lg font-medium text-white/60">
            Real reviews from real people.
          </p>
        </div>

        {/* Review images */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          {IMAGES.map((img, i) => (
            <div
              key={img.src}
              className={`${reveal} ${i === 1 ? "mt-6" : ""}`}
              style={delay(160 + i * 120)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover object-top grayscale contrast-110 transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 45vw, 300px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className={`mt-8 ${reveal}`} style={delay(400)}>
          {/* Stretched link: the whole card opens the reviews page */}
          <Link
            href={READ_HREF}
            className="flex h-16 items-center justify-between rounded-full bg-white pl-7 pr-2 text-neutral-950 transition-colors duration-300 after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-white sm:h-[4.5rem]"
          >
            <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Read reviews
            </span>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white sm:h-14 sm:w-14"
            >
              <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </Link>

          {/* Sits above the stretched link */}
          <Link
            href={WRITE_HREF}
            className="relative z-10 mt-5 block w-fit text-base font-semibold underline decoration-white/50 decoration-1 underline-offset-[6px] transition-colors hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Write a review
          </Link>
        </div>
      </div>
    </section>
  );
}
