"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Loader2, X } from "lucide-react";

type CartSummary = {
  count: number;
  subtotal: number;
};

export function MobilePurchaseBar() {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart/summary", { cache: "no-store" });
        const data = await res.json();
        setCart(data);
        if (data.count > 0) setShow(true);
      } catch (e) {
        console.log("cart fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
    const interval = setInterval(fetchCart, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!show || loading) return null;

  const itemCount = cart?.count || 0;
  const subtotal = cart?.subtotal || 0;

  if (!cart) return null;

  return (
    <div
      className="fixed bottom-[calc( env(safe-area-inset-bottom) + 56px )] left-0 right-0 z-40 border-t border-white/10 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl transition-all duration-300 shadow-lg"
    >
      <div className="max-w-[calc(100%-2rem)] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="size-4 text-deep-olive" />
          <div>
            <p className="text-xs font-medium text-deep-olive">Cart</p>
            <p className="text-[11px] font-bold text-black">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-black">KES {subtotal}</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("zed:open-checkout"))}
            className="mt-2 rounded-zed bg-zed-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-zed-900"
          >
            Checkout
          </button>
        </div>
      </div>
      <button
        onClick={() => setShow(false)}
        className="absolute right-3 top-3 text-zed-600 hover:text-black"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}