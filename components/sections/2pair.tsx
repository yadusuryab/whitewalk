"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

// Edit these to match your live offer
const HREF = "/offer?pairs=2";
const PRICE = 1499;
const MRP = 1998; // set to 0 to hide the strike-through and savings
const NOTE = "Mix any two styles. Pay once, at checkout.";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function TwoPairsOffer() {
  const savings = MRP > PRICE ? MRP - PRICE : 0;

  // Fade in once, when the block scrolls into view
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

  // Each part fades up a little after the previous one
  const reveal = `transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
    show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
  }`;
  const delay = (ms: number) => ({ transitionDelay: show ? `${ms}ms` : "0ms" });

  return (
    <section ref={ref} className="w-full sm:px-8">
      <Link
        href={HREF}
        className={`${display.className} group block rounded-[1.75rem] bg-neutral-950 p-6 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 sm:p-10`}
      >
        {/* Big type */}
        <h2
          className={`text-[4.5rem] font-extrabold leading-[0.85] tracking-[-0.055em] sm:text-9xl ${reveal}`}
          style={delay(0)}
        >
          2 pairs.
        </h2>

        {/* Price, savings, note */}
        <div className={reveal} style={delay(120)}>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-5xl font-extrabold leading-none tracking-[-0.04em] text-white sm:text-7xl">
              {inr(PRICE)}
            </span>
            {savings > 0 && (
              <span className="text-xl font-medium text-neutral-500 line-through decoration-2 sm:text-2xl">
                {inr(MRP)}
              </span>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-4 inline-block rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black">
              You save {inr(savings)}
            </p>
          )}

          <p className="mt-4 max-w-[30ch] text-lg font-medium leading-snug text-neutral-400">
            {NOTE}
          </p>
        </div>

        {/* CTA */}
        <div className={reveal} style={delay(240)}>
          <div className="mt-8 flex h-16 items-center justify-between rounded-full bg-white pl-7 pr-2 text-neutral-950 transition-colors duration-300 group-hover:bg-blue-500 group-hover:text-white sm:h-[4.5rem]">
            <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Shop 2 pairs
            </span>
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:rotate-45 sm:h-14 sm:w-14"
            >
              <ArrowUpRight className="h-6 w-6" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}