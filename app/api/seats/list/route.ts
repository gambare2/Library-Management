import Seat from "@/app/models/Seat";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { roomId } = await req.json();
  const seats = await Seat.find({ roomId });
  return NextResponse.json({ success: true, seats });
}
