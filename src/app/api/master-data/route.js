import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [printOptions, finishings, storeSetting] = await Promise.all([
      prisma.printOption.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.finishing.findMany({
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.storeSetting.findUnique({ where: { id: "default" } }),
    ]);

    return NextResponse.json({
      printOptions,
      finishings,
      storeSetting,
    });
  } catch (error) {
    console.error("Master data fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data master." },
      { status: 500 }
    );
  }
}
