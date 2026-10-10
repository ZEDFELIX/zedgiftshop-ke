import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "felixsimon855@gmail.com";
  const password = "Felix.877";
  const name = "ZED Admin";
  const phone = "+254711436169";

  const passwordHash = await bcrypt.hash(password, 12);

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
    console.log(`✔ Updated admin user: ${updated.email} (role: ${updated.role})`);
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
    console.log(`✔ Created admin user: ${created.email} (role: ${created.role})`);
  }

  // Also ensure the seed admin exists
  const seedEmail = "admin@zedgiftshop.co.ke";
  const seedPassword = "Admin@12345";
  const seedHash = await bcrypt.hash(seedPassword, 12);

  const seedExisting = await prisma.user.findUnique({ where: { email: seedEmail } });
  if (seedExisting) {
    await prisma.user.update({
      where: { id: seedExisting.id },
      data: { passwordHash: seedHash, role: "ADMIN" },
    });
    console.log(`✔ Updated seed admin: ${seedEmail}`);
  } else {
    await prisma.user.create({
      data: {
        email: seedEmail,
        name: "ZED Admin",
        phone: "+254711436169",
        passwordHash: seedHash,
        role: "ADMIN",
      },
    });
    console.log(`✔ Created seed admin: ${seedEmail}`);
  }

  console.log("\n✅ Admin users configured:");
  console.log(`   1. ${email} / ${password}`);
  console.log(`   2. ${seedEmail} / ${seedPassword}`);
}

main()
  .catch((err) => {
    console.error("✘ Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
