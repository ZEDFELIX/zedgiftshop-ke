"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

type DeferredPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed or already dismissed
    const dismissed = localStorage.getItem("zed_install_dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as DeferredPrompt);
      // Show after a short delay so it doesn't feel aggressive
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const appInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };
    window.addEventListener("appinstalled", appInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
    if (outcome === "accepted") {
      localStorage.setItem("zed_install_dismissed", "true");
    } else {
      localStorage.setItem("zed_install_dismissed", "true");
    }
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem("zed_install_dismissed", "true");
  }

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[85] max-w-sm animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="glass-strong overflow-hidden rounded-2xl border border-white/50 shadow-glass-lg">
        <div className="flex items-start gap-3 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-zed-950 text-white">
            <Gift className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold text-black">Get the ZED app</p>
            <p className="mt-0.5 text-xs text-black/65">Install ZED Gift Shop for a faster, app-like gifting experience.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-zed bg-zed-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-zed-900"
              >
                Install
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-zed border border-white/50 px-4 py-2 text-xs font-semibold text-black/70 transition-colors hover:bg-white/50"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
