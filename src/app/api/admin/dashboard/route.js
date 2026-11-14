import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orders, customerCount] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { role: "PELANGGAN" } }),
  ]);

  const completedRevenue = orders
    .filter((o) => o.status === "SELESAI")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingVerificationCount = orders.filter(
    (o) => o.status === "MENUNGGU_VERIFIKASI"
  ).length;

  const inProgressCount = orders.filter(
    (o) => o.status === "DIPROSES" || o.status === "SIAP_DIAMBIL"
  ).length;

  return NextResponse.json({
    stats: {
      completedRevenue,
      pendingVerificationCount,
      inProgressCount,
      totalOrders: orders.length,
      customerCount,
    },
    recentOrders: orders.slice(0, 8),
  });
}
