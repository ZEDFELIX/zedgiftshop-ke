import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/data/orders";
import { formatKES } from "@/lib/utils";
import { ORDER_STATUS_STEPS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { ArrowLeft, MapPin } from "lucide-react";

export const metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = (await getCurrentUser())!;
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order || order.userId !== user.id) notFound();

  const steps = ORDER_STATUS_STEPS.map((s) => s.status);
  const currentIndex = steps.indexOf(order.orderStatus);
  const receipt = order.payments[0]?.mpesaReceipt;

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="flex items-center gap-1 text-sm font-semibold text-black/60 hover:text-soft-sage">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="glass-card rounded-zed p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold text-black">{order.orderNumber}</p>
            <p className="text-sm text-black/55">{order.createdAt.toLocaleDateString("en-KE", { dateStyle: "full" })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-black/50">Total</p>
            <p className="font-display text-xl font-bold text-black">{formatKES(order.total)}</p>
            <p className={`text-xs font-semibold ${order.paymentStatus === "SUCCESS" ? "text-emerald-600" : "text-amber-600"}`}>
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}{receipt ? ` Â· ${receipt}` : ""}
            </p>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className={`rounded-zed border p-3 text-xs ${i <= currentIndex ? "border-soft-sage bg-warm-white font-semibold text-black" : "border-white/50 bg-white/30 text-black/45"}`}>
              {ORDER_STATUS_STEPS[i].label}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="glass-card rounded-zed p-6">
          <h2 className="font-display text-base font-bold text-black">Items</h2>
          <ul className="mt-3 divide-y divide-white/40">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <span className="relative block size-14 shrink-0 overflow-hidden rounded-zed bg-white/30">
                  {i.image && <Image src={i.image} alt="" fill unoptimized className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-black">{i.name}</p>
                  <p className="text-xs text-black/55">Qty {i.quantity}{i.giftWrapPrice > 0 ? " Â· Gift wrap" : ""}</p>
                </div>
                <p className="font-semibold text-black">{formatKES((i.price + i.giftWrapPrice) * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-white/40 pt-4 text-sm">
            <div className="flex justify-between text-black/70"><dt>Subtotal</dt><dd>{formatKES(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-deep-olive"><dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt><dd>âˆ’{formatKES(order.discount)}</dd></div>}
            <div className="flex justify-between text-black/70"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatKES(order.deliveryFee)}</dd></div>
            <div className="flex justify-between border-t border-white/40 pt-2 text-base font-bold text-black"><dt>Total</dt><dd>{formatKES(order.total)}</dd></div>
          </dl>
        </section>

        <section className="space-y-6">
          <div className="glass-card rounded-zed p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-black">
              <MapPin className="size-4 text-soft-sage" /> Delivery to
            </h3>
            <p className="mt-2 text-sm text-black/80">{order.name}</p>
            <p className="text-sm text-black/60">
              {order.address}{order.building ? `, ${order.building}` : ""}{order.apartment ? `, ${order.apartment}` : ""}
            </p>
            <p className="text-sm text-black/60">{order.town}, {order.county}</p>
            <p className="mt-1 text-sm text-black/60">{order.phone}</p>
          </div>
          {order.isGift && (
            <div className="rounded-zed border border-soft-sage/30 bg-warm-white p-4 text-sm text-black">
              Marked as a gift â€” prices hidden from the delivery slip and wrapped on request.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}