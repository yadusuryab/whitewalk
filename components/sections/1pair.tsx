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
const HREF = "/offer?pairs=1";
const PRICE = 999;
const NOTE = "One pair, any style. Pay once, at checkout.";

const inr = (n: number) => n.toLocaleString("en-IN");

export function OnePairOffer() {
  const ref = useRef<HTMLElement>(null);
  const [show, setShow] = useState(false);

  // Play once, when the block scrolls into view
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
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

  const fade = `transition-all duration-700 ${ease} motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
    show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
  }`;
  const delay = (ms: number) => ({ transitionDelay: show ? `${ms}ms` : "0ms" });

  // Price: an outline sits underneath, and a solid copy is wiped in over it
  const priceBase =
    "col-start-1 row-start-1 flex items-start text-[8.5rem] font-extrabold leading-[0.85] tracking-[-0.035em] tabular-nums sm:text-[15rem]";
  const symbol =
    "mr-1 mt-2 text-4xl font-semibold tracking-normal sm:mt-5 sm:text-7xl";

  return (
    <section ref={ref} className="w-full sm:px-8">
      <Link
        href={HREF}
        className={`${display.className} group block rounded-[1.75rem] border-2 border-black bg-white p-6 text-black transition-colors duration-500 hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:p-10`}
      >
        {/* Label */}
        <p
          className={`inline-flex items-center rounded-full border-2 border-current px-4 py-1 text-base font-extrabold tracking-tight sm:text-lg ${fade}`}
          style={delay(0)}
        >
          1 pair
        </p>

        {/* Price */}
        <div
          className="mt-6 grid overflow-hidden pb-3 sm:mt-8"
          role="img"
          aria-label={`₹${inr(PRICE)}`}
        >
          {/* Outline layer, always visible */}
          <span
            aria-hidden="true"
            className={`${priceBase} text-transparent`}
            style={{ WebkitTextStroke: "2px currentColor" }}
          >
            <span className={`${symbol}`}>₹</span>
            <span>{inr(PRICE)}</span>
          </span>

          {/* Solid layer, wiped in from the left */}
          <span
            aria-hidden="true"
            className={`${priceBase} transition-[clip-path] duration-[1600ms] ${ease} motion-reduce:transition-none motion-reduce:[clip-path:inset(0_0_0_0)] ${
              show ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_100%_0_0)]"
            }`}
            style={{ transitionDelay: show ? "200ms" : "0ms" }}
          >
            <span className={symbol}>₹</span>
            <span>{inr(PRICE)}</span>
          </span>
        </div>

        {/* Rule draws in from the left */}
        <div className="mt-6 h-0.5 w-full sm:mt-8" aria-hidden="true">
          <div
            className={`h-full origin-left bg-current transition-transform duration-[1400ms] ${ease} motion-reduce:scale-x-100 motion-reduce:transition-none ${
              show ? "scale-x-100" : "scale-x-0"
            }`}
            style={delay(500)}
          />
        </div>

        {/* Note + CTA */}
        <div
          className={`mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${fade}`}
          style={delay(700)}
        >
          <p className="max-w-[26ch] text-lg font-semibold leading-snug">
            {NOTE}
          </p>

          <span className="flex h-16 items-center justify-between rounded-full bg-black pl-7 pr-2 text-white transition-colors duration-500 group-hover:bg-white group-hover:text-black sm:h-[4.5rem] sm:min-w-[19rem]">
            <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Shop 1 pair
            </span>
            <span
              aria-hidden="true"
              className="ml-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all duration-500 group-hover:rotate-45 group-hover:bg-black group-hover:text-white sm:h-14 sm:w-14"
            >
              <ArrowUpRight className="h-6 w-6" />
            </span>
          </span>
        </div>
      </Link>
    </section>
  );
}