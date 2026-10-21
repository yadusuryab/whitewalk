import { Inter_Tight } from "next/font/google";
import { ArrowUpRight, Loader2 } from "lucide-react";

export const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

export const LivePill = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
    </span>
    {children}
  </div>
);

export const PillCTA = ({
  children,
  onClick,
  disabled,
  loading,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || loading}
    className={`group flex h-14 w-full items-center justify-between rounded-full bg-neutral-950 pl-6 pr-1.5 text-white transition-all duration-300 hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-neutral-950 ${className}`}
  >
    <span className="text-lg font-extrabold tracking-[-0.03em]">
      {children}
    </span>
    <span
      aria-hidden="true"
      className="ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-enabled:group-hover:rotate-45"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ArrowUpRight className="h-5 w-5" />
      )}
    </span>
  </button>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-balance text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-5xl">
    {children}
  </h2>
);