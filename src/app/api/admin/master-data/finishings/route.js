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

    const item = await prisma.finishing.create({
      data: {
        category,
        name,
        unit,
        price,
        isActive: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create finishing error:", error);
    return NextResponse.json({ error: "Gagal menambahkan opsi finishing." }, { status: 500 });
  }
}
