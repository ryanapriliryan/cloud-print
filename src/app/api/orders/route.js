import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PELANGGAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      printOptionId,
      finishingId,
      fileName,
      fileUrl,
      fileSize,
      quantity,
      copies,
      width,
      height,
      notes,
    } = body;

    if (!printOptionId || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Opsi cetak dan file dokumen wajib dilengkapi." },
        { status: 400 }
      );
    }

    const printOption = await prisma.printOption.findUnique({
      where: { id: printOptionId },
    });

    if (!printOption) {
      return NextResponse.json(
        { error: "Opsi cetak tidak ditemukan." },
        { status: 404 }
      );
    }

    let finishing = null;
    if (finishingId) {
      finishing = await prisma.finishing.findUnique({
        where: { id: finishingId },
      });
    }

    const safeCopies = Math.max(1, parseInt(copies, 10) || 1);
    const safeQty = Math.max(1, parseInt(quantity, 10) || 1);
    const safeWidth = width ? Math.max(0.1, parseFloat(width)) : null;
    const safeHeight = height ? Math.max(0.1, parseFloat(height)) : null;

    let baseAmount = 0;
    if (printOption.unit === "meter" && safeWidth && safeHeight) {
      const area = safeWidth * safeHeight;
      baseAmount = Math.round(area * printOption.price * safeCopies);
    } else {
      baseAmount = Math.round(safeQty * printOption.price * safeCopies);
    }

    let finishingAmount = 0;
    if (finishing) {
      if (finishing.unit === "per lembar" || finishing.unit === "per halaman") {
        finishingAmount = finishing.price * safeQty * safeCopies;
      } else if (finishing.unit === "per meter" && safeWidth && safeHeight) {
        finishingAmount = Math.round(finishing.price * safeWidth * safeHeight * safeCopies);
      } else {
        finishingAmount = finishing.price * safeCopies;
      }
    }

    const subtotal = baseAmount + finishingAmount;
    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `CP-${dateStamp}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        userId: session.id,
        status: "MENUNGGU_PEMBAYARAN",
        totalAmount: subtotal,
        notes: notes?.trim() || null,
        items: {
          create: [
            {
              printOptionId: printOption.id,
              finishingId: finishing ? finishing.id : null,
              itemTitle: `${printOption.category} - ${printOption.name}`,
              finishingTitle: finishing ? finishing.name : null,
              unitLabel: printOption.unit,
              fileName,
              fileUrl,
              fileSize: fileSize || null,
              quantity: safeQty,
              copies: safeCopies,
              width: safeWidth,
              height: safeHeight,
              unitPrice: printOption.price,
              finishingPrice: finishingAmount,
              subtotal,
            },
          ],
        },
      },
      include: { items: true },
    });

    // Notify all Admins about new order
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "Pesanan Baru Masuk",
          message: `Pesanan ${order.orderCode} dari ${session.name} telah dibuat.`,
          link: "/admin/kelola-pesanan",
        })),
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Gagal membuat pesanan baru." },
      { status: 500 }
    );
  }
}
