import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, signToken, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const phone = (body.phone || "").trim();
    const newPassword = body.newPassword || "";

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nama lengkap dan email wajib diisi." },
        { status: 400 }
      );
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: session.id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Email tersebut sudah digunakan oleh akun lain." },
        { status: 409 }
      );
    }

    const updateData = {
      name,
      email,
      phone: phone || null,
    };

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal 6 karakter." },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    const token = await signToken({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil pengguna." },
      { status: 500 }
    );
  }
}
