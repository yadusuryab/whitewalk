"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconBrandInstagram, IconMenu, IconX } from "@tabler/icons-react";
import { site } from "@/lib/site-config";
import { ProductCardWithSale } from "../sections/sale-is-live";
import Brand from "../utils/brand";

const MARQUEE_ITEMS = [
  "All India delivery",
  "Best quality items",
  "COD Extra charges apply",
  "10K+ happy customers",
];

const MENU_LINKS = [
  {
    label: "Track order",
    note: "Find where your parcel is",
    href: "/order/track",
  },
  {
    label: "Terms & conditions",
    note: "How we work with you",
    href: "/T&C",
  },
  {
    label: "Privacy policy",
    note: "How we handle your data",
    href: "/privacy-policy",
  },
];

const SCROLL_HIDE_THRESHOLD = 40;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset hover state when menu closes
  useEffect(() => {
    if (!menuOpen) setActive(null);
  }, [menuOpen]);

  // Collapse marquee on scroll
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setCompact(window.scrollY > SCROLL_HIDE_THRESHOLD);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Marquee */}
      <div
        className={`fixed top-0 z-50 flex h-7 w-full items-center overflow-hidden bg-neutral-950 text-white transition-all duration-500 ${EASE} ${
          compact ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex animate-marquee whitespace-nowrap motion-reduce:animate-none">
          {[0, 1].map((g) => (
            <div key={g} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((item, i) => (
                <span
                  key={`${g}-${i}`}
                  className="flex items-center text-[11px] font-medium tracking-tight"
                >
                  <span className="mx-4">{item}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header bar — sits above the menu overlay while it is open */}
      <header
        className={`fixed w-full transition-all duration-500 ${EASE} ${
          menuOpen ? "z-[60]" : "z-40"
        } ${compact || menuOpen ? "top-0" : "top-7"} ${
          compact
            ? "bg-white saturate-200 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="relative mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
          {/* Left: menu toggle + logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((p) => !p)}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-950 transition-colors duration-300 hover:bg-black/5"
            >
              <IconMenu
                className={`absolute h-5 w-5 transition-all duration-500 ${EASE} ${
                  menuOpen
                    ? "rotate-90 scale-50 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <IconX
                className={`absolute h-5 w-5 transition-all duration-500 ${EASE} ${
                  menuOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-50 opacity-0"
                }`}
              />
            </button>

            <Link
              href="/"
              aria-label="Whitewalk home"
              onClick={() => setMenuOpen(false)}
            >
             <Brand/>
            </Link>
          </div>

          {/* Right: flip clock */}
          <div
            className={`flex items-center justify-end transition-opacity duration-300 ${
              menuOpen ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <ProductCardWithSale compact={compact} />
          </div>
        </div>
      </header>

      {/* Full-page menu */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[55] bg-white transition-all duration-700 ${EASE} ${
          menuOpen
            ? "pointer-events-auto visible opacity-100 [clip-path:inset(0_0_0_0)]"
            : "pointer-events-none invisible opacity-0 [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-8 pt-28 sm:px-6 sm:pb-10">
          <nav
            onMouseLeave={() => setActive(null)}
            className="border-b border-neutral-950/10"
          >
            {MENU_LINKS.map((link, i) => {
              const dimmed = active !== null && active !== i;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  tabIndex={menuOpen ? 0 : -1}
                  className={`group/link flex items-end justify-between gap-6 border-t border-neutral-950/10 py-3 transition-colors duration-300 sm:py-4 ${
                    dimmed ? "text-neutral-300" : "text-neutral-950"
                  }`}
                >
                  {/* hover shift */}
                  <span
                    className={`block transition-transform duration-500 ${EASE} group-hover/link:translate-x-3 group-focus-visible/link:translate-x-3`}
                  >
                    {/* mask for the rise-in reveal */}
                    <span className="block overflow-hidden pb-[0.08em]">
                      <span
                        style={{
                          transitionDelay: menuOpen ? `${i * 90 + 200}ms` : "0ms",
                        }}
                        className={`block text-[length:clamp(2.75rem,12vw,8.5rem)] font-black leading-[0.9] tracking-[-0.055em] transition-transform duration-[900ms] ${EASE} ${
                          menuOpen ? "translate-y-0" : "translate-y-[110%]"
                        }`}
                      >
                        {link.label}
                      </span>
                    </span>
                  </span>

                  <span className="hidden shrink-0 pb-2 text-sm opacity-60 sm:block">
                    {link.note}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              transitionDelay: menuOpen
                ? `${MENU_LINKS.length * 90 + 350}ms`
                : "0ms",
            }}
            className={`mt-6 flex items-center justify-between text-sm text-neutral-500 transition-all duration-700 ${EASE} ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <Link
              href={`https://instagram.com/${site.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              tabIndex={menuOpen ? 0 : -1}
              className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-[#007cfd]"
            >
              <IconBrandInstagram className="h-5 w-5" />
              <span>@{site.instagram}</span>
            </Link>

            <span>Delivering across India</span>
          </div>
        </div>
      </div>

      {/* Spacer: marquee (28px) + header bar (80px) */}
      <div className="h-28" />
    </>
  );
};

export default Header;