import { NextResponse } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import { checkoutSchema } from "@/lib/validations";
import { createOrderFromCart, createPaymentForOrder } from "@/lib/checkout";
import { stkPush, mpesaConfigured } from "@/lib/mpesa";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  }

  const result = await createOrderFromCart(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const { order, totals } = result;

  let payment: Awaited<ReturnType<typeof createPaymentForOrder>>; 
  if (mpesaConfigured()) {
    payment = await createPaymentForOrder({
      orderId: order.orderId,
      amount: totals.total,
      phone: parsed.data.phone,
    });

    const push = await stkPush({
      phone: parsed.data.phone,
      amount: totals.total,
      accountReference: order.orderNumber,
      transactionDesc: "ZED Gift Shop",
    });

    if (push.ok && push.checkoutRequestId) {
      await prismaUpdate(payment.id, { checkoutRequestId: push.checkoutRequestId, merchantRequestId: push.merchantRequestId ?? null });
      return NextResponse.json({
        ok: true,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: totals.total,
        payment: { status: "PENDING", checkoutRequestId: push.checkoutRequestId, merchantRequestId: push.merchantRequestId ?? null, configured: true },
      });
    }

    await prismaUpdate(payment.id, { status: "FAILED", resultDescription: push.error ?? null });
    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      total: totals.total,
      payment: { status: "FAILED", error: push.error ?? "M-PESA rejected the request.", configured: true },
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "M-PESA is not configured on this store yet. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE and MPESA_CALLBACK_URL in .env to accept payments, then place the order again. Your order has been saved.",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
    },
    { status: 501 },
  );
}

async function prismaUpdate(paymentId: string, data: { checkoutRequestId?: string | null; merchantRequestId?: string | null; status?: PaymentStatus; resultDescription?: string | null }) {
  await prisma.payment.update({ where: { id: paymentId }, data });
}