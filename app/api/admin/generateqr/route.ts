// app/api/admin/generate-qr/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Qrtoken from "@/app/models/Qrtoken";
import QRCodeLib from "qrcode";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "changeme";

function randomToken(len = 24) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  const adminHeader = req.headers.get("x-admin-secret") || "";
  if (adminHeader !== ADMIN_SECRET) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const minutes = body?.minutes || 120; 
  const token = randomToken(28);
  const validUntil = new Date(Date.now() + minutes * 60 * 1000);

  await connectDB();

  const qr = new Qrtoken({ token, validUntil, used: false, createdBy: "admin" });
  await qr.save();

  const attendanceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/attendance/scan?token=${token}`;

  const dataUrl = await QRCodeLib.toDataURL(attendanceUrl);

  return NextResponse.json({ ok: true, token, validUntil, dataUrl, attendanceUrl });
}
