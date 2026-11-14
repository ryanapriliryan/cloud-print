import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "PELANGGAN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== session.id) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (order.status !== "MENUNGGU_PEMBAYARAN") {
      return NextResponse.json(
        { error: "Hanya pesanan yang belum dibayar yang dapat dibatalkan." },
        { status: 400 }
      );
    }

    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Gagal membatalkan pesanan." }, { status: 500 });
  }
}
