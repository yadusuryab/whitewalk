"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Inter_Tight } from "next/font/google";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  PackageOpen,
  BadgeCheck,
  ShoppingBag,
} from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

interface ShopVideoProps {
  src?: string;
  poster?: string;
  onShopNow?: () => void;
}

// Edit to match your video
const VIDEO_LENGTH = "0:28";
const HIGHLIGHTS = [
  { icon: PackageOpen, label: "All India delivery" },
  { icon: BadgeCheck, label: "Premium quality" },
];

const formatTime = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function ShopVideo({
  src = "/v2.mp4",
  poster = "/v2-poster.jpg",
  onShopNow,
}: ShopVideoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [seen, setSeen] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true); // muted start = autoplay always works
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSoundHint, setShowSoundHint] = useState(true);

  // Reveal the card once, when it scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reveal = `transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
    seen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
  }`;
  const delay = (ms: number) => ({ transitionDelay: seen ? `${ms}ms` : "0ms" });

  const closeModal = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setProgress(0);
    setPlaying(false);
    setOpen(false);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  // Lock scroll + focus close button + Esc (only while open)
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === " " && document.activeElement?.tagName !== "BUTTON") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeModal, togglePlay]);

  // Start playback on open
  useEffect(() => {
    const v = videoRef.current;
    if (!open || !v) return;
    v.muted = muted;
    v.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    setShowSoundHint(false);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const handleShopNow = () => {
    closeModal();
    onShopNow?.();
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <section ref={sectionRef} className="w-full sm:px-8">
        <div
          className={`${display.className} group relative rounded-[1.75rem] bg-blue-50 p-6 text-neutral-950 sm:p-10`}
        >
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Text column */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className={reveal} style={delay(0)}>
                <p className="text-sm font-semibold text-blue-700">
                  Shop video, {VIDEO_LENGTH}
                </p>
                <h2 className="mt-3 text-balance text-[2.5rem] font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-6xl">
                  See how it&apos;s made.
                </h2>
                <p className="mt-3 max-w-[28ch] text-base font-medium leading-snug text-neutral-600">
                  Watch how we craft our products with care.
                </p>
              </div>

              <ul
                className={`mt-5 space-y-1.5 text-sm font-semibold text-neutral-700 ${reveal}`}
                style={delay(120)}
              >
                {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2">
                    <Icon className="size-4 text-blue-600" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>

              {/* Stretched button: the whole card opens the video */}
              <div className={`mt-6 ${reveal}`} style={delay(260)}>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  aria-label="Watch shop video"
                  className="flex items-center gap-3 after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-neutral-950"
                >
                  <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                    Watch video
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white transition-colors duration-300 group-hover:bg-blue-600"
                  >
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                </button>
              </div>
            </div>

            {/* Poster */}
            <div
              className={`w-[36%] max-w-[200px] shrink-0 ${reveal}`}
              style={delay(160)}
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-neutral-200">
                <Image
                  src={poster}
                  alt="Shop video preview"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 36vw, 200px"
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shop video"
          className={`${display.className} fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md`}
          onClick={closeModal}
        >
          <button
            ref={closeBtnRef}
            onClick={closeModal}
            aria-label="Close video"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:bg-blue-600 hover:text-white"
          >
            <X className="size-5" />
          </button>

          <div
            className="relative h-[85vh] max-h-[850px] w-full max-w-[420px] overflow-hidden rounded-[1.75rem] bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              loop
              muted
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setProgress(
                  v.duration ? (v.currentTime / v.duration) * 100 : 0,
                );
              }}
              className="h-full w-full cursor-pointer object-cover"
            />

            {/* Gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

            {/* Top label */}
            <p className="pointer-events-none absolute left-5 top-6 text-lg font-extrabold tracking-[-0.03em] text-white">
              Shop video
            </p>

            {/* Paused indicator */}
            {!playing && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-neutral-950 shadow-2xl">
                  <Play className="ml-1 size-7 fill-current" />
                </div>
              </div>
            )}

            {/* Sound hint */}
            {muted && showSoundHint && (
              <button
                onClick={toggleMute}
                className="absolute left-1/2 top-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 shadow-xl"
              >
                <Volume2 className="size-4" aria-hidden="true" />
                Tap for sound
              </button>
            )}

            {/* Bottom controls */}
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
              {/* Progress */}
              <div className="flex items-center gap-2 text-xs font-medium text-white/80">
                <span className="w-8 tabular-nums">
                  {formatTime((progress / 100) * duration)}
                </span>
                <div
                  onClick={seek}
                  className="group/bar relative h-4 flex-1 cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-all group-hover/bar:h-1.5">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  aria-label={playing ? "Pause video" : "Play video"}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl transition hover:bg-white/30"
                >
                  {playing ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="ml-0.5 size-5" />
                  )}
                </button>

                <button
                  onClick={handleShopNow}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white text-base font-extrabold tracking-[-0.02em] text-neutral-950 transition hover:bg-blue-600 hover:text-white active:scale-[0.98]"
                >
                  <ShoppingBag className="size-4" />
                  Shop now
                </button>

                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-xl transition hover:bg-white/30"
                >
                  {muted ? (
                    <VolumeX className="size-5" />
                  ) : (
                    <Volume2 className="size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}