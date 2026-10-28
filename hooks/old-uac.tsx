"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";
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
    emptyPicks(pairCount - 1),
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

  /* ---------- Surprise (3-pair) state ---------- */
  const [surpriseState, setSurpriseState] = useState<
    "idle" | "spinning" | "revealed"
  >("idle");
  // Kept in a ref — the customer never sees which pair they got
  const surpriseProductRef = useRef<Product | null>(null);
  const surpriseSizeRef = useRef<string | null>(null);

  const combinedProductsRef = useRef<Product[]>([]);
  const surpriseTriggeredRef = useRef(false);
  const latestSelectedProductRef = useRef<Product | null>(null);
  const latestExtraPicksRef = useRef<PairPick[]>([]);

  useEffect(() => {
    latestSelectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  useEffect(() => {
    latestExtraPicksRef.current = extraPicks;
  }, [extraPicks]);

  // Spin → (hidden) pick → celebration. The customer only ever sees the
  // "revealed" celebration — never the product name or image.
  useEffect(() => {
    if (surpriseState !== "spinning") {
      surpriseTriggeredRef.current = false;
      return;
    }
    if (surpriseTriggeredRef.current) return;
    surpriseTriggeredRef.current = true;

    const sp = latestSelectedProductRef.current;
    const ep = latestExtraPicksRef.current;

    // Exclude the products already picked (1st + 2nd pair)
    const pool = combinedProductsRef.current.filter(
      (p) => p._id !== sp?._id && p._id !== ep[0]?.product?._id,
    );
    const finalPool = pool.length > 0 ? pool : combinedProductsRef.current;

    if (finalPool.length === 0) {
      toast.error("No surprise available right now");
      setSurpriseState("idle");
      return;
    }

    // Reveal after ~2.4s — pick product + random available size silently
    const revealTimeout = setTimeout(() => {
      const finalProduct =
        finalPool[Math.floor(Math.random() * finalPool.length)];

      const availableSizes = (finalProduct.sizes || []).filter(
        (s) => !isSizeDisabled(finalProduct, s),
      );

      const chosenSize =
        availableSizes.length > 0
          ? String(
              availableSizes[Math.floor(Math.random() * availableSizes.length)],
            )
          : null;

      if (!chosenSize) {
        toast.error("No size available for the surprise pair");
        setSurpriseState("idle");
        return;
      }

      surpriseProductRef.current = finalProduct;
      surpriseSizeRef.current = chosenSize;
      setSurpriseState("revealed");
    }, 2400);

    return () => {
      clearTimeout(revealTimeout);
    };
  }, [surpriseState]);

  // Confetti celebration on reveal
  useEffect(() => {
    if (surpriseState !== "revealed") return;
    navigator.vibrate?.([60, 40, 140]);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const colors = [
      "#fbbf24",
      "#f472b6",
      "#60a5fa",
      "#34d399",
      "#f87171",
      "#a78bfa",
      "#ffffff",
    ];
    const base = { zIndex: 9999, colors };

    // 1) Center blast
    confetti({
      ...base,
      particleCount: 140,
      spread: 100,
      startVelocity: 55,
      scalar: 1.1,
      origin: { x: 0.5, y: 0.55 },
    });

    // 2) Gold star burst
    const t = setTimeout(() => {
      confetti({
        ...base,
        particleCount: 70,
        spread: 360,
        startVelocity: 28,
        gravity: 0.7,
        ticks: 220,
        shapes: ["star"],
        colors: ["#fbbf24", "#fde68a", "#ffffff"],
        scalar: 1.3,
        origin: { x: 0.5, y: 0.4 },
      });
    }, 250);

    // 3) Side cannons
    const end = Date.now() + 2200;
    let raf = 0;
    const frame = () => {
      confetti({
        ...base,
        particleCount: 3,
        angle: 60,
        spread: 60,
        startVelocity: 60,
        origin: { x: 0, y: 0.8 },
      });
      confetti({
        ...base,
        particleCount: 3,
        angle: 120,
        spread: 60,
        startVelocity: 60,
        origin: { x: 1, y: 0.8 },
      });
      if (Date.now() < end) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      confetti.reset();
    };
  }, [surpriseState]);

  const handleProductClick = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setSelectedSize(null);
      setExtraPicks(emptyPicks(pairCount - 1));
      setActiveSlot(0);
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
    (item: Product, size: string, picks: PairPick[] = []) => {
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
        thirdProduct: toLine(picks[1]),
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
    addToCart(selectedProduct, selectedSize, extraPicks);
    setIsBogoModalOpen(false);
    setIsSizeModalOpen(false);
    setTimeout(() => goToCheckout(), 100);
  }, [
    selectedProduct,
    selectedSize,
    allPicked,
    extraPicks,
    addToCart,
    goToCheckout,
  ]);

  // Claim the (hidden) surprise 3rd pair and go to checkout
  const claimSurprise = useCallback(() => {
    const surpriseProduct = surpriseProductRef.current;
    const surpriseSize = surpriseSizeRef.current;

    if (!surpriseProduct || !surpriseSize || !selectedProduct || !selectedSize) {
      return;
    }

    const picks: PairPick[] = [
      extraPicks[0],
      { product: surpriseProduct, size: surpriseSize },
    ];

    addToCart(selectedProduct, selectedSize, picks);
    setIsBogoModalOpen(false);
    setIsSizeModalOpen(false);

    // Reset surprise state
    setSurpriseState("idle");
    surpriseProductRef.current = null;
    surpriseSizeRef.current = null;

    setTimeout(() => goToCheckout(), 100);
  }, [selectedProduct, selectedSize, extraPicks, addToCart, goToCheckout]);

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
      // Keep ref fresh so the surprise effect always sees the latest pool
      combinedProductsRef.current = combinedBogoProducts;

      /* ================= SURPRISE SCREEN (3rd pair) ================= */
      if (surpriseState !== "idle") {
        const spinning = surpriseState === "spinning";
        return (
          <div
            className={`${display.className} fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-500 px-5 text-white`}
          >
            <style>{`
              @keyframes sp-rays { to { transform: rotate(360deg); } }
              @keyframes sp-shake {
                0%,100% { transform: translate(0,0) rotate(0); }
                20% { transform: translate(-3px,1px) rotate(-5deg); }
                40% { transform: translate(3px,-2px) rotate(5deg); }
                60% { transform: translate(-3px,2px) rotate(-4deg); }
                80% { transform: translate(3px,-1px) rotate(4deg); }
              }
              @keyframes sp-charge { 0% { scale: 1; filter: brightness(1); } 100% { scale: 1.35; filter: brightness(1.5); } }
              @keyframes sp-pop {
                0% { transform: scale(0.2) rotate(-14deg); opacity: 0; }
                55% { transform: scale(1.2) rotate(4deg); opacity: 1; }
                100% { transform: scale(1) rotate(0); opacity: 1; }
              }
              @keyframes sp-rise { 0% { transform: translateY(24px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
              @keyframes sp-flash { 0% { opacity: 0.95; } 100% { opacity: 0; } }
              @keyframes sp-ring { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
              @keyframes sp-float { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
              @keyframes sp-twinkle { 0%,100% { transform: scale(0); opacity: 0; } 50% { transform: scale(1); opacity: 1; } }
              @keyframes sp-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(260%) skewX(-20deg); } }
              @keyframes sp-glow { 0%,100% { box-shadow: 0 0 25px rgba(251,191,36,.55); } 50% { box-shadow: 0 0 60px rgba(251,191,36,1); } }
              @keyframes sp-bar { from { width: 0%; } to { width: 100%; } }
              @media (prefers-reduced-motion: reduce) { .sp-anim, .sp-anim * { animation: none !important; } }
            `}</style>

            {/* Rotating light rays */}
            <div
              className="sp-anim pointer-events-none absolute left-1/2 top-1/2 h-[220vmax] w-[220vmax] -translate-x-1/2 -translate-y-1/2 opacity-30"
              style={{
                background:
                  "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.55) 0deg 8deg, transparent 8deg 24deg)",
                maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
                WebkitMaskImage:
                  "radial-gradient(circle, black 0%, transparent 55%)",
                animation: `sp-rays ${spinning ? 6 : 14}s linear infinite`,
              }}
            />

            {/* Flash on reveal */}
            {!spinning && (
              <div
                className="pointer-events-none absolute inset-0 z-20 bg-white"
                style={{ animation: "sp-flash 0.7s ease-out forwards" }}
              />
            )}

            {/* Twinkling sparkles */}
            <div className="sp-anim pointer-events-none absolute inset-0">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute text-xl"
                  style={{
                    left: `${(i * 53) % 96}%`,
                    top: `${(i * 31 + 7) % 92}%`,
                    animation: `sp-twinkle ${1.6 + (i % 4) * 0.4}s ease-in-out ${(i % 6) * 0.25}s infinite`,
                  }}
                >
                  {i % 3 === 0 ? "✨" : i % 3 === 1 ? "⭐" : "✦"}
                </span>
              ))}
            </div>

            {spinning ? (
              <div className="sp-anim relative z-10 flex flex-col items-center text-center">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] opacity-80">
                  Mystery pair
                </p>

                <div className="relative flex h-64 w-64 items-center justify-center">
                  <span
                    className="absolute inset-4 rounded-full border-2 border-white/50"
                    style={{ animation: "sp-ring 1.2s ease-out infinite" }}
                  />
                  <span
                    className="absolute inset-4 rounded-full border-2 border-white/30"
                    style={{ animation: "sp-ring 1.2s ease-out 0.6s infinite" }}
                  />
                  <div className="absolute h-44 w-44 rounded-full bg-yellow-300/40 blur-3xl" />
                  <div style={{ animation: "sp-charge 2.4s ease-in forwards" }}>
                    <div
                      className="text-[9rem] leading-none drop-shadow-2xl"
                      style={{ animation: "sp-shake 0.45s ease-in-out infinite" }}
                    >
                      🎁
                    </div>
                  </div>
                </div>

                <h2 className="mt-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-5xl">
                  Unwrapping your
                  <br />
                  surprise...
                </h2>

                <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ animation: "sp-bar 2.4s ease-in-out forwards" }}
                  />
                </div>
              </div>
            ) : (
              <div className="sp-anim relative z-10 flex flex-col items-center text-center">
                <div className="relative flex h-60 w-60 items-center justify-center">
                  <span
                    className="absolute inset-6 rounded-full border-2 border-white/60"
                    style={{ animation: "sp-ring 1.8s ease-out infinite" }}
                  />
                  <span
                    className="absolute inset-6 rounded-full border-2 border-white/40"
                    style={{ animation: "sp-ring 1.8s ease-out 0.9s infinite" }}
                  />
                  <div className="absolute h-48 w-48 rounded-full bg-yellow-300/50 blur-3xl" />
                  <div
                    style={{
                      animation: "sp-pop 0.9s cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  >
                    <div
                      className="text-[9rem] leading-none drop-shadow-2xl"
                      style={{
                        animation: "sp-float 2.6s ease-in-out 0.9s infinite",
                      }}
                    >
                      🎁
                    </div>
                  </div>
                </div>

                <h2
                  className="text-5xl font-extrabold tracking-[-0.045em] sm:text-6xl"
                  style={{ animation: "sp-rise 0.6s ease-out 0.35s both" }}
                >
                  Surprise
                  <br />
                  unlocked! 🎉
                </h2>

                <p
                  className="mt-3 max-w-xs text-base font-semibold opacity-95"
                  style={{ animation: "sp-rise 0.6s ease-out 0.55s both" }}
                >
                  A mystery 3rd pair is added to your order. You&apos;ll find
                  out which one when it arrives 🚚
                </p>

                <button
                  type="button"
                  onClick={claimSurprise}
                  style={{
                    animation:
                      "sp-rise 0.6s ease-out 0.8s both, sp-glow 2s ease-in-out 1.4s infinite",
                  }}
                  className="relative mt-7 flex h-14 w-72 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-lg font-extrabold tracking-[-0.03em] text-white transition-transform active:scale-95"
                >
                  <span className="relative z-10">Claim &amp; checkout 🎁</span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1/3 bg-white/25"
                    style={{
                      animation: "sp-shine 2.2s ease-in-out 1.4s infinite",
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        );
      }

      /* ================= NORMAL GRID (2nd pair picker) ================= */
      const filteredProducts = filteredBogoProducts(combinedBogoProducts);
      const slotLabel = ordinal(activeSlot + 2);
      const totalUserSlots = pairCount === 3 ? 1 : pairCount - 1;

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

            {pairCount === 3 && (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-purple-700">
                <span className="text-lg">🎁</span>
                Your 3rd pair is a surprise — pick the 2nd and let the magic
                happen.
              </p>
            )}

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

                {/* 3-pair surprise placeholder instead of slot 2 picker */}
                {pairCount === 3 && (
                  <div className="flex items-center gap-2 rounded-full border-2 border-dashed border-purple-400 bg-purple-50 p-1 pr-3 text-xs font-bold text-purple-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-lg">
                      🎁
                    </div>
                    <span>Surprise</span>
                  </div>
                )}
              </div>

              <PillCTA
                onClick={completeBogoFlow}
                disabled={!allPicked}
                className="h-14 min-w-[150px]"
              >
                {allPicked
                  ? "Checkout"
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
      allBogoProducts,
      bogoLoading,
      handleBogoScroll,
      surpriseState,
      claimSurprise,
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

                  // 3-pair: after the 2nd pair is sized, kick off the surprise
                  if (pairCount === 3 && activeSlot === 0) {
                    setSurpriseState("spinning");
                    return;
                  }

                  if (!isLastSlot) {
                    setActiveSlot((s) => s + 1);
                  } else {
                    completeBogoFlow();
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
                ? pairCount === 3 && activeSlot === 0
                  ? "Unlock my surprise 🎁"
                  : isLastSlot
                    ? "Confirm & checkout"
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
      completeBogoFlow,
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