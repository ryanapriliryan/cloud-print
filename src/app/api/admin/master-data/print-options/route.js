import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const item = await prisma.printOption.create({
      data: {
        category,
        name,
        unit,
        price,
        description: description || null,
        isActive: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create print option error:", error);
    return NextResponse.json({ error: "Gagal menambahkan jenis cetak." }, { status: 500 });
  }
}
