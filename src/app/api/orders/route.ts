import "server-only";
import { NextResponse } from "next/server";
import type { PaymentStatus } from "@prisma/client";
import { checkoutSchema } from "@/lib/validations";
import { createOrderFromCart, createPaymentForOrder } from "@/lib/checkout";
import { stkPush, mpesaConfigured } from "@/lib/mpesa";
import { initiateFlutterwaveCharge, flutterwaveConfigured } from "@/lib/flutterwave";
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
  const paymentMethod = parsed.data.paymentMethod ?? "M_PESA";
  const phone = parsed.data.phone;

  // Create a payment record
  let payment: Awaited<ReturnType<typeof createPaymentForOrder>>;

  try {
    payment = await createPaymentForOrder({
      orderId: order.orderId,
      amount: totals.total,
      phone,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment record." }, { status: 500 });
  }

  // Handle M-PESA STK Push
  if (paymentMethod === "M_PESA") {
    if (!mpesaConfigured()) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", resultDescription: "M-PESA is not configured on this store." },
      });
      return NextResponse.json(
        { ok: false, error: "M-PESA is not configured on this store yet. Please contact the shop to arrange payment.", orderId: order.orderId, orderNumber: order.orderNumber, configured: false },
        { status: 501 }
      );
    }

    const push = await stkPush({
      phone,
      amount: totals.total,
      accountReference: order.orderNumber,
      transactionDesc: "ZED Gift Shop",
    });

    if (push.ok && push.checkoutRequestId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { checkoutRequestId: push.checkoutRequestId, merchantRequestId: push.merchantRequestId ?? null },
      });
      return NextResponse.json({
        ok: true,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: totals.total,
        payment: { status: "PENDING", checkoutRequestId: push.checkoutRequestId, merchantRequestId: push.merchantRequestId ?? null, configured: true, method: "M_PESA" },
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", resultDescription: push.error ?? null },
    });
    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      orderNumber: order.orderNumber,
      total: totals.total,
      payment: { status: "FAILED", error: push.error ?? "M-PESA rejected the request.", configured: true, method: "M_PESA" },
    });
  }

  // Handle Flutterwave / Card payments
  if (paymentMethod === "FLUTTERWAVE" || paymentMethod === "CARD") {
    if (!flutterwaveConfigured()) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", resultDescription: "Flutterwave is not configured on this store." },
      });
      return NextResponse.json(
        { ok: false, error: "Flutterwave is not configured on this store yet. Please contact the shop to arrange payment.", orderId: order.orderId, orderNumber: order.orderNumber, configured: false, method: "FLUTTERWAVE" },
        { status: 501 }
      );
    }

    const txRef = `zed_${order.orderId}_${Date.now()}`;
    const charge = await initiateFlutterwaveCharge({
      tx_ref: txRef,
      amount: totals.total,
      currency: "KES",
      payment_options: "card,mpesa,ussd",
      email: parsed.data.email,
      first_name: parsed.data.name.split(" ")[0] ?? parsed.data.name,
      last_name: parsed.data.name.split(" ").slice(1).join(" ") ?? "",
      phone_number: phone,
      meta: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        platform: "zed-gift-shop",
      },
    });

    if (charge.ok && charge.data) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { provider: "FLUTTERWAVE", txRef, checkoutUrl: charge.data.authorization_url, status: "PENDING" },
      });
      return NextResponse.json({
        ok: true,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: totals.total,
        payment: {
          status: "PENDING",
          configured: true,
          method: "FLUTTERWAVE",
          txRef,
          authorizationUrl: charge.data.authorization_url,
          link: charge.data.link,
        },
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", resultDescription: charge.error ?? null },
    });
    return NextResponse.json({
      ok: false,
      error: charge.error ?? "Flutterwave payment initiation failed.",
      orderId: order.orderId,
      orderNumber: order.orderNumber,
    });
  }

  // Handle Bank Transfer
  if (paymentMethod === "BANK_TRANSFER") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PENDING",
      },
    });
    const orderNumber = order.orderNumber;
    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      orderNumber,
      total: totals.total,
      payment: { status: "PENDING", configured: true, method: "BANK_TRANSFER" },
      bankTransfer: {
        bankName: "Kenya Commercial Bank",
        accountName: "ZED Gift Shop",
        accountNumber: "1234567890",
        branch: "Nairobi Westgate",
        swiftCode: "KENKENXXX",
        paymentReference: orderNumber,
        instructions: "Transfer the exact order amount to the bank account below, then submit your payment confirmation.",
        orderTotal: totals.total,
      },
    });
  }

  return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
}
