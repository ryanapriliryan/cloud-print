const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@cloudprint.id").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminCloudPrint2026!";
  const adminName = process.env.ADMIN_NAME || "Administrator Cloud Print";

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.storeSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: process.env.NEXT_PUBLIC_APP_NAME || "Cloud Print",
      storeAddress: "",
      storePhone: "",
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      paymentNote: "Silakan lakukan transfer sesuai nominal tagihan lalu unggah bukti pembayaran.",
    },
  });

  console.log("Inisialisasi database selesai (tanpa data dummy).");
  console.log(`Akun Admin siap digunakan: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error("Gagal menjalankan database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
