import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // Защищаем эндпоинт от неавторизованных пользователей
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!apiSecret || !apiKey || !uploadPreset) {
    return NextResponse.json({ 
      error: "Cloudinary credentials are not properly configured" 
    }, { status: 500 });
  }

  // Cloudinary signature generation:
  // Параметры должны быть отсортированы в алфавитном порядке
  // У нас: timestamp и upload_preset
  const stringToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
  
  const signature = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  return NextResponse.json({ 
    signature, 
    timestamp, 
    apiKey,
    uploadPreset
  });
}
