import React from "react";
import { Check } from "lucide-react";
import { Inter_Tight } from "next/font/google";
import { CheckoutStep } from "@/lib/types/checkout";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

const STEPS: { key: CheckoutStep; label: string }[] = [
  { key: "payment", label: "Order summary" },
  { key: "details", label: "Delivery details" },
];

export function StepProgress({ currentStep }: { currentStep: CheckoutStep }) {
  const activeIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav
      aria-label="Checkout progress"
      className={`${display.className} mx-auto mb-8 w-full max-w-md px-5 sm:px-0`}
    >
      <ol className="grid grid-cols-2 gap-3">
        {STEPS.map((step, i) => {
          const isDone = activeIdx > i;
          const isActive = activeIdx === i;

          return (
            <li
              key={step.key}
              aria-current={isActive ? "step" : undefined}
              className="flex flex-col"
            >
              {/* Segment bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isDone
                      ? "w-full bg-neutral-950"
                      : isActive
                      ? "w-full bg-blue-600"
                      : "w-0"
                  }`}
                />
              </div>

              {/* Eyebrow */}
              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                  </span>
                )}
                {isDone && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
                <span
                  className={
                    isActive
                      ? "text-blue-700"
                      : isDone
                      ? "text-neutral-950"
                      : "text-neutral-400"
                  }
                >
                  Step 0{i + 1}
                </span>
              </div>

              {/* Label */}
              <span
                className={`mt-1 text-xl font-extrabold leading-none tracking-[-0.04em] transition-colors sm:text-2xl ${
                  isActive || isDone ? "text-neutral-950" : "text-neutral-400"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}