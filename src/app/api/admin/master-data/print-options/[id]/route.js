import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const category = (body.category || "").trim();
    const name = (body.name || "").trim();
    const unit = (body.unit || "lembar").trim();
    const price = parseInt(body.price, 10);
    const description = (body.description || "").trim();

    if (!category || !name || isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Kategori, nama layanan cetak, dan harga valid wajib diisi." },
        { status: 400 }
      );
    }

    const item = await prisma.printOption.update({
      where: { id },
      data: {
        category,
        name,
        unit,
        price,
        description: description || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Update print option error:", error);
    return NextResponse.json({ error: "Gagal memperbarui jenis cetak." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.printOption.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete print option error:", error);
    return NextResponse.json({ error: "Gagal menghapus jenis cetak." }, { status: 500 });
  }
}
