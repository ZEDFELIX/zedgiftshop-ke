"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Gift, Heart, LogIn, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { GIFT_ROUTES } from "@/lib/constants";
import { SearchPanel } from "@/components/search/SearchPanel";

function openCart() {
  window.dispatchEvent(new CustomEvent("zed:open-cart"));
}

export function HeaderContent({
  cartCount,
  wishlistCount,
  announcement,
  isAuthed,
  userRole,
}: {
  cartCount: number;
  wishlistCount: number;
  announcement: string;
  isAuthed: boolean;
  userRole: "CUSTOMER" | "STAFF" | "ADMIN" | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const giftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setGiftsOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setGiftsOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!giftsOpen) return;
    function onClick(e: MouseEvent) {
      if (giftRef.current && !giftRef.current.contains(e.target as Node)) setGiftsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [giftsOpen]);

  const accountHref = isAuthed ? "/account" : "/login";
  const coreNav = [
    { label: "Home", href: "/", show: "(min-width:1024px)" },
    { label: "Shop", href: "/shop", show: "(min-width:1024px)" },
    { label: "Categories", href: "/collections", show: "(min-width:1024px)" },
    { label: "New Arrivals", href: "/shop?sort=new", show: "(min-width:1280px)" },
    { label: "Offers", href: "/deals", show: "(min-width:1024px)" },
    { label: "About", href: "/about", show: "(min-width:1280px)" },
    { label: "Contact", href: "/contact", show: "(min-width:1280px)" },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-30 border-b border-champagne/20 bg-obsidian text-white backdrop-blur-xl">
        <div className="container-zed flex h-9 items-center justify-center overflow-hidden">
          <p className="truncate text-[11px] font-medium tracking-[0.12em]">{announcement}</p>
        </div>
      </div>

      {/* Floating glass nav */}
      <div className="sticky top-0 z-40 px-2 py-2 sm:px-3">
        <header className={`glass-nav flex h-14 items-center justify-between gap-4 rounded-[1.25rem] px-3 transition-all duration-500 sm:px-4 lg:h-16 lg:px-5 ${scrolled ? "shadow-glass-lg -translate-y-0.5" : ""}`}>
          {/* Brand */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-full text-ink hover:bg-charcoal/5 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/" className="flex items-baseline gap-1.5 px-1" aria-label="ZED GIFT SHOP home">
              <span className="font-display text-lg font-black tracking-[0.11em] text-deep-olive sm:text-xl">
                ZED
              </span>
              <span className="hidden text-[9px] font-bold tracking-[0.34em] text-champagne sm:inline">
                GIFT SHOP
              </span>
              <span className="inline-block size-2 rounded-full bg-champagne shadow-[0_0_12px_rgba(201,168,106,0.65)] sm:hidden" />
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Primary">
            {coreNav
              .filter((n) => {
                if (n.show === "(min-width:1280px)") return false;
                if (n.show === "(min-width:1024px)") return true;
                return true;
              })
              .map((n) => (
                <NavLink key={n.href} href={n.href} label={n.label} active={pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href.split("?")[0]))} />
              ))}
            <span className="hidden xl:contents">
              {coreNav
                .filter((n) => n.show === "(min-width:1280px)")
                .map((n) => (
                  <NavLink key={n.href} href={n.href} label={n.label} active={pathname.startsWith(n.href)} />
                ))}
            </span>
            {/* Gifts dropdown */}
            <div className="relative" ref={giftRef}>
              <NavLink
                href="/gifts"
                label="Gifts"
                active={pathname.startsWith("/gifts")}
                onMouseEnter={() => setGiftsOpen(true)}
              />
              {giftsOpen && (
                <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-3" onMouseLeave={() => setGiftsOpen(false)}>
                  <div className="glass-strong overflow-hidden rounded-2xl p-2 shadow-glass-lg">
                    {GIFT_ROUTES.map((g) => (
                      <Link
                        key={g.slug}
                        href={g.href}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-white/70"
                      >
                        <Gift className="size-4 text-soft-sage" />
                        {g.label}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-white/50" />
                    <Link href="/personalized" className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-white/70">Personalize a gift</Link>
                    <Link href="/gift-builder" className="block rounded-xl px-3 py-2 text-sm text-ink hover:bg-white/70">Build a gift box</Link>
                    <Link
                      href="/gifts"
                      className="mt-1 block rounded-xl bg-obsidian px-3 py-2.5 text-center text-sm font-semibold text-champagne"
                    >
                      Browse all gifts
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="grid size-9 place-items-center rounded-full text-ink hover:bg-charcoal/5"
            >
              <Search className="size-5" />
            </button>
            <Link
              href={accountHref}
              aria-label={isAuthed ? "My account" : "Sign in"}
              className="grid size-9 place-items-center rounded-full text-ink hover:bg-charcoal/5"
            >
              {isAuthed ? <User className="size-5" /> : <LogIn className="size-5" />}
            </Link>
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount})`}
              className="relative grid size-9 place-items-center rounded-full text-ink hover:bg-charcoal/5"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-champagne px-1 text-[10px] font-bold text-charcoal">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label={`Open cart (${cartCount} items)`}
              onClick={openCart}
              className="relative grid size-9 place-items-center rounded-full bg-deep-olive text-champagne shadow-glass transition-transform hover:scale-105 hover:bg-charcoal"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-champagne px-1 text-[10px] font-bold text-charcoal">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile glass nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <div className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="glass-strong absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col shadow-glass-lg animate-[menu-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center justify-between border-b border-white/50 px-4 py-4">
              <span className="font-display text-base font-black tracking-[0.08em] text-charcoal">
                ZED <span className="text-soft-sage">GIFT SHOP</span>
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="grid size-9 place-items-center rounded-full hover:bg-charcoal/5"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
              {[
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: "Categories", href: "/collections" },
                { label: "New Arrivals", href: "/shop?sort=new" },
                { label: "Offers", href: "/deals" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-[15px] font-medium text-ink hover:bg-white/70 hover:text-charcoal">
                  {l.label}
                </Link>
              ))}
              <p className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft-sage">
                Gifts by occasion
              </p>
              <div className="mt-1 grid grid-cols-2 gap-1 px-1 pb-4">
                {GIFT_ROUTES.map((g) => (
                  <Link key={g.slug} href={g.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-2 py-2.5 text-sm text-ink hover:bg-white/70 hover:text-charcoal">
                    {g.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="border-t border-white/50 p-3">
              {isAuthed && (userRole === "ADMIN" || userRole === "STAFF") && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="mb-2 block rounded-xl bg-obsidian px-4 py-3 text-center text-sm font-semibold text-champagne">
                  Admin dashboard
                </Link>
              )}
              <Link href={accountHref} onClick={() => setMobileOpen(false)} className="block rounded-xl bg-deep-olive px-4 py-3 text-center text-sm font-semibold text-champagne shadow-raised">
                {isAuthed ? "My account" : "Sign in / Create account"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  label,
  active,
  onMouseEnter,
}: {
  href: string;
  label: string;
  active: boolean;
  onMouseEnter?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
        active ? "bg-obsidian/5 text-charcoal" : "text-ink/80 hover:bg-charcoal/5 hover:text-ink"
      }`}
    >
      {label}
      {href === "/gifts" && (
        <ChevronDown className="size-3.5 text-ink/50" aria-hidden />
      )}
    </Link>
  );
}