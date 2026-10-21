"use client";

import Image from "next/image";
import { Flame, Gift } from "lucide-react";

export function FreeSocksPromo() {
  const stars = Array.from({ length: 18 });

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#D4AF37] bg-gradient-to-t from-red-500 via-red-600 to-orange-500 shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-[1.02]">
      {/* glow blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-yellow-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-300/30 blur-3xl" />

      {/* rising sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {stars.map((_, i) => (
          <span
            key={i}
            className="absolute bottom-[-8px] h-1 w-1 animate-star-rise rounded-full bg-yellow-100 opacity-70 shadow-[0_0_6px_rgba(255,220,120,0.9)]"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i * 0.45) % 5}s`,
              animationDuration: `${4 + ((i * 1.3) % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center gap-3 px-2 pt-2 pb-9">
        <div className="relative shrink-0">
          <Image
            src="/promo/2.jpeg"
            alt="Flame socks"
            width={100}
            height={100}
            className="size-24 rounded-xl border-2 border-[#D4AF37] object-cover shadow-[0_0_14px_rgba(212,175,55,0.5)]"
          />
          <span className="absolute -top-2 -left-2 flex size-7 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg">
            <Flame className="size-4 text-red-700" fill="currentColor" />
          </span>
        </div>

        <div className="flex-1 pr-2 text-white">
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-yellow-300 backdrop-blur-sm">
            <Gift className="size-3" /> Free Gift
          </span>
          <p className="text-lg font-black leading-tight tracking-tight drop-shadow">
            FREE <span className="text-yellow-300">FLAME SOCKS</span>
             &nbsp;ON <br /> EVERY ORDER
          </p>
        </div>
      </div>

      {/* bottom strip */}
      <div className="absolute inset-x-0 bottom-0 bg-black/20 backdrop-blur-sm py-1.5 text-center text-sm font-semibold uppercase text-white">
        Exclusive Offer
      </div>
    </div>
  );
}