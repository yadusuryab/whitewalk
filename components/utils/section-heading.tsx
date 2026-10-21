import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SHeadingProps {
  title?: string;
  description?: string;
  linkHref?: string;
  nolink?: boolean;
  buttonText?: string;
  badge?: string;
  centered?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "text-4xl md:text-6xl",
  md: "text-5xl md:text-7xl",
  lg: "text-6xl md:text-8xl",
};

const SHeading = ({
  title = "Get Top Deals on the Newest Products",
  description = "",
  linkHref = "/products",
  nolink = false,
  buttonText = "View All",
  badge,
  centered = false,
  size = "md",
}: SHeadingProps) => {
  return (
    <div
      className={`w-full border-b-2 border-foreground pb-5 md:pb-8 ${
        centered ? "text-center" : "text-left"
      }`}
    >
      {badge && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground/50">
          {badge}
        </p>
      )}

      <h2
        className={`${sizeStyles[size]} font-black uppercase leading-[0.9] tracking-tighter text-foreground`}
      >
        {title}
      </h2>

      {(description || !nolink) && (
        <div
          className={`mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${
            centered ? "items-center md:flex-col md:items-center" : ""
          }`}
        >
          {description && (
            <p className="max-w-md text-sm leading-relaxed text-foreground/60 md:text-base">
              {description}
            </p>
          )}

          {!nolink && (
            <Link
              href={linkHref}
              className="group inline-flex items-center gap-1 text-sm font-bold uppercase tracking-[0.2em] text-foreground underline-offset-8 hover:underline"
            >
              {buttonText}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export const InlineHeading = ({
  title,
  description,
  linkHref,
  buttonText = "View All",
}: Pick<SHeadingProps, "title" | "description" | "linkHref" | "buttonText">) => {
  return (
    <div className="mb-6 flex items-end justify-between border-b-2 border-foreground pb-3">
      <div className="flex-1">
        <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-foreground md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-foreground/60">{description}</p>
        )}
      </div>

      {linkHref && (
        <Link
          href={linkHref}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] underline-offset-8 hover:underline"
        >
          {buttonText}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

export default SHeading;