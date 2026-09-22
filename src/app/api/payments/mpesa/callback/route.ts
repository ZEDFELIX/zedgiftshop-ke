import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmOrderPaid, updateOrderStatus, releaseInventoryForOrder } from "@/lib/data/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { webhookSecretMatches } from "@/lib/mpesa";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";

function ack() {
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
}

type CallbackItem = { Name: string; Value?: string | number };
type DarajaCallback = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number | string;
      ResultDesc?: string;
      CallbackMetadata?: { Item?: CallbackItem[] };
    };
  };
};

export async function POST(req: Request) {
  // Optional webhook secret verification (Daraja app security header "Authorization").
  const authHeader = req.headers.get("authorization");
  if (!webhookSecretMatches(authHeader)) {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Unauthorized" }, { status: 401 });
  }

  let raw: DarajaCallback;
  try {
    raw = (await req.json()) as DarajaCallback;
  } catch {
    return ack(); // Malformed body — ack so Daraja doesn't retry forever.
  }

  const cb = raw.Body?.stkCallback;
  if (!cb?.CheckoutRequestID) return ack();

  // Store raw payload for audit regardless of outcome.
  const payment = await prisma.payment.findFirst({ where: { checkoutRequestId: cb.CheckoutRequestID } });
  if (!payment) return ack();

  await prisma.payment.update({
    where: { id: payment.id },
    data: { rawCallbackJson: JSON.stringify(raw) },
  });

  // Already final — ignore duplicate callbacks.
  if (payment.status === "SUCCESS" || payment.status === "FAILED" || payment.status === "CANCELLED") {
    return ack();
  }

  const resultCode = Number(cb.ResultCode);
  const metadata = Object.fromEntries(
    (cb.CallbackMetadata?.Item ?? []).map((i: CallbackItem) => [i.Name, i.Value]),
  ) as Record<string, string | number | undefined>;

  if (resultCode === 0) {
    const receipt = String(metadata.MpesaReceiptNumber ?? metadata.MpesaReceiptNumber ?? "");
    const amountPaid = Number(metadata.Amount ?? payment.amount);

    if (receipt && amountPaid < payment.amount) {
      // Partial payment — mark failed; authoritatively confirm only full amounts.
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", resultCode, resultDescription: "Amount mismatch" },
      });
      await releaseInventoryForOrder(payment.orderId);
      await updateOrderStatus(payment.orderId, "CANCELLED");
      return ack();
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        mpesaReceipt: receipt,
        resultCode,
        resultDescription: cb.ResultDesc ?? "The service request is processed successfully.",
        transactionDate: metadata.TransactionDate ? new Date(Number(metadata.TransactionDate) * 1000) : new Date(),
      },
    });

    await confirmOrderPaid(payment.orderId, payment.id, receipt);

    const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true, user: true } });
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
        statusUrl: `${SITE.url}/track/${order.orderNumber}`,
      });
    }
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        resultCode,
        resultDescription: cb.ResultDesc ?? `M-PESA error ${resultCode}`,
      },
    });
    // Release the reserved stock so the items return to the shelf.
    await releaseInventoryForOrder(payment.orderId);
    await updateOrderStatus(payment.orderId, "CANCELLED");
  }

  return ack();
}