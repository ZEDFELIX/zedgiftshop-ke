import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyFlutterwaveTransaction } from "@/lib/flutterwave";
import { confirmOrderPaid } from "@/lib/data/orders";
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
    const receipt = `${txRef}-${event.data?.id ?? ""}`;
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        mpesaReceipt: receipt,
        resultDescription: `Flutterwave payment via ${event.data?.payment_type ?? "card"}`,
      },
    });

    await confirmOrderPaid(payment.orderId, payment.id, receipt);

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true },
    });
    if (order) {
      await sendOrderConfirmation({
        to: order.email,
        orderNumber: order.orderNumber,
        total: `KES ${order.total.toLocaleString("en-KE")}`,
        items: order.items.map((i) => ({
          name: i.name,
          qty: i.quantity,
          lineTotal: `KES ${(i.price * i.quantity + i.giftWrapPrice * i.quantity).toLocaleString("en-KE")}`,
        })),
        statusUrl: `${SITE.url}/track?order=${order.orderNumber}`,
      });
    }
  } else if (finalStatus === "FAILED" || finalStatus === "CANCELLED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", resultDescription: `Flutterwave: ${finalStatus}` },
    });
  }

  return NextResponse.json({ status: "ok" });
}
