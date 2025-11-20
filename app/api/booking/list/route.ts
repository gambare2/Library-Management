import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Booking from "@/app/models/Booking";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ success: false, message: "roomId is required" }, { status: 400 });
    }

    const roomObjId = new mongoose.Types.ObjectId(roomId);
    const bookings = await Booking.find({ roomId: roomObjId });

    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
