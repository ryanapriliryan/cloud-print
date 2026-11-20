import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
  const auth = await getSession();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Sesi chat tidak ditemukan." }, { status: 404 });
  }

  if (chatSession.unreadByAdmin > 0) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { unreadByAdmin: 0 },
    });
  }

  return NextResponse.json({
    session: {
      id: chatSession.id,
      visitorName: chatSession.visitorName,
      createdAt: chatSession.createdAt,
    },
    messages: chatSession.messages,
  });
}

export async function POST(request, context) {
  const auth = await getSession();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  const body = await request.json();
  const content = String(body.content || "").trim();

  if (!content) {
    return NextResponse.json({ error: "Balasan tidak boleh kosong." }, { status: 400 });
  }

  const existing = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Sesi chat tidak ditemukan." }, { status: 404 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      sessionId,
      sender: "ADMIN",
      content,
    },
  });

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      lastMessageAt: new Date(),
      unreadByAdmin: 0,
    },
  });

  return NextResponse.json({ message });
}

export async function DELETE(request, context) {
  const auth = await getSession();
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;

  await prisma.chatSession.delete({
    where: { id: sessionId },
  });

  return NextResponse.json({ success: true });
}