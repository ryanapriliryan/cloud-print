import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ session: null, messages: [] });
    }

    const session = await prisma.chatSession.findUnique({
      where: { visitorToken: token },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ session: null, messages: [] });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        visitorName: session.visitorName,
      },
      messages: session.messages,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat riwayat percakapan." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const token = String(body.token || "").trim();
    const visitorName = String(body.visitorName || "").trim();
    const content = String(body.content || "").trim();

    if (!token || !content) {
      return NextResponse.json(
        { error: "Token sesi dan isi pesan wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.chatSession.findUnique({
      where: { visitorToken: token },
    });

    const resolvedName = visitorName || existing?.visitorName || "Pengunjung";

    const chatSession = await prisma.chatSession.upsert({
      where: { visitorToken: token },
      create: {
        visitorToken: token,
        visitorName: resolvedName,
        unreadByAdmin: 1,
        lastMessageAt: new Date(),
      },
      update: {
        visitorName: resolvedName,
        unreadByAdmin: { increment: 1 },
        lastMessageAt: new Date(),
      },
    });

    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        sender: "VISITOR",
        content,
      },
    });

    // Kirim notifikasi lonceng ke Admin saat percakapan baru dimulai atau setelah pesan sebelumnya dibaca
    if (chatSession.unreadByAdmin === 1) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (admins.length > 0) {
        const preview =
          content.length > 75 ? `${content.slice(0, 75)}...` : content;
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "Pesan Live Chat Baru",
            message: `${chatSession.visitorName}: ${preview}`,
            link: `/admin/live-chat?session=${chatSession.id}`,
          })),
        });
      }
    }

    return NextResponse.json({
      session: {
        id: chatSession.id,
        visitorName: chatSession.visitorName,
      },
      message: newMessage,
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengirim pesan." },
      { status: 500 }
    );
  }
}