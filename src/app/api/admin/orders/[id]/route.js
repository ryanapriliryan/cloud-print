import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_META } from "@/lib/format";

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (status === "DITOLAK" && !(rejectionReason || "").trim()) {
      return NextResponse.json(
        { error: "Alasan penolakan wajib diisi agar pelanggan dapat memperbaikinya." },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "DITOLAK" ? rejectionReason.trim() : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
      },
    });

    const statusLabel = ORDER_STATUS_META[status]?.label || status;
    const notifMessage =
      status === "DITOLAK"
        ? `Pesanan ${updated.orderCode} ditolak: ${rejectionReason.trim()}. Silakan unggah ulang bukti pembayaran.`
        : `Status pesanan ${updated.orderCode} diperbarui menjadi: ${statusLabel}.`;

    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: status === "DITOLAK" ? "Pembayaran Ditolak" : "Pembaruan Status Pesanan",
        message: notifMessage,
        link: "/pelanggan/riwayat",
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pesanan." },
      { status: 500 }
    );
  }
}
