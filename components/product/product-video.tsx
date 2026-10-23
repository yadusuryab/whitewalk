// product-video.tsx
"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";

interface ProductVideoProps {
  src?: string | null;
  poster?: string | null;
  title?: string;
  className?: string;
}

export default function ProductVideo({ src, poster, title, className = "" }: ProductVideoProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    ref.current?.play().catch(() => {});
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Watch product video"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={`group flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-3 text-[10px] font-extrabold uppercase tracking-widest text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black hover:text-white active:scale-95 ${className}`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-white group-hover:text-black">
          <Play size={9} fill="currentColor" className="ml-px" />
        </span>
        Shoe video
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="pv-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            role="dialog"
            aria-modal="true"
          >
            <style>{`
              @keyframes pvFade { from { opacity: 0 } to { opacity: 1 } }
              @keyframes pvRise { from { opacity: 0; transform: translateY(32px) scale(.96) } to { opacity: 1; transform: none } }
              @keyframes pvSlide { from { transform: translateY(100%) } to { transform: none } }
              .pv-backdrop { animation: pvFade .25s ease-out }
              .pv-panel { animation: pvRise .45s cubic-bezier(.16,1,.3,1) }
              .pv-line { overflow: hidden }
              .pv-line > span { display: block; animation: pvSlide .6s .15s cubic-bezier(.16,1,.3,1) both }
            `}</style>

            <div
              className="pv-panel relative w-full max-w-sm sm:max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-end justify-between gap-4 text-white">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                    Product Film
                  </p>
                  <h3 className="pv-line">
                    <span className="truncate text-2xl font-black uppercase leading-none tracking-tight sm:text-3xl">
                      {title || "Watch"}
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close video"
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition hover:bg-white hover:text-black"
                >
                  Close <X size={12} />
                </button>
              </div>

              <video
                ref={ref}
                src={src}
                poster={poster ?? undefined}
                controls
                playsInline
                loop
                preload="auto"
                onError={(e) => console.error("Video error:", e.currentTarget.error)}
                className="max-h-[75vh] w-full rounded-2xl bg-black object-contain shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}