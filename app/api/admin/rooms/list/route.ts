import connectDB from "@/app/lib/db";
import Room from "@/app/models/Room";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("GET /api/admin/rooms/list called");

    await connectDB();
    const rooms = await Room.find({});
    console.log("Rooms fetched:", rooms);

    return NextResponse.json({ ok: true, rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ ok: false, rooms: [], error: (error as Error).message }, { status: 500 });
  }
}
