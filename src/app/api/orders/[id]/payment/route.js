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
    const body = await request.json();
    const { paymentProofUrl } = body;

    if (!paymentProofUrl) {
      return NextResponse.json(
        { error: "URL bukti pembayaran wajib disertakan." },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder || existingOrder.userId !== session.id) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentProofUrl,
        status: "MENUNGGU_VERIFIKASI",
        rejectionReason: null,
      },
      include: { items: true },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "Bukti Pembayaran Diunggah",
          message: `${session.name} mengunggah bukti pembayaran untuk pesanan ${updatedOrder.orderCode}.`,
          link: "/admin/kelola-pesanan",
        })),
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Payment upload error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan bukti pembayaran." },
      { status: 500 }
    );
  }
}
