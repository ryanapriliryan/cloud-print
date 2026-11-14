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
    const category = (body.category || "SEMUA").trim();
    const name = (body.name || "").trim();
    const unit = (body.unit || "per dokumen").trim();
    const price = parseInt(body.price, 10);

    if (!name || isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Nama opsi finishing dan harga valid wajib diisi." },
        { status: 400 }
      );
    }

    const item = await prisma.finishing.update({
      where: { id },
      data: {
        category,
        name,
        unit,
        price,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Update finishing error:", error);
    return NextResponse.json({ error: "Gagal memperbarui opsi finishing." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.finishing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete finishing error:", error);
    return NextResponse.json({ error: "Gagal menghapus opsi finishing." }, { status: 500 });
  }
}
