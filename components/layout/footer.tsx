"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site-config";

function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname === "/checkout") return null;

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4">
        {/* Statement */}
        <div className="border-b border-white/20 py-14 md:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
            Get in touch
          </p>
          <a
            href={`tel:${site.phone}`}
            className="mt-4 block text-[11vw] font-black uppercase leading-[0.9] tracking-tighter transition-opacity hover:opacity-60 md:text-[8vw]"
          >
            {site.phone}
          </a>
          {site.address && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
              {site.address}
            </p>
          )}
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-x-10 gap-y-2 border-b border-white/20 py-8 text-3xl font-black uppercase tracking-tighter md:text-5xl">
          <Link
            href="/privacy-policy"
            className="transition-opacity hover:opacity-50"
          >
            Privacy
          </Link>
          <Link href="/T&C" className="transition-opacity hover:opacity-50">
            Terms
          </Link>
        </nav>

        {/* Giant wordmark */}
        <div className="overflow-hidden py-6 md:py-10">
          <h2 className="select-none text-[15vw] font-black uppercase leading-[0.8] tracking-tighter md:text-[19vw]">
            {site.name}
          </h2>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-1 border-t border-white/20 py-5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/50 md:flex-row md:justify-between">
          <span>© {currentYear} {site.name}</span>
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };