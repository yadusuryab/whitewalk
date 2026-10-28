"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Inter_Tight } from "next/font/google";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Search, Check, ArrowUpRight } from "lucide-react";
import ProductCard2 from "@/components/product/product-image-card";
import Image from "next/image";
import Link from "next/link";
import { isInOffer, type PairCount } from "@/lib/checkout-constants";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

export interface Product {
  _id: string;
  productName: string;
  sizes: (string | number)[];
  disabledSizes?: (string | number)[];
  buyOneGetOne: boolean;
  offer1Pair?: boolean;
  offer2Pair?: boolean;
  offer3Pair?: boolean;
  imageUrl?: string;
  price?: number;
  offerPrice?: number;
  hasVideo?: boolean;
  videoUrl?: string;
}

type PairPick = { product: Product | null; size: string | null };

const emptyPicks = (n: number): PairPick[] =>
  Array.from({ length: n }, () => ({ product: null, size: null }));

// Customer picks only the 2nd pair. For 3 pairs, the 3rd is added by the warehouse.
const userPickSlots = (pairCount: number) => (pairCount > 1 ? 1 : 0);

const ordinal = (n: number) => ["1st", "2nd", "3rd"][n - 1] ?? `${n}th`;

const CHECKOUT_FALLBACK_DELAY_MS = 3000;

const isSizeDisabled = (
  product: Product | null | undefined,
  size: string | number,
) => !!product?.disabledSizes?.some((s) => String(s) === String(size));

/* ---------- UI atoms (Hero language) ---------- */

const LivePill = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
    </span>
    {children}
  </div>
);

const PillCTA = ({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`group flex h-14 items-center justify-between rounded-full bg-neutral-950 pl-6 pr-1.5 text-white transition-all duration-300 hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-neutral-950 ${className}`}
  >
    <span className="text-lg font-extrabold tracking-[-0.03em]">
      {children}
    </span>
    <span
      aria-hidden="true"
      className="ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-enabled:group-hover:rotate-45"
    >
      <ArrowUpRight className="h-5 w-5" />
    </span>
  </button>
);

const Thumbnail = ({
  product,
  alt,
  size = "h-12 w-12",
}: {
  product: Product;
  alt: string;
  size?: string;
}) => (
  <div
    className={`${size} flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100`}
  >
    <Image
      src={product.imageUrl || "/placeholder-image.jpg"}
      alt={alt}
      width={64}
      height={64}
      quality={40}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  </div>
);

/* ---------- Hook ---------- */

export const useAddToCart = (pairCount: PairCount = 2) => {
  const router = useRouter();
  const [isBogoModalOpen, setIsBogoModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extra pairs beyond the first: 0 for 1 pair, 1 for 2 pairs, 2 for 3 pairs
  const [extraPicks, setExtraPicks] = useState<PairPick[]>(() =>
    emptyPicks(userPickSlots(pairCount)),
  );
  const [activeSlot, setActiveSlot] = useState(0);

  const currentPick = extraPicks[activeSlot];
  const selectedFreeProduct = currentPick?.product ?? null;
  const selectedFreeProductSize = currentPick?.size ?? null;
  const allPicked = extraPicks.every((p) => p.product && p.size);

  const updateSlot = useCallback((slot: number, patch: Partial<PairPick>) => {
    setExtraPicks((prev) =>
      prev.map((p, i) => (i === slot ? { ...p, ...patch } : p)),
    );
  }, []);

  const [isNavigatingToCheckout, setIsNavigatingToCheckout] = useState(false);
  const [showCheckoutFallback, setShowCheckoutFallback] = useState(false);
  const checkoutFallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [bogoOffset, setBogoOffset] = useState<number>(0);
  const [bogoHasMore, setBogoHasMore] = useState<boolean>(true);
  const [bogoLoading, setBogoLoading] = useState<boolean>(false);
  const [allBogoProducts, setAllBogoProducts] = useState<Product[]>([]);

  // 3-pair offer: 3rd pair is chosen by the warehouse; customer only gives the size
  const [thirdStep, setThirdStep] = useState<"idle" | "choosing" | "size">(
    "idle",
  );
  const [thirdSize, setThirdSize] = useState<string | null>(null);

  useEffect(() => {
    if (thirdStep !== "choosing") return;
    const t = setTimeout(() => setThirdStep("size"), 2400);
    return () => clearTimeout(t);
  }, [thirdStep]);

  const handleProductClick = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setSelectedSize(null);
      setExtraPicks(emptyPicks(userPickSlots(pairCount)));
      setActiveSlot(0);
      setThirdStep("idle");
      setThirdSize(null);
      setIsSizeModalOpen(true);
    },
    [pairCount],
  );

  const loadMoreBogoProducts = useCallback(async () => {
    if (bogoLoading || !bogoHasMore) return;

    try {
      setBogoLoading(true);
      const { getAllShoes } = await import("@/lib/vehicleQueries");
      const data: any = await getAllShoes(null, 12, bogoOffset, false, pairCount);

      if (data?.length) {
        const newBogoProducts = data.filter((item: Product) =>
          isInOffer(item, pairCount),
        );
        setAllBogoProducts((prev) => [...prev, ...newBogoProducts]);
        setBogoHasMore(data.length === 12);
        setBogoOffset((prev) => prev + data.length);
      } else {
        setBogoHasMore(false);
      }
    } catch (err) {
      console.error("BOGO load error:", err);
      toast.error("Failed to load more products");
    } finally {
      setBogoLoading(false);
    }
  }, [bogoOffset, bogoLoading, bogoHasMore, pairCount]);

  useEffect(() => {
    if (isBogoModalOpen && allBogoProducts.length === 0) {
      const timer = setTimeout(() => {
        loadMoreBogoProducts();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isBogoModalOpen, allBogoProducts.length, loadMoreBogoProducts]);

  const addToCart = useCallback(
    (
      item: Product,
      size: string,
      picks: PairPick[] = [],
      thirdPairSize: string | null = null,
    ) => {
      // Strip video fields so the cart in localStorage stays light
      const slim = (p: Product) => {
        const { videoUrl, hasVideo, ...rest } = p;
        return rest;
      };

      const toLine = (p?: PairPick) =>
        p?.product ? { ...slim(p.product), selectedSize: p.size } : null;

      const cartItem = {
        ...slim(item),
        selectedSize: size,
        pairCount,
        freeProduct: toLine(picks[0]),
        thirdProduct: null,
        thirdPairRandom: pairCount === 3,
        thirdPairSize: pairCount === 3 ? thirdPairSize : null,
      };

      localStorage.setItem("cart", JSON.stringify([cartItem]));
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success(`${item.productName} added to cart!`);
    },
    [pairCount],
  );

  const goToCheckout = useCallback(() => {
    setIsNavigatingToCheckout(true);
    setShowCheckoutFallback(false);

    if (checkoutFallbackTimer.current) {
      clearTimeout(checkoutFallbackTimer.current);
    }
    checkoutFallbackTimer.current = setTimeout(() => {
      setShowCheckoutFallback(true);
    }, CHECKOUT_FALLBACK_DELAY_MS);

    router.push("/checkout");
  }, [router]);

  useEffect(() => {
    return () => {
      if (checkoutFallbackTimer.current) {
        clearTimeout(checkoutFallbackTimer.current);
      }
    };
  }, []);

  const filteredBogoProducts = useCallback(
    (bogoProducts: Product[]) => {
      if (!searchQuery.trim()) return bogoProducts;
      return bogoProducts.filter((product) =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    },
    [searchQuery],
  );

  const handleFreeProductSelect = useCallback(
    (bogoProduct: Product) => {
      updateSlot(activeSlot, { product: bogoProduct, size: null });
      setIsSizeModalOpen(true);
    },
    [activeSlot, updateSlot],
  );

  const completeBogoFlow = useCallback(() => {
    if (!selectedProduct || !selectedSize || !allPicked) return;
    if (pairCount === 3 && !thirdSize) return;
    addToCart(selectedProduct, selectedSize, extraPicks, thirdSize);
    setIsBogoModalOpen(false);
    setIsSizeModalOpen(false);
    setThirdStep("idle");
    setTimeout(() => goToCheckout(), 100);
  }, [
    selectedProduct,
    selectedSize,
    allPicked,
    extraPicks,
    pairCount,
    thirdSize,
    addToCart,
    goToCheckout,
  ]);

  // After the 2nd pair: 3-pair offers go to the 3rd-pair size step, others checkout
  const proceedFromPicks = useCallback(() => {
    if (!allPicked) return;
    if (pairCount === 3 && !thirdSize) {
      setThirdStep("choosing");
      return;
    }
    completeBogoFlow();
  }, [allPicked, pairCount, thirdSize, completeBogoFlow]);

  const handleBogoScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop <= clientHeight + 300 &&
        !bogoLoading &&
        bogoHasMore
      ) {
        loadMoreBogoProducts();
      }
    },
    [bogoLoading, bogoHasMore, loadMoreBogoProducts],
  );

  /* ---------- BOGO page (2 and 3 pair offers) ---------- */

  const renderBogoPage = useCallback(
    (initialBogoProducts: Product[]) => {
      if (pairCount < 2) return null;
      if (!isBogoModalOpen || !selectedProduct) return null;

      const combinedBogoProducts = [
        ...initialBogoProducts,
        ...allBogoProducts,
      ];

      /* ================= 3RD PAIR (warehouse picks, customer gives size) ================= */
      if (thirdStep !== "idle") {
        if (thirdStep === "choosing") {
          return (
            <div
              className={`${display.className} fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-5 text-neutral-950 duration-300 animate-in fade-in`}
            >
              <style>{`
                @keyframes rp-shuffle-a { 0%,100% { transform: translateX(0) rotate(-8deg); z-index: 1; } 50% { transform: translateX(46px) rotate(6deg); z-index: 3; } }
                @keyframes rp-shuffle-b { 0%,100% { transform: translateX(0) rotate(0deg); z-index: 2; } 50% { transform: translateX(-46px) rotate(-6deg); z-index: 1; } }
                @keyframes rp-shuffle-c { 0%,100% { transform: translateX(0) rotate(8deg); z-index: 3; } 50% { transform: translateX(0) rotate(0deg) translateY(-14px); z-index: 2; } }
                @keyframes rp-bar { from { width: 0%; } to { width: 100%; } }
                @keyframes rp-word { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
                @media (prefers-reduced-motion: reduce) { .rp-anim, .rp-anim * { animation: none !important; } }
              `}</style>

              <div className="rp-anim flex flex-col items-center">
                <LivePill>Random pair</LivePill>

                <div className="relative mt-8 h-40 w-40">
                  {["a", "b", "c"].map((k) => (
                    <div
                      key={k}
                      className="absolute inset-0 flex items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-100 text-6xl font-extrabold text-neutral-300 shadow-sm"
                      style={{
                        animation: `rp-shuffle-${k} 0.9s ease-in-out infinite`,
                      }}
                    >
                      ?
                    </div>
                  ))}
                </div>

                <h2 className="mt-8 text-center text-3xl font-extrabold leading-[0.95] tracking-[-0.04em]">
                  Picking a random
                  <br />
                  3rd pair
                  <span
                    className="inline-block"
                    style={{ animation: "rp-word 1s ease-in-out infinite" }}
                  >
                    ...
                  </span>
                </h2>

                <div className="mt-8 h-1 w-52 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ animation: "rp-bar 2.4s ease-in-out forwards" }}
                  />
                </div>
              </div>
            </div>
          );
        }

        const sizeSet = new Set<string>();
        combinedBogoProducts.forEach((p) =>
          (p.sizes || []).forEach((s) => {
            if (!isSizeDisabled(p, s)) sizeSet.add(String(s));
          }),
        );
        const thirdSizes = sizeSet.size
          ? Array.from(sizeSet).sort((a, b) => parseFloat(a) - parseFloat(b))
          : ["6", "7", "8", "9", "10", "11"];

        return (
          <div
            className={`${display.className} fixed inset-0 z-50 flex flex-col justify-center overflow-y-auto bg-white px-5 py-8 text-neutral-950 duration-300 animate-in fade-in sm:px-8`}
          >
            <div className="mx-auto w-full max-w-md">
              <LivePill>Step 3 of 3</LivePill>
              <h2 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-[-0.045em]">
                Your random
                <br />
                3rd pair is ready.
              </h2>
              <p className="mb-5 mt-3 text-sm font-semibold text-neutral-500">
                Select your size (UK)
              </p>

              <div className="mb-8 flex flex-wrap gap-2">
                {thirdSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setThirdSize(size)}
                    className={`h-11 min-w-[52px] rounded-full px-4 text-sm font-extrabold tracking-tight transition-all duration-200 active:scale-90 ${
                      thirdSize === size
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                        : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <PillCTA
                onClick={completeBogoFlow}
                disabled={!thirdSize}
                className="w-full"
              >
                Confirm & checkout
              </PillCTA>
            </div>
          </div>
        );
      }

      const filteredProducts = filteredBogoProducts(combinedBogoProducts);
      const slotLabel = ordinal(activeSlot + 2);
      const totalUserSlots = extraPicks.length;

      return (
        <div
          className={`${display.className} fixed inset-0 z-50 h-full overflow-y-auto bg-white px-5 pt-6 text-neutral-950 duration-500 animate-in fade-in slide-in-from-bottom-8 sm:px-8`}
        >
          {/* Header */}
          <div className="mx-auto max-w-5xl">
            <LivePill>
              Step {activeSlot + 2} of {pairCount}
            </LivePill>
            <h2 className="mt-4 text-balance text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-6xl">
              Pick your
              <br />
              {slotLabel} pair.
            </h2>

            {/* First pair */}
            <div className="mt-6 flex items-center gap-3 rounded-3xl bg-neutral-100 p-3">
              <Thumbnail
                product={selectedProduct}
                alt="Your first pair"
                size="h-14 w-14"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold tracking-tight">
                  Your first pair
                </p>
                <p className="text-sm font-medium text-neutral-500">
                  UK {selectedSize}
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                <Check className="h-3 w-3" /> Locked
              </span>
            </div>

            {/* Status */}
            <div className="mb-4 mt-4 h-5">
              {selectedFreeProduct && !selectedFreeProductSize && (
                <p className="text-sm font-semibold text-blue-700 duration-300 animate-in fade-in slide-in-from-left-2">
                  Select a size for your {slotLabel} pair
                </p>
              )}
            </div>

            {/* Grid */}
            <div
              className="mb-40 grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto md:grid-cols-4 md:gap-4"
              onScroll={handleBogoScroll}
            >
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center duration-500 animate-in fade-in">
                  <Search className="mx-auto mb-3 h-6 w-6 text-neutral-300" />
                  <p className="text-sm font-semibold text-neutral-400">
                    No products found
                  </p>
                </div>
              ) : (
                filteredProducts.map((bogoProduct, i) => {
                  const picked = extraPicks.some(
                    (p) => p.product?._id === bogoProduct._id,
                  );
                  return (
                    <div
                      key={bogoProduct._id}
                      style={{
                        animationDelay: `${(i % 12) * 45}ms`,
                        animationFillMode: "both",
                      }}
                      className="w-full duration-500 animate-in fade-in slide-in-from-bottom-3"
                    >
                      <div
                        className={`relative overflow-hidden rounded-[1.75rem] outline outline-[3px] outline-offset-2 transition-all duration-300 active:scale-[0.97] ${
                          picked ? "outline-blue-600" : "outline-transparent"
                        }`}
                      >
                        <ProductCard2
                          product={bogoProduct}
                          className="w-full"
                          noLink={true}
                          onClick={() => handleFreeProductSelect(bogoProduct)}
                        />
                        {picked && (
                          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 duration-300 animate-in zoom-in-50">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {bogoLoading && (
                <div className="col-span-full py-3">
                  <div className="h-1 w-full animate-pulse rounded-full bg-neutral-950" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="fixed bottom-0 left-0 w-full border-t border-neutral-200 bg-white/90 p-4 backdrop-blur-md duration-500 animate-in slide-in-from-bottom-full">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {extraPicks.slice(0, totalUserSlots).map((pick, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlot(i)}
                    className={`flex items-center gap-2 rounded-full border-2 p-1 pr-3 transition-all duration-300 active:scale-95 ${
                      i === activeSlot
                        ? "border-neutral-950"
                        : "border-neutral-200"
                    }`}
                  >
                    {pick.product ? (
                      <Thumbnail
                        product={pick.product}
                        alt={`${ordinal(i + 2)} pair`}
                        size="h-10 w-10 !rounded-full"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-neutral-300 text-[11px] font-bold text-neutral-400">
                        {ordinal(i + 2)}
                      </div>
                    )}
                    <span className="text-xs font-bold">
                      {pick.product && pick.size ? (
                        <span className="text-blue-700">✓ {pick.size}</span>
                      ) : pick.product ? (
                        "Size?"
                      ) : (
                        <span className="text-neutral-400">Pick</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <PillCTA
                onClick={proceedFromPicks}
                disabled={!allPicked}
                className="h-14 min-w-[150px]"
              >
                {allPicked
                  ? pairCount === 3
                    ? "Continue"
                    : "Checkout"
                  : selectedFreeProduct && !selectedFreeProductSize
                    ? "Pick size"
                    : `Pick ${slotLabel}`}
              </PillCTA>
            </div>
          </div>
        </div>
      );
    },
    [
      isBogoModalOpen,
      selectedProduct,
      selectedSize,
      selectedFreeProduct,
      selectedFreeProductSize,
      extraPicks,
      activeSlot,
      allPicked,
      pairCount,
      filteredBogoProducts,
      handleFreeProductSelect,
      completeBogoFlow,
      proceedFromPicks,
      thirdStep,
      thirdSize,
      allBogoProducts,
      bogoLoading,
      handleBogoScroll,
    ],
  );

  /* ---------- Size modal ---------- */

  const renderSizeModal = useCallback(
    (bogoProducts: Product[]) => {
      const isSelectingFreeProduct =
        pairCount > 1 && isBogoModalOpen && !!selectedFreeProduct;
      const currentProduct = isSelectingFreeProduct
        ? selectedFreeProduct
        : selectedProduct;
      const currentSize = isSelectingFreeProduct
        ? selectedFreeProductSize
        : selectedSize;

      if (!currentProduct) return null;

      const isLastSlot = activeSlot >= extraPicks.length - 1;

      return (
        <Dialog open={isSizeModalOpen} onOpenChange={setIsSizeModalOpen}>
          <DialogContent
            className={`${display.className} max-h-[90vh] max-w-[350px] gap-0 overflow-y-auto rounded-[1.75rem] border-0 bg-white p-5 text-neutral-950 duration-300`}
          >
            <DialogTitle className="sr-only">Select Size</DialogTitle>

            <div className="mb-5 overflow-hidden rounded-[1.5rem] duration-500 animate-in fade-in zoom-in-95">
              <ProductCard2 product={currentProduct} noLink={true} />
            </div>

            <h3 className="mb-1 line-clamp-1 text-2xl font-extrabold leading-none tracking-[-0.04em]">
              {currentProduct.productName}
            </h3>
            <p className="mb-4 text-sm font-semibold text-neutral-500">
              Select your size (UK)
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {currentProduct.sizes?.map((rawSize, i) => {
                const size = String(rawSize);
                const off = isSizeDisabled(currentProduct, size);
                const active = currentSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={off}
                    style={{
                      animationDelay: `${i * 35}ms`,
                      animationFillMode: "both",
                    }}
                    className={`h-11 min-w-[52px] rounded-full px-4 text-sm font-extrabold tracking-tight transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 active:scale-90 ${
                      off
                        ? "cursor-not-allowed bg-neutral-100 text-neutral-300 line-through"
                        : active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
                    }`}
                    onClick={() => {
                      if (off) return;
                      if (isSelectingFreeProduct) {
                        updateSlot(activeSlot, { size });
                      } else {
                        setSelectedSize(size);
                      }
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            <PillCTA
              disabled={!currentSize}
              className="w-full"
              onClick={() => {
                if (!currentSize) {
                  toast.error("Please select a size");
                  return;
                }

                if (isSizeDisabled(currentProduct, currentSize)) {
                  toast.error("This size is unavailable");
                  return;
                }

                if (isSelectingFreeProduct) {
                  setIsSizeModalOpen(false);

                  if (!isLastSlot) {
                    setActiveSlot((s) => s + 1);
                  } else {
                    proceedFromPicks();
                  }
                } else {
                  // Only 2 and 3 pair offers continue to the "pick next pair" step.
                  // A 1 pair order goes straight to checkout.
                  if (pairCount > 1 && isInOffer(selectedProduct, pairCount)) {
                    setIsBogoModalOpen(true);
                    setIsSizeModalOpen(false);
                  } else {
                    addToCart(selectedProduct!, currentSize);
                    setIsSizeModalOpen(false);
                    goToCheckout();
                  }
                }
              }}
            >
              {isSelectingFreeProduct
                ? isLastSlot
                  ? pairCount === 3
                    ? "Confirm & continue"
                    : "Confirm & checkout"
                  : "Confirm & next pair"
                : pairCount === 1
                  ? "Confirm & checkout"
                  : "Confirm size"}
            </PillCTA>
          </DialogContent>
        </Dialog>
      );
    },
    [
      isBogoModalOpen,
      isSizeModalOpen,
      selectedFreeProduct,
      selectedProduct,
      selectedFreeProductSize,
      selectedSize,
      extraPicks.length,
      activeSlot,
      updateSlot,
      proceedFromPicks,
      addToCart,
      goToCheckout,
      pairCount,
    ],
  );

  /* ---------- Checkout loading ---------- */

  const renderCheckoutLoading = useCallback(() => {
    if (!isNavigatingToCheckout) return null;

    return (
      <div
        className={`${display.className} fixed inset-0 z-[100] flex flex-col justify-end bg-white p-6 text-neutral-950 duration-300 animate-in fade-in sm:p-12`}
      >
        <div className="mb-4">
          <LivePill>Order in progress</LivePill>
        </div>
        <h2 className="text-balance text-[13vw] font-extrabold leading-[0.9] tracking-[-0.045em] duration-700 animate-in slide-in-from-bottom-6 sm:text-[8vw]">
          Taking you
          <br />
          to checkout.
        </h2>
        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        </div>

        {showCheckoutFallback && (
          <Link
            href="/checkout"
            onClick={() => setIsNavigatingToCheckout(false)}
            className="group mt-6 flex h-14 items-center justify-between rounded-full bg-neutral-950 pl-6 pr-1.5 text-white duration-500 animate-in fade-in slide-in-from-bottom-2 transition-colors hover:bg-blue-600"
          >
            <span className="text-lg font-extrabold tracking-[-0.03em]">
              Still here? Go to checkout
            </span>
            <span
              aria-hidden="true"
              className="ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45"
            >
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        )}
      </div>
    );
  }, [isNavigatingToCheckout, showCheckoutFallback]);

  return {
    handleProductClick,
    renderBogoPage,
    renderSizeModal,
    renderCheckoutLoading,
    setSearchQuery,
  };
};