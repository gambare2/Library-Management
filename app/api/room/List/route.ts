import Room from "@/app/models/Room";
import { NextResponse } from "next/server";

export async function GET() {
  const rooms = await Room.find({});
  return NextResponse.json({ success: true, rooms });
}
