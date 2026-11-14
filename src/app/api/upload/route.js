import { NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Batas aman payload Serverless Function Vercel adalah 4.5 MB
const MAX_SIZE = 4.5 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Berkas tidak ditemukan dalam permintaan." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan PDF, JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 4,5 MB untuk server cloud." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Konfigurasi Supabase Storage belum diatur di server." },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const safeBase = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const fileName = `${Date.now()}-${safeBase}.${ext}`;

    // Upload langsung ke Supabase Storage bucket "uploads"
    const uploadEndpoint = `${supabaseUrl}/storage/v1/object/uploads/${fileName}`;
    const uploadRes = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Supabase Storage error:", errText);
      return NextResponse.json(
        { error: "Gagal menyimpan berkas ke Supabase Storage." },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileUrl: publicUrl,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengunggah berkas ke server." },
      { status: 500 }
    );
  }
}