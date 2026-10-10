import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.ADMIN_SETUP_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
