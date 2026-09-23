import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { confirmOrderPaid, updateOrderStatus, releaseInventoryForOrder } from "@/lib/data/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { webhookSecretMatches } from "@/lib/mpesa";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Flutterwave webhook verification
  const signature = req.headers.get("flutterwave-signature");
  if (signature) {
    // Verify the webhook signature using the encryption key
    const payload = JSON.stringify(body);
    const crypto = await import("crypto");
    const expected = crypto.createHmac("sha256", process.env.FLUTTERWAVE_ENCRYPTION_KEY ?? "")
      .update(payload)
      .digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ status: "error", message: "Invalid signature." }, { status: 401 });
    }
  }

  const event = body as {
    id?: number;
    tx_ref?: string;
    event?: string;
    data?: {
      id: number;
      tx_ref: string;
      status: string;
      amount: number;
      currency: string;
      payment_type: string;
      channel: string;
      meta?: {
        orderId?: string;
        orderNumber?: string;
      };
    };
  };

  if (event.event !== "charge.completed" && event.event !== "charge.success") {
    return NextResponse.json({ status: "ignored" });
  }

  const txRef = event.data?.tx_ref;
  if (!txRef) {
    return NextResponse.json({ status: "ignored" });
  }

  const payment = await prisma.payment.findFirst({
    where: { txRef },
    include: { order: true },
  });

  if (!payment) {
    return NextResponse.json({ status: "ignored" });
  }

  if (payment.status === "SUCCESS" || payment.status === "FAILED") {
    return NextResponse.json({ status: "already_processed" });
  }

  // Verify with Flutterwave
  const verify = await verifyFlutterwaveTransaction(txRef);
  const finalStatus = verify.ok ? verify.status : (event.data?.status?.toUpperCase() ?? "PENDING");

  if (finalStatus === "SUCCESS") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        mpesaReceipt: `${txRef}-${event.data?.id ?? ""}`,
        resultDescription: `Flutterwave payment via ${event.data?.payment_type ?? "card"}`,
      },
    });

    await confirmOrderPaid(payment.orderId);
    await sendOrderConfirmation({
      to: payment.order.email,
      orderNumber: payment.order.orderNumber,
      total: payment.order.total.toString(),
      items: payment.order.orderItems.map((i) => ({ name: i.name, qty: i.quantity, lineTotal: i.price * i.quantity })),
      statusUrl: `${SITE.url}/track?order=${payment.order.orderNumber}`,
    });
  } else if (finalStatus === "FAILED" || finalStatus === "CANCELLED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", resultDescription: `Flutterwave: ${finalStatus}` },
    });
  }

  return NextResponse.json({ status: "ok" });
}
