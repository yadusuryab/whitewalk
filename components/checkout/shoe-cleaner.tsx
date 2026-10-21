import { SprayCan, Check, Sparkles } from "lucide-react";
import { SHOE_CLEANER_PRICE } from "@/lib/checkout-constants";

export function ShoeCleanerAddon({
  addShoeCleaner,
  setAddShoeCleaner,
}: {
  addShoeCleaner: boolean;
  setAddShoeCleaner: (v: boolean) => void;
}) {
  const discount = Math.round(((199 - SHOE_CLEANER_PRICE) / 199) * 100);

  return (
    <label
      onClick={() => setAddShoeCleaner(!addShoeCleaner)}
      className={`relative flex items-center gap-3 rounded-2xl border p-4 pt-5 cursor-pointer transition-all ${
        addShoeCleaner
          ? "border-transparent bg-gradient-to-br from-blue-500 via-blue-500 to-cyan-400 shadow-md shadow-blue-200"
          : "border-border bg-gradient-to-br from-blue-50 to-cyan-50/60 hover:border-blue-300"
      }`}
    >
      <span className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 shadow-sm">
        <Sparkles className="h-2.5 w-2.5 text-white" />
        <span className="text-[10px] font-semibold text-white tracking-wide">
          Popular Add-on
        </span>
      </span>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
          addShoeCleaner ? "bg-white/20 backdrop-blur" : "bg-white"
        }`}
      >
        <SprayCan
          className={`h-4.5 w-4.5 ${addShoeCleaner ? "text-white" : "text-blue-600"}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-semibold ${addShoeCleaner ? "text-white" : "text-foreground"}`}
          >
            Premium Shoe Cleaner
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs line-through ${addShoeCleaner ? "text-white/60" : "text-muted-foreground"}`}
            >
              ₹199
            </span>
            <span
              className={`text-sm font-bold ${addShoeCleaner ? "text-white" : "text-blue-600"}`}
            >
              ₹{SHOE_CLEANER_PRICE}
            </span>
          </div>
        </div>
        <p
          className={`text-xs mt-0.5 ${addShoeCleaner ? "text-white/80" : "text-muted-foreground"}`}
        >
          86% of customers add this to their order
        </p>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          addShoeCleaner
            ? "border-white bg-white"
            : "border-blue-300 bg-white"
        }`}
      >
        {addShoeCleaner && (
          <Check className="h-3 w-3 text-blue-600" strokeWidth={3} />
        )}
      </div>
    </label>
  );
}