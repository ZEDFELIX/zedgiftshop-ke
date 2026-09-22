"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, HelpCircle, Loader2, Lock, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { formatKES } from "@/lib/utils";

type CartView = {
  id: string;
  count: number;
  itemCount: number;
  items: {
    id: string;
    productId: string;
    slug: string;
    name: string;
    image: string | null;
    price: number;
    compareAt: number | null;
    quantity: number;
    lineTotal: number;
    giftWrapPrice: number;
    variant: { id: string; name: string; value: string } | null;
    savedForLater: boolean;
    inStock: boolean;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  couponInvalid: boolean;
};

type DeliveryOption = {
  method: "SAME_DAY" | "NEXT_DAY" | "STANDARD" | "EXPRESS" | "PICKUP";
  label: string;
  description: string;
  fee: number;
  eta: string;
  available: boolean;
  pickup?: boolean;
};

type UserPrefill = { name: string; email: string; phone: string } | null;

const methods: Record<DeliveryOption["method"], string> = {
  SAME_DAY: "Same-day",
  NEXT_DAY: "Next-day",
  STANDARD: "Standard",
  EXPRESS: "Express",
  PICKUP: "Pickup",
};

export function CheckoutForm({
  initialCart,
  counties,
  user,
  sitePhone,
}: {
  initialCart: CartView;
  counties: string[];
  user: UserPrefill;
  sitePhone: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartView>(initialCart);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    county: "",
    town: "",
    address: "",
    building: "",
    apartment: "",
    instructions: "",
    deliveryMethod: "",
    isGift: false,
  });
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [step, setStep] = useState<"form" | "review" | "processing" | "stk" | "polling" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState<{ orderId: string; orderNumber: string } | null>(null);
  const [pollSeconds, setPollSeconds] = useState(0);

  const deliveryOptions = useMemo(() => options, [options]);

  async function fetchDelivery(county: string) {
    if (!county) {
      setOptions([]);
      return;
    }
    try {
      const res = await fetch(`/api/delivery?county=${encodeURIComponent(county)}`);
      const data = (await res.json()) as { options?: DeliveryOption[] };
      setOptions(data.options ?? []);
      if (!form.deliveryMethod && data.options?.[0]) {
        setForm((f) => ({ ...f, deliveryMethod: data.options![0].method }));
      }
    } catch {
      setOptions([]);
    }
  }

  async function placeOrder() {
    setError(null);
    setStep("processing");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          county: form.county,
          town: form.town,
          address: form.address,
          building: form.building,
          apartment: form.apartment,
          instructions: form.instructions,
          deliveryMethod: form.deliveryMethod,
          isGift: form.isGift,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        orderId?: string;
        orderNumber?: string;
        payment?: { status?: string; error?: string; configured?: boolean; checkoutRequestId?: string };
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "We couldn't place your order. Please try again or contact support.");
        setStep("form");
        return;
      }

      setOrderRef({ orderId: data.orderId!, orderNumber: data.orderNumber! });

      if (data.payment?.configured === false) {
        setError("M-PESA is not configured on this store yet. Contact the shop to arrange payment.");
        setStep("done");
        return;
      }

      if (data.payment?.status === "FAILED") {
        // Order saved but STK push failed at request time.
        setStep("stk");
        setError(data.payment.error ?? null);
        return;
      }

      setStep("stk");
    } catch {
      setError("Network error while placing your order. Please try again.");
      setStep("form");
    }
  }

  useEffect(() => {
    if (step !== "polling" || !orderRef) return;
    const interval = setInterval(async () => {
      setPollSeconds((s) => s + 1);
      try {
        const res = await fetch(`/api/orders/${orderRef.orderId}/status`);
        const data = (await res.json()) as { paymentStatus?: string; mpesaReceipt?: string | null; paymentResultDescription?: string | null };
        if (data.paymentStatus === "SUCCESS") {
          clearInterval(interval);
          setStep("done");
        } else if (data.paymentStatus === "FAILED" || data.paymentStatus === "CANCELLED") {
          clearInterval(interval);
          setError(data.paymentResultDescription ?? "Payment was not completed.");
          setStep("stk");
        }
      } catch {
        // keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, orderRef]);

  function startPolling() {
    setPollSeconds(0);
    setStep("polling");
  }

  const deliveryFee = deliveryOptions.find((o) => o.method === form.deliveryMethod)?.fee ?? 0;
  const total = Math.max(0, cart.subtotal - cart.discount) + deliveryFee;
  const canSubmit =
    form.name.trim() &&
    /.+@.+\..+/.test(form.email) &&
    form.phone.trim().length >= 9 &&
    form.county &&
    form.town.trim() &&
    form.address.trim() &&
    (form.deliveryMethod === "PICKUP" || form.deliveryMethod)
      ? true
      : false;

  function toggleReview() {
    if (step === "form") setStep("review");
    else setStep("form");
  }

  const showReview = step === "review" || step === "processing" || step === "stk" || step === "polling" || step === "done";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        {/* Order summary banner (review step) */}
        {showReview && (
          <div className="glass-card rounded-zed p-5">
            <h2 className="font-display text-lg font-bold text-zed-950">Order details</h2>
            <ul className="mt-3 divide-y divide-white/40 text-sm">
              {cart.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative block size-12 shrink-0 overflow-hidden rounded-zed bg-white/30">
                    {i.image ? <Image src={i.image} alt="" fill unoptimized className="object-cover" /> : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{i.name}</p>
                    <p className="text-xs text-ink/55">
                      ×{i.quantity}
                      {i.variant ? ` · ${i.variant.value}` : ""}
                      {i.giftWrapPrice > 0 ? " · Gift box" : ""}
                    </p>
                  </div>
                  <p className="font-semibold text-zed-950">{formatKES(i.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact & delivery */}
        {step === "form" || step === "review" ? (
          <div className="glass-card rounded-zed p-5 lg:p-7">
            <h2 className="font-display text-lg font-bold text-zed-950">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="co-name">Full name</label>
                <input id="co-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Jane Mwangi" />
              </div>
              <div>
                <label className="label" htmlFor="co-phone">M-PESA phone (07XX…)</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                  <input id="co-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field pl-9" placeholder="0712 345 678" inputMode="tel" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-email">Email (for order updates)</label>
                <input id="co-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" placeholder="you@example.com" />
              </div>
              <div>
                <label className="label" htmlFor="co-county">County</label>
                <select id="co-county" value={form.county} onChange={(e) => { setForm({ ...form, county: e.target.value }); fetchDelivery(e.target.value); }} className="field">
                  <option value="">Select county</option>
                  {counties.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="co-town">Town / estate</label>
                <input id="co-town" value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} className="field" placeholder="Kilimani, Nairobi" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="co-address">Delivery address</label>
                <input id="co-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="field" placeholder="House/plot no., street, landmarks" />
              </div>
              <div>
                <label className="label" htmlFor="co-building">Building (optional)</label>
                <input id="co-building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="co-apartment">Apartment (optional)</label>
                <input id="co-apartment" value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} className="field" />
              </div>
            </div>

            {/* Delivery method */}
            {form.county && (
              <div className="mt-6">
                <p className="label">Delivery method</p>
                {deliveryOptions.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-ink/50">
                    <Loader2 className="size-4 animate-spin" /> Checking options for {form.county}…
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deliveryOptions.map((opt) => (
                      <button
                        key={opt.method}
                        type="button"
                        onClick={() => setForm({ ...form, deliveryMethod: opt.method })}
                        className={`flex w-full items-center justify-between gap-3 rounded-zed border p-3.5 text-left backdrop-blur-sm transition-colors ${form.deliveryMethod === opt.method ? "border-zed-700 bg-lime-tint" : "border-white/50 bg-white/30 hover:border-zed-700 hover:bg-white/45"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`grid size-5 place-items-center rounded-full border ${form.deliveryMethod === opt.method ? "border-zed-800 bg-zed-800" : "border-white/60"}`}>
                            {form.deliveryMethod === opt.method && <Check className="size-3 text-white" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-zed-950">{opt.label}</p>
                            <p className="text-xs text-ink/60">{opt.description}</p>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-zed-950">{opt.fee === 0 ? "Free" : formatKES(opt.fee)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gift flag */}
            <div className="mt-6 flex items-start gap-3 rounded-zed bg-lime-tint/70 p-4 backdrop-blur-sm">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-zed-700" />
              <div>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-zed-900">
                  <input type="checkbox" checked={form.isGift} onChange={(e) => setForm({ ...form, isGift: e.target.checked })} className="size-4 accent-zed-800" />
                  This is a gift
                </label>
                <p className="mt-1 text-xs text-zed-900/70">We&apos;ll wrap it beautifully and hide all pricing from the delivery slip.</p>
              </div>
            </div>

            {error && step === "form" && (
              <p className="mt-4 rounded-zed bg-red-50/70 px-4 py-3 text-sm text-red-700 backdrop-blur-sm">{error}</p>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={toggleReview}
              className="mt-6 w-full rounded-zed bg-zed-950 py-4 text-sm font-bold uppercase tracking-wider text-lime transition-colors hover:bg-zed-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === "review" ? "Back to edit details" : "Review order"}
            </button>
          </div>
        ) : null}

        {/* STK + polling states */}
        {(step === "stk" || step === "polling") && orderRef && (
          <div className="glass-card rounded-zed p-6 text-center">
            <span className="glass-strong mx-auto grid size-14 place-items-center rounded-full text-zed-800">
              {step === "polling" ? <Loader2 className="size-7 animate-spin" /> : <Phone className="size-7" />}
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-zed-950">
              {step === "stk" ? "Check your phone" : "Confirming your payment…"}
            </h2>
            {step === "stk" ? (
              <>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink/65">
                  We&apos;ve sent an <strong>M-PESA STK push</strong> to <strong>{form.phone}</strong> for{" "}
                  <strong>{formatKES(total)}</strong>. Enter your M-PESA PIN to approve.
                </p>
                <p className="mt-2 text-xs text-ink/45">Order {orderRef.orderNumber}</p>
                <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <button type="button" onClick={startPolling} className="rounded-zed bg-zed-lime px-6 py-3 text-sm font-bold text-zed-950">
                    I&apos;ve entered my PIN
                  </button>
                  <button type="button" onClick={() => router.push(`/track?order=${orderRef.orderNumber}`)} className="text-sm text-ink/60 underline-offset-2 hover:underline">
                    I&apos;ll track it later
                  </button>
                </div>
                {error && <p className="mx-auto mt-4 max-w-sm rounded-zed bg-red-50/70 px-4 py-2.5 text-sm text-red-700 backdrop-blur-sm">{error}</p>}
              </>
            ) : (
              <>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink/65">
                  Waiting for M-PESA confirmation{pollSeconds >= 5 ? ` (${pollSeconds}s…)` : "…"}. This usually takes a few seconds.
                </p>
                <p className="mt-4 text-xs text-ink/45">If nothing happens in a minute, check the M-PESA app and try again.</p>
              </>
            )}
          </div>
        )}

        {step === "done" && orderRef && (
          <div className="glass-card rounded-zed p-6 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-zed-lime text-zed-950">
              <Check className="size-7" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-zed-950">Thanks for your order!</h2>
            <p className="mt-2 text-sm text-ink/65">
              Order <strong>{orderRef.orderNumber}</strong> is confirmed and being prepared.
              {error && <span className="mt-2 block text-red-600">{error}</span>}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => router.push(`/checkout/success?order=${orderRef.orderNumber}`)} className="rounded-zed bg-zed-950 px-6 py-3 text-sm font-bold text-lime">
                View order summary
              </button>
              <button type="button" onClick={() => router.push("/shop")} className="glass-panel rounded-zed px-6 py-3 text-sm font-semibold text-ink hover:text-zed-800">
                Keep shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="glass-card rounded-zed p-5">
          <p className="font-display text-lg font-bold text-zed-950">Summary</p>
          <ul className="mt-4 max-h-64 space-y-2.5 overflow-y-auto text-sm">
            {cart.items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-ink/80">
                  {i.name.slice(0, 42)}
                  <span className="text-ink/45"> ×{i.quantity}</span>
                </span>
                <span className="shrink-0 font-medium">{formatKES(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-white/40 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <dt>Subtotal</dt>
              <dd>{formatKES(cart.subtotal)}</dd>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between font-semibold text-zed-800">
                <dt className="flex items-center gap-1">
                  Coupon {cart.couponCode} <HelpCircle className="size-3.5" />
                </dt>
                <dd>−{formatKES(cart.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-ink/70">
              <dt>Delivery {form.deliveryMethod ? `(${(methods as Record<string, string>)[form.deliveryMethod]})` : ""}</dt>
              <dd>{deliveryFee === 0 ? "Free" : formatKES(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-white/40 pt-3 text-base font-bold text-zed-950">
              <dt>Total</dt>
              <dd>{formatKES(total)}</dd>
            </div>
          </dl>
          <div className="glass-panel mt-4 rounded-zed px-3.5 py-3 text-xs text-ink/60">
            <span className="flex items-center gap-1.5 font-semibold text-zed-900">
              <Lock className="size-3.5" /> Paid via M-PESA STK Push
            </span>
            <p className="mt-1">You approve with your M-PESA PIN — no card details on the site. Refunds are processed via M-PESA.</p>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
            Need help? WhatsApp {sitePhone}. By placing this order you agree to our delivery &amp; returns policy.
          </p>
        </div>
      </aside>
    </div>
  );
}