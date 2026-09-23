import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { GIFT_ROUTES, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-obsidian/85 text-white backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_15%_0%,rgba(63,74,60,0.55),transparent_60%),radial-gradient(60%_100%_at_100%_20%,rgba(199,181,138,0.12),transparent_55%)]" aria-hidden />
      <div className="container-zed grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-black tracking-[0.08em]">
            ZED <span className="text-champagne">GIFT SHOP</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Thoughtfully chosen gifts, personalized for the people who matter. Same-day delivery in Nairobi,
            countrywide everywhere else.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-champagne" />
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-champagne" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-champagne" />
              Nairobi, Kenya
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <a href={SITE.whatsappHref} aria-label="WhatsApp" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-champagne hover:text-champagne">
              <MessageCircle className="size-4" />
            </a>
            <a href={`mailto:${SITE.email}`} aria-label="Email" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-champagne hover:text-champagne">
              <Mail className="size-4" />
            </a>
            <a href={SITE.phoneHref} aria-label="Call us" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-champagne hover:text-champagne">
              <Phone className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-champagne">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/shop" className="text-white/80 hover:text-champagne">All products</Link></li>
            <li><Link href="/collections" className="text-white/80 hover:text-champagne">Categories & collections</Link></li>
            <li><Link href="/personalized" className="text-white/80 hover:text-champagne">Personalized gifts</Link></li>
            <li><Link href="/gift-builder" className="text-white/80 hover:text-champagne">Gift Builder</Link></li>
            <li><Link href="/deals" className="text-white/80 hover:text-champagne">Special offers</Link></li>
            <li><Link href="/wishlist" className="text-white/80 hover:text-champagne">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-champagne">Gifts by occasion</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {GIFT_ROUTES.map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="text-white/80 hover:text-champagne">
                  {g.label}
                </Link>
              </li>
            ))}
            <li><Link href="/gifts" className="text-white/80 hover:text-champagne">Browse all gifts</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-champagne">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-white/80 hover:text-champagne">About us</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-champagne">Contact us</Link></li>
            <li><Link href="/faq" className="text-white/80 hover:text-champagne">FAQs</Link></li>
            <li><Link href="/track" className="text-white/80 hover:text-champagne">Track your order</Link></li>
            <li><Link href="/policies/delivery" className="text-white/80 hover:text-champagne">Delivery information</Link></li>
            <li><Link href="/policies/delivery#returns" className="text-white/80 hover:text-champagne">Returns</Link></li>
            <li><Link href="/policies/privacy" className="text-white/80 hover:text-champagne">Privacy policy</Link></li>
            <li><Link href="/policies/terms" className="text-white/80 hover:text-champagne">Terms of service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-zed flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Prices in KES · Payments via M-PESA · Made with <span className="text-champagne">♥</span> in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}