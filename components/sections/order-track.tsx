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

export function OrderTrackCTA() {
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
      { threshold: 0.3 },
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
      <Link
        href="/order/track"
        className={`${display.className} group block rounded-[1.75rem] bg-neutral-100 p-6 text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-950 sm:p-10`}
      >
        {/* Headline */}
        <h2
          className={`text-balance text-[3.25rem] font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl ${reveal}`}
          style={delay(0)}
        >
          Where&apos;s my order?
        </h2>

        <p
          className={`mt-4 max-w-[32ch] text-lg font-medium leading-snug text-neutral-500 ${reveal}`}
          style={delay(120)}
        >
          Live status, carrier updates and your delivery estimate.
        </p>

        {/* Route line: draws from left to right, like a package in transit */}
        <div className="mt-8 flex items-center" aria-hidden="true">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-950" />
          <span
            className={`h-px flex-1 origin-left bg-neutral-950 transition-transform duration-1000 ease-out motion-reduce:scale-x-100 motion-reduce:transition-none ${
              show ? "scale-x-100" : "scale-x-0"
            }`}
            style={delay(240)}
          />
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 transition-opacity duration-500 motion-reduce:opacity-100 motion-reduce:transition-none ${
              show ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: show ? "1100ms" : "0ms" }}
          />
        </div>

        {/* CTA */}
        <div
          className={`mt-6 flex items-center justify-between ${reveal}`}
          style={delay(360)}
        >
          <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
            Track order
          </span>
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 text-white transition-colors duration-300 group-hover:bg-blue-600 sm:h-16 sm:w-16"
          >
            <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45 sm:h-7 sm:w-7" />
          </span>
        </div>
      </Link>
    </section>
  );
}