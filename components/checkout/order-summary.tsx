import { Truck, Flame, SprayCan } from "lucide-react";
import Link from "next/link";
import { formatDeliveryDate } from "@/lib/checkout-utils";
import {
  BASE_PRICE,
  COD_CHARGE,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
  type PairCount,
} from "@/lib/checkout-constants";

const row = "flex justify-between text-sm font-medium";
const muted = "text-neutral-500";

export function OrderSummary({
  pairCount = 2,
  basePrice = BASE_PRICE,
  pair1Extra,
  pair2Extra,
  pair3Extra = 0,
  offerShipping = 0,
  freeSocksOffer,
  shoeCleanerAddon,
  addShoeCleaner,
  shippingMethod,
  activeDeliveryEnd,
  totalAmount,
}: {
  pairCount?: PairCount;
  basePrice?: number;
  pair1Extra: number;
  pair2Extra: number;
  pair3Extra?: number;
  offerShipping?: number;
  freeSocksOffer: boolean;
  shoeCleanerAddon: boolean;
  addShoeCleaner: boolean;
  shippingMethod: "online" | "cod";
  activeDeliveryEnd: Date;
  totalAmount: number;
}) {
  return (
    <div className="mt-8 rounded-[1.75rem] bg-neutral-100 p-5">
      <div className="space-y-3">
        <div className={row}>
          <span className={muted}>Base price ({pairCount} pairs)</span>
          <span>₹{basePrice}</span>
        </div>
        {pair1Extra > 0 && (
          <div className={`${row} pl-3 text-xs ${muted}`}>
            <span>Extra — Pair 1</span>
            <span>+₹{pair1Extra}</span>
          </div>
        )}
        {pair2Extra > 0 && (
          <div className={`${row} pl-3 text-xs ${muted}`}>
            <span>Extra — Pair 2</span>
            <span>+₹{pair2Extra}</span>
          </div>
        )}
        {pairCount === 3 && pair3Extra > 0 && (
          <div className={`${row} pl-3 text-xs ${muted}`}>
            <span>Extra — Pair 3</span>
            <span>+₹{pair3Extra}</span>
          </div>
        )}
        {freeSocksOffer && (
          <div className={row}>
            <span className={`flex items-center gap-1.5 ${muted}`}>
              <Flame className="h-3.5 w-3.5" /> Flame socks
            </span>
            <span className="font-semibold text-blue-700">Free</span>
          </div>
        )}
        {shoeCleanerAddon && addShoeCleaner && (
          <div className={row}>
            <span className={`flex items-center gap-1.5 ${muted}`}>
              <SprayCan className="h-3.5 w-3.5" /> Shoe cleaner
            </span>
            <span>+₹{SHOE_CLEANER_PRICE}</span>
          </div>
        )}

        {offerShipping > 0 && (
          <div className={row}>
            <span className={muted}>Shipping ({pairCount} pairs)</span>
            <span>₹{offerShipping}</span>
          </div>
        )}

        <div className={row}>
          <span className={muted}>
            {offerShipping > 0 ? "Payment handling" : "Shipping"}
          </span>
          {shippingMethod === "online" ? (
            <span className="font-semibold text-blue-700">Free</span>
          ) : (
            <span>₹{COD_CHARGE}</span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 rounded-2xl bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
            <Truck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight">
              Arrives by {formatDeliveryDate(activeDeliveryEnd)}
            </p>
            <p className="text-xs font-medium text-neutral-500">
              {shippingMethod === "online"
                ? `${ONLINE_DELIVERY_MIN_DAYS}–${ONLINE_DELIVERY_MAX_DAYS}`
                : `${COD_DELIVERY_MIN_DAYS}–${COD_DELIVERY_MAX_DAYS}`}{" "}
              working days
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-neutral-300/70 pt-4">
          <span className="text-sm font-semibold text-neutral-500">Total</span>
          <span
            key={totalAmount}
            className="text-4xl font-extrabold leading-none tracking-[-0.045em] duration-300 animate-in fade-in slide-in-from-bottom-1"
          >
            ₹{totalAmount}
          </span>
        </div>

        {shippingMethod === "cod" && (
          <p className="text-center text-xs font-semibold text-blue-700">
            Switch to prepaid to save ₹{COD_CHARGE}
          </p>
        )}

        <p className="border-t border-neutral-300/70 pt-3 text-xs font-medium text-neutral-500">
          By placing this order, you agree to the{" "}
          <Link
            href="/T&C"
            className="font-semibold text-neutral-950 underline underline-offset-4"
          >
            Terms and Conditions
          </Link>
        </p>
      </div>
    </div>
  );
}