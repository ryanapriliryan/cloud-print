import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where = { status: "SELESAI" };
  if (startDate || endDate) {
    where.updatedAt = {};
    if (startDate) {
      where.updatedAt.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      where.updatedAt.lte = new Date(`${endDate}T23:59:59.999Z`);
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    orders,
    summary: {
      totalTransactions: orders.length,
      totalRevenue,
    },
  });
}
