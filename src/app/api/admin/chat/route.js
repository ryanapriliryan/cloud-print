import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getSession();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.chatSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const unreadTotal = sessions.reduce((sum, s) => sum + (s.unreadByAdmin || 0), 0);

  return NextResponse.json({ sessions, unreadTotal });
}