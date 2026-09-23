import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stkPush } from "@/lib/mpesa";

const schema = z.object({
  phone: z.string().min(9).max(15),
  amount: z.number().positive().max(1_000_000),
  accountReference: z.string().min(1).max(12),
  orderId: z.string().uuid(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { phone, amount, accountReference, orderId } = parsed.data;

  // Verify the order exists and is unpaid
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      total: true,
      payments: { select: { id: true, status: true }, take: 1 },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.paymentStatus === "SUCCESS") {
    return NextResponse.json({ error: "Order is already paid." }, { status: 409 });
  }

  if (!order.payments || order.payments.length === 0 || order.payments[0].status === "FAILED") {
    // Create a new payment record
    await prisma.payment.create({
      data: {
        orderId,
        provider: "M_PESA",
        status: "PENDING",
        amount,
        phone,
      },
    });
  }

  const push = await stkPush({
    phone,
    amount,
    accountReference,
    transactionDesc: `ZED Gift Shop order ${accountReference}`,
  });

  if (!push.ok) {
    // Update payment record with failure
    const payment = await prisma.payment.findFirst({
      where: { orderId, provider: "M_PESA", status: "PENDING" },
    });
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", resultDescription: push.error ?? null },
      });
    }
    return NextResponse.json(
      { ok: false, error: push.error ?? "M-PESA STK push failed." },
      { status: 400 }
    );
  }

  // Update payment record with checkout request ID
  const paymentRecord = await prisma.payment.findFirst({
    where: { orderId, provider: "M_PESA", status: "PENDING" },
  });
  if (paymentRecord) {
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        checkoutRequestId: push.checkoutRequestId,
        merchantRequestId: push.merchantRequestId ?? null,
        status: "PENDING",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    checkoutRequestId: push.checkoutRequestId,
    merchantRequestId: push.merchantRequestId,
    orderNumber: order.orderNumber,
    amount,
  });
}
