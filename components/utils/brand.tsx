import React from "react";

const WORD = "Whitewalk";
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type BrandProps = {
  /** Controls size, e.g. "text-xl" or "text-lg" */
  className?: string;
};

export default function Brand({ className = "text-xl" }: BrandProps) {
  return (
    <span
      className={`group/brand inline-flex items-start font-black tracking-[-0.06em] text-neutral-950 transition-[font-size] duration-500 ${className}`}
    >
      <style>{`
        @keyframes brandIn {
          from { transform: translateY(105%); }
          to   { transform: translateY(0); }
        }
        .brand-enter {
          animation: brandIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .brand-enter { animation: none; }
        }
      `}</style>

      <span className="sr-only">{WORD}</span>

      {WORD.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="relative -mx-[0.03em] inline-block h-[1.12em] overflow-hidden px-[0.03em] align-top leading-[1.12]"
        >
          {/* One-time rise on load */}
          <span
            className="brand-enter block"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            {/* Roll on hover: ink letter slides out, accent letter slides in */}
            <span
              className={`flex flex-col transition-transform duration-500 ${EASE} group-hover/brand:-translate-y-1/2 motion-reduce:transition-none`}
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <span className="block h-[1.12em]">{char}</span>
              <span className="block h-[1.12em] text-[#007cfd]">{char}</span>
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}