import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.ADMIN_SETUP_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run raw SQL migration via Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Add BANK_TRANSFER to PaymentProvider enum
  const { error: enumError } = await supabase.rpc("exec_sql", {
    sql: `ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'BANK_TRANSFER';`,
  });

  if (enumError) {
    // Try alternative approach
    const { error: altError } = await supabase.from("_prisma_migrations").select("*").limit(1);
    if (altError) {
      return NextResponse.json({ error: "Database connection failed", details: altError.message }, { status: 500 });
    }
  }

  // Add bank transfer columns to Payment table
  const { error: colError } = await supabase.rpc("exec_sql", {
    sql: `
      DO $$ 
      BEGIN
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "accountName" TEXT;
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "branch" TEXT;
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "swiftCode" TEXT;
        ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `,
  });

  // Create/update admin user
  const email = "felixsimon855@gmail.com";
  const password = "Felix.877";
  const name = "ZED Admin";
  const phone = "+254711436169";

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: "ADMIN",
        name,
        phone,
      },
    });
    return NextResponse.json({
      success: true,
      message: "Admin user updated",
      email: updated.email,
      role: updated.role,
    });
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        role: "ADMIN",
      },
    });
    return NextResponse.json({
      success: true,
      message: "Admin user created",
      email: created.email,
      role: created.role,
    });
  }
}
