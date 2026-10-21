"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight, BadgeCheck, ChevronDown, Loader2 } from "lucide-react";
import { client } from "@/sanityClient";
import ReviewForm from "@/components/sections/review-form";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  reviewText?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

type Sort = "recent" | "high" | "low";
type Lightbox = { urls: string[]; index: number } | null;

const PAGE_SIZE = 5;
const TEXT_LIMIT = 220;

/* ---------- Shared bits ---------- */

function LivePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
      </span>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </p>
  );
}

function PillButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-14 w-full items-center justify-between rounded-full bg-neutral-950 pl-6 pr-1.5 text-lg font-extrabold tracking-[-0.03em] text-white transition-colors duration-300 hover:bg-blue-600 ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45"
      >
        <ArrowUpRight className="h-5 w-5" />
      </span>
    </button>
  );
}

/* ---------- Stars ---------- */

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span
      className="relative inline-block leading-none"
      style={{ fontSize: size }}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="text-neutral-200">★★★★★</span>
      <span
        className="absolute inset-0 overflow-hidden whitespace-nowrap text-neutral-950"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

/* ---------- Summary ---------- */

function Summary({
  reviews,
  onWrite,
}: {
  reviews: Review[];
  filter: number | null;
  onFilter: (n: number | null) => void;
  onWrite: () => void;
}) {
  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <LivePill>Reviews</LivePill>

      <h2 className="mt-5 text-balance text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-5xl">
        Customer reviews.
      </h2>

      <div className="mt-8 flex items-end gap-4 border-t-2 border-neutral-950 pt-6">
        <span className="text-7xl font-extrabold leading-[0.8] tracking-[-0.06em]">
          {avg.toFixed(1)}
        </span>
        <div className="pb-0.5">
          <Stars value={avg} size={20} />
          <p className="mt-1.5 text-sm font-semibold text-neutral-500">
            {total} {total === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <p className="text-xl font-extrabold tracking-[-0.04em]">Review this product</p>
        <p className="mt-1 text-base font-medium text-neutral-600">
          Share your thoughts and photos.
        </p>
        <PillButton onClick={onWrite} className="mt-5">
          Write a review
        </PillButton>
      </div>
    </aside>
  );
}

/* ---------- Customer photos strip ---------- */

function PhotoStrip({
  reviews,
  onOpen,
}: {
  reviews: Review[];
  onOpen: (urls: string[], index: number) => void;
}) {
  const all = useMemo(() => reviews.flatMap((r) => r.images), [reviews]);
  if (!all.length) return null;
  const shown = all.slice(0, 8);
  const extra = all.length - shown.length;

  return (
    <section className="mb-10">
      <Eyebrow>Reviews with images</Eyebrow>
      <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2">
        {shown.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => onOpen(all, i)}
            className="relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-2xl bg-neutral-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 sm:h-24 sm:w-24"
            aria-label={`Open customer photo ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/60 text-lg font-extrabold tracking-[-0.03em] text-white">
                +{extra}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Single review ---------- */

function ReviewItem({
  review,
  onOpen,
}: {
  review: Review;
  onOpen: (urls: string[], index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const text = review.reviewText ?? "";
  const long = text.length > TEXT_LIMIT;
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="border-b border-neutral-200 py-6 first:pt-0 last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-base font-extrabold text-white"
        >
          {review.customerName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold leading-none tracking-[-0.035em]">
            {review.customerName}
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-500">{date}</p>
        </div>
        {review.isVerifiedPurchase && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-700">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        )}
      </div>

      <div className="mt-4">
        <Stars value={review.rating} size={18} />
      </div>

      {text && (
        <p className="mt-3 whitespace-pre-line text-base font-medium leading-relaxed text-neutral-700">
          {long && !expanded ? `${text.slice(0, TEXT_LIMIT).trimEnd()}…` : text}
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="ml-1.5 font-extrabold tracking-[-0.02em] text-blue-600 hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      )}

      {review.images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {review.images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onOpen(review.images, i)}
              className="relative h-16 w-16 overflow-hidden rounded-xl bg-neutral-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 sm:h-20 sm:w-20"
              aria-label={`Open photo ${i + 1} by ${review.customerName}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

/* ---------- Lightbox ---------- */

function LightboxView({
  state,
  onChange,
  onClose,
}: {
  state: NonNullable<Lightbox>;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const { urls, index } = state;
  const touchX = useRef<number | null>(null);
  const prev = useCallback(
    () => onChange((index - 1 + urls.length) % urls.length),
    [index, urls.length, onChange]
  );
  const next = useCallback(
    () => onChange((index + 1) % urls.length),
    [index, urls.length, onChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  const circleBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition-colors hover:bg-blue-600 hover:text-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customer photo"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 p-4"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || urls.length < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`absolute right-4 top-4 text-lg font-extrabold ${circleBtn}`}
      >
        ✕
      </button>

      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className={`absolute left-3 hidden text-2xl sm:left-6 sm:flex ${circleBtn}`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className={`absolute right-3 hidden text-2xl sm:right-6 sm:flex ${circleBtn}`}
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative h-[80dvh] w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={urls[index]}
          alt="Customer review photo"
          fill
          sizes="100vw"
          className="rounded-2xl object-contain"
        />
      </div>

      {urls.length > 1 && (
        <p className="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums tracking-[0.1em] text-white">
          {index + 1} / {urls.length}
        </p>
      )}
    </div>
  );
}

/* ---------- Page ---------- */

export default function ReviewsPage({ shoeId }: { shoeId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");
  const [filter, setFilter] = useState<number | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await client.fetch<any[]>(
        `*[_type == "review" && isApproved == true
            ${shoeId ? "&& shoe._ref == $shoeId" : ""}]
          | order(createdAt desc) {
            _id,
            customerName,
            rating,
            reviewText,
            isVerifiedPurchase,
            createdAt,
            "images": reviewImages[].asset->url
          }`,
        shoeId ? { shoeId } : {}
      );
      setReviews(
        data.map((r) => ({
          ...r,
          images: (r.images ?? []).filter(Boolean),
        }))
      );
    } catch (e) {
      console.error("Error fetching reviews:", e);
      setError("Could not load reviews. Try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [shoeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [sort, filter]);

  const list = useMemo(() => {
    const base = filter ? reviews.filter((r) => r.rating === filter) : reviews;
    const sorted = [...base];
    if (sort === "high") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "low") sorted.sort((a, b) => a.rating - b.rating);
    return sorted;
  }, [reviews, sort, filter]);

  const openLightbox = useCallback(
    (urls: string[], index: number) => setLightbox({ urls, index }),
    []
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const shell = `${display.className} text-neutral-950`;

  if (loading) {
    return (
      <section className={`${shell} flex flex-col items-center py-24`}>
        <Loader2 className="h-8 w-8 animate-spin text-neutral-950" />
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Loading reviews
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${shell} mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center`}>
        <p className="w-full rounded-2xl bg-red-600/10 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
        <div className="mt-5 w-full max-w-xs">
          <PillButton onClick={load}>Try again</PillButton>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className={`${shell} mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center`}>
        <h2 className="text-4xl font-extrabold leading-[0.92] tracking-[-0.045em]">
          No reviews yet.
        </h2>
        <p className="mb-6 mt-3 text-base font-medium text-neutral-600">Be the first to review.</p>
        <div className="w-full max-w-xs">
          <PillButton onClick={() => setShowForm(true)}>Write a review</PillButton>
        </div>
        {showForm && <ReviewForm shoeId={shoeId} onClose={() => setShowForm(false)} />}
      </section>
    );
  }

  return (
    <section className={`${shell} mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-8 sm:pt-20`}>
      <div className="grid gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
        <Summary
          reviews={reviews}
          filter={filter}
          onFilter={setFilter}
          onWrite={() => setShowForm(true)}
        />

        <div className="min-w-0">
          <PhotoStrip reviews={reviews} onOpen={openLightbox} />

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t-2 border-neutral-950 pb-6 pt-5">
            <h3 className="text-2xl font-extrabold leading-none tracking-[-0.04em] sm:text-3xl">
              {filter ? `${filter}-star reviews` : "Top reviews"}
              <span className="ml-2 align-middle text-sm font-semibold tracking-normal text-neutral-400">
                {list.length}
              </span>
            </h3>

            <label className="relative flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-11 appearance-none rounded-full border-2 border-neutral-950 bg-white pl-5 pr-11 text-sm font-semibold focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
              >
                <option value="recent">Most recent</option>
                <option value="high">Highest rated</option>
                <option value="low">Lowest rated</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-4 h-4 w-4"
              />
            </label>
          </div>

          {list.length === 0 ? (
            <p className="py-10 text-center text-base font-medium text-neutral-500">
              No reviews match this filter.
            </p>
          ) : (
            <div>
              {list.slice(0, visible).map((r) => (
                <ReviewItem key={r._id} review={r} onOpen={openLightbox} />
              ))}
            </div>
          )}

          {visible < list.length && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="group mt-6 flex h-14 w-full items-center justify-between rounded-full border-2 border-neutral-950 pl-6 pr-1.5 text-lg font-extrabold tracking-[-0.03em] transition-colors duration-300 hover:border-blue-600 hover:text-blue-600"
            >
              See more reviews
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300 group-hover:rotate-45"
              >
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </button>
          )}
        </div>
      </div>

      {lightbox && (
        <LightboxView
          state={lightbox}
          onChange={(i) => setLightbox((s) => (s ? { ...s, index: i } : s))}
          onClose={closeLightbox}
        />
      )}

      {showForm && <ReviewForm shoeId={shoeId} onClose={() => setShowForm(false)} />}
    </section>
  );
}