"use client";

import { useState, useEffect } from "react";
import { Heart, Gift, Timer } from "lucide-react";

type SaleInfo = {
  start: string;
  end: string;
  discount: number;
  productId?: string;
};

export function FlashSaleCountdown({ sale }: { sale: SaleInfo }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    const start = new Date(sale.start).getTime();
    const end = new Date(sale.end).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff > 0 && now >= start) {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setActive(true);
      } else {
        setTimeLeft("Sale ended");
        setActive(false);
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [sale.start, sale.end]);

  if (!active) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 rounded-2xl bg-zed-950/95 backdrop-blur-xl p-4 shadow-lg z-50 animate-in fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-zed-400" />
          <span className="font-semibold text-zed-500">Flash Sale</span>
        </div>
        <Timer className="size-4 text-zed-400" />
      </div>
      <p className="mt-1 text-sm text-zed-400" id="countdown">{timeLeft}</p>
    </div>
  );
}