"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight, Check } from "lucide-react";
import { site } from "@/lib/site-config";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

function Content() {
  const sp = useSearchParams();
  const orderId = sp.get("order_id");
  const manual = sp.get("manual") === "1";

  const waText = encodeURIComponent(
    `Hi, I placed an order${orderId ? ` (ref: ${orderId})` : ""}. Please confirm my payment.`,
  );

  return (
    <main
      className={`${display.className} mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-12 text-neutral-950 sm:px-0`}
    >
      {/* Status pill */}
      <div className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
        {manual ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
        ) : (
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
        )}
        {manual ? "Verifying payment" : "Order confirmed"}
      </div>

      {/* Headline */}
      <h1 className="mt-5 text-balance text-6xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl">
        Order received.
      </h1>

      <p className="mt-6 text-base font-medium leading-relaxed text-neutral-600 sm:text-lg">
        {manual
          ? "We are verifying your payment. This usually takes a short while. We will contact you on your phone number once it is confirmed."
          : "Thank you for your order."}
      </p>

      {/* Reference */}
      {orderId && (
        <div className="mt-8 border-t-2 border-neutral-950 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Reference
          </p>
          <p className="mt-1 break-all text-xl font-extrabold tabular-nums tracking-[-0.03em]">
            {orderId}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3">
        <a
          href={`https://wa.me/${site.phone}?text=${waText}`}
          target="_blank"
          rel="noreferrer"
          className="group flex h-16 items-center justify-between rounded-full bg-neutral-950 pl-7 pr-2 text-white transition-colors duration-300 hover:bg-blue-600"
        >
          <span className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
            Message us on WhatsApp
          </span>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45"
          >
            <ArrowUpRight className="h-6 w-6" />
          </span>
        </a>

        <Link
          href="/"
          className="group flex h-16 items-center justify-between rounded-full border-2 border-neutral-950 pl-7 pr-1.5 transition-colors duration-300 hover:border-blue-600 hover:text-blue-600"
        >
          <span className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">
            Continue shopping
          </span>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:rotate-45"
          >
            <ArrowUpRight className="h-6 w-6" />
          </span>
        </Link>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-[70vh] w-full max-w-md px-5 py-12">
          <div className="h-8 w-40 animate-pulse rounded-md bg-neutral-200" />
          <div className="mt-5 h-28 w-4/5 animate-pulse rounded-xl bg-neutral-200" />
          <div className="mt-6 h-5 w-72 max-w-full animate-pulse rounded bg-neutral-200" />
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}