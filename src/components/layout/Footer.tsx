import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { GIFT_ROUTES, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-obsidian/85 text-white backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_15%_0%,rgba(63,74,60,0.55),transparent_60%),radial-gradient(60%_100%_at_100%_20%,rgba(201,165,106,0.14),transparent_55%)]" aria-hidden />
      <div className="container-zed grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-black tracking-[0.08em]">
            ZED <span className="text-white">GIFT SHOP</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Thoughtfully chosen gifts, personalized for the people who matter. Same-day delivery in Nairobi,
            countrywide everywhere else.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-white" />
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-white" />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-white" />
              Nairobi, Kenya
            </p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <a href={SITE.whatsappHref} aria-label="WhatsApp" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-zed-900 hover:text-white">
              <MessageCircle className="size-4" />
            </a>
            <a href={`mailto:${SITE.email}`} aria-label="Email" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-zed-900 hover:text-white">
              <Mail className="size-4" />
            </a>
            <a href={SITE.phoneHref} aria-label="Call us" className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-zed-900 hover:text-white">
              <Phone className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow text-white">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/shop" className="text-white/80 hover:text-white">All products</Link></li>
            <li><Link href="/collections" className="text-white/80 hover:text-white">Categories & collections</Link></li>
            <li><Link href="/personalized" className="text-white/80 hover:text-white">Personalized gifts</Link></li>
            <li><Link href="/gift-builder" className="text-white/80 hover:text-white">Gift Builder</Link></li>
            <li><Link href="/deals" className="text-white/80 hover:text-white">Special offers</Link></li>
            <li><Link href="/wishlist" className="text-white/80 hover:text-white">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-white">Gifts by occasion</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {GIFT_ROUTES.map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="text-white/80 hover:text-white">
                  {g.label}
                </Link>
              </li>
            ))}
            <li><Link href="/gifts" className="text-white/80 hover:text-white">Browse all gifts</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-white">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="text-white/80 hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white">Contact us</Link></li>
            <li><Link href="/faq" className="text-white/80 hover:text-white">FAQs</Link></li>
            <li><Link href="/track" className="text-white/80 hover:text-white">Track your order</Link></li>
            <li><Link href="/policies/delivery" className="text-white/80 hover:text-white">Delivery information</Link></li>
            <li><Link href="/policies/delivery#returns" className="text-white/80 hover:text-white">Returns</Link></li>
            <li><Link href="/policies/privacy" className="text-white/80 hover:text-white">Privacy policy</Link></li>
            <li><Link href="/policies/terms" className="text-white/80 hover:text-white">Terms of service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-zed flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>Ã‚Â© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>
            Prices in KES Ã‚Â· Payments via M-PESA Ã‚Â· Made with <span className="text-white">Ã¢â„¢Â¥</span> in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}