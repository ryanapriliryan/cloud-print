import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const storeSetting = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {
        storeName: (body.storeName || "Cloud Print").trim(),
        storeAddress: (body.storeAddress || "").trim(),
        storePhone: (body.storePhone || "").trim(),
        bankName: (body.bankName || "").trim(),
        accountNumber: (body.accountNumber || "").trim(),
        accountHolder: (body.accountHolder || "").trim(),
        paymentNote: (body.paymentNote || "").trim(),
      },
      create: {
        id: "default",
        storeName: (body.storeName || "Cloud Print").trim(),
        storeAddress: (body.storeAddress || "").trim(),
        storePhone: (body.storePhone || "").trim(),
        bankName: (body.bankName || "").trim(),
        accountNumber: (body.accountNumber || "").trim(),
        accountHolder: (body.accountHolder || "").trim(),
        paymentNote: (body.paymentNote || "").trim(),
      },
    });

    return NextResponse.json({ storeSetting });
  } catch (error) {
    console.error("Update store setting error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan toko & pembayaran." },
      { status: 500 }
    );
  }
}
