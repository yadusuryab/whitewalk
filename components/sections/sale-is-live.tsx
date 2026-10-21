"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/offer", "/checkout", "/cart", "/order"];

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

function getNextMidnightUTC() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
    ),
  );
}

function getTimeLeft(endTime: Date): TimeLeft {
  const difference = endTime.getTime() - Date.now();

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/* ---------- Flip card (two digits) ---------- */

function FlipCard({ value }: { value: number }) {
  const display = pad(value);
  const [current, setCurrent] = useState(display);
  const [previous, setPrevious] = useState(display);
  const [flipping, setFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  useEffect(() => {
    if (display === current) return;
    setPrevious(current);
    setCurrent(display);
    setFlipKey((k) => k + 1);
    setFlipping(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display]);

  return (
    <div className="flip-card" aria-hidden="true">
      {/* Static top: new value */}
      <div className="flip-half flip-top">
        <span>{current}</span>
      </div>

      {/* Static bottom: old value until the flap lands */}
      <div className="flip-half flip-bottom">
        <span>{previous}</span>
      </div>

      {flipping && (
        <>
          {/* Top flap falls, showing old value */}
          <div key={`f-${flipKey}`} className="flip-half flip-top flip-flap">
            <span>{previous}</span>
          </div>

          {/* Bottom flap rises, showing new value */}
          <div
            key={`b-${flipKey}`}
            className="flip-half flip-bottom flip-flap-back"
            onAnimationEnd={() => {
              setPrevious(current);
              setFlipping(false);
            }}
          >
            <span>{current}</span>
          </div>
        </>
      )}

      <div className="flip-hinge" />
    </div>
  );
}

/* ---------- Clock ---------- */

function FlipClock({ compact = false }: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const endTime = getNextMidnightUTC();

    setTimeLeft(getTimeLeft(endTime));

    const timer = setInterval(() => {
      const next = getTimeLeft(endTime);
      setTimeLeft(next);
      if (next.isExpired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const units = timeLeft
    ? [timeLeft.hours, timeLeft.minutes, timeLeft.seconds]
    : [];

  return (
    <>
      <style>{`
        .flip-clock {
          --card-w: 26px;
          --card-h: 34px;
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: "Courier New", ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }
        .flip-placeholder {
          width: calc(var(--card-w) * 3 + 14px);
          height: var(--card-h);
        }
        .flip-card {
          position: relative;
          width: var(--card-w);
          height: var(--card-h);
          perspective: 240px;
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
        }
        .flip-half {
          position: absolute;
          left: 0;
          width: 100%;
          height: 50%;
          overflow: hidden;
          color: #fff;
          backface-visibility: hidden;
        }
        .flip-half span {
          position: absolute;
          left: 0;
          width: 100%;
          height: var(--card-h);
          line-height: var(--card-h);
          text-align: center;
          font-size: calc(var(--card-h) * 0.58);
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .flip-top {
          top: 0;
          border-radius: 4px 4px 0 0;
          transform-origin: bottom center;
          background: linear-gradient(180deg, #000 0%, #1f1f1f 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .flip-top span { top: 0; }
        .flip-bottom {
          bottom: 0;
          border-radius: 0 0 4px 4px;
          transform-origin: top center;
          background: linear-gradient(180deg, #000 0%, #262626 100%);
        }
        .flip-bottom span { bottom: 0; }

        .flip-flap {
          z-index: 3;
          animation: flipDown 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        .flip-flap-back {
          z-index: 2;
          transform: rotateX(90deg);
          animation: flipUp 0.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        @keyframes flipDown {
          0%   { transform: rotateX(0deg);   filter: brightness(1); }
          50%  { transform: rotateX(-90deg); filter: brightness(0.5); }
          100% { transform: rotateX(-90deg); filter: brightness(0.5); }
        }
        @keyframes flipUp {
          0%   { transform: rotateX(90deg); }
          50%  { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }

        .flip-hinge {
          position: absolute;
          z-index: 5;
          left: 0;
          top: calc(50% - 0.5px);
          width: 100%;
          height: 1px;
          background: #000;
          box-shadow: 0 1px 0 rgba(255,255,255,0.1);
        }
        .flip-dots {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .flip-dots i {
          display: block;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #171717;
        }

        @media (min-width: 640px) {
          .flip-clock { --card-w: 34px; --card-h: 46px; gap: 5px; }
          .flip-dots { gap: 6px; }
          .flip-dots i { width: 3px; height: 3px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flip-flap, .flip-flap-back { animation-duration: 0.01s; }
        }
      `}</style>

      {/* Label sits above the clock on mobile, beside it on sm+ */}
      <div
        className={`flex origin-right flex-col items-center gap-1 transition-all duration-500 sm:flex-row sm:gap-3 ${
          timeLeft ? "opacity-100" : "opacity-0"
        } ${compact ? "scale-90" : "scale-100"}`}
      >
        <p
          aria-hidden="true"
          className="whitespace-nowrap text-[9px] font-bold uppercase leading-none tracking-[0.08em] text-neutral-950/70 sm:text-right sm:text-[11px] sm:leading-[1.15]"
        >
          Deal
          <span className="hidden sm:block">ends in</span>
          <span className="sm:hidden"> ends in</span>
        </p>

        <div
          role="timer"
          aria-label={
            timeLeft
              ? `Deal ends in ${timeLeft.hours} hours ${timeLeft.minutes} minutes ${timeLeft.seconds} seconds`
              : "Deal countdown"
          }
          className="flip-clock"
        >
          {timeLeft ? (
            units.map((value, i) => (
              <div key={i} className="flex items-center gap-[3px] sm:gap-[5px]">
                <FlipCard value={value} />
                {i < units.length - 1 && (
                  <div className="flip-dots" aria-hidden="true">
                    <i />
                    <i />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flip-placeholder" />
          )}
        </div>
      </div>
    </>
  );
}

function ProductCardWithSale({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  const hidden = HIDDEN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (hidden) return null;

  return <FlipClock compact={compact} />;
}

export { ProductCardWithSale };