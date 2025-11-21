import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Booking from "@/app/models/Booking";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    console.log("➡ GET /api/booking/list called, roomId =", roomId);

    if (!roomId) {
      console.log("❌ roomId missing");
      return NextResponse.json({ success: false, message: "roomId is required" }, { status: 400 });
    }

    const roomObjId = new mongoose.Types.ObjectId(roomId);

    // 🔥 AUTO REMOVE EXPIRED BOOKINGS
    const now = new Date();
    await Booking.updateMany(
      { expiryTime: { $lte: now }, status: "active" },
      { $set: { status: "expired" } }
    );

    // 🔥 TODAY DATE RANGE
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    console.log("📅 Today Filter:", startOfDay, "->", endOfDay);

    // 🔥 RETURN ONLY VALID BOOKINGS FOR TODAY
    const bookings = await Booking.find({
      roomId: roomObjId,
      status: "active",
      bookingTime: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    console.log("📌 Bookings Fetched:", bookings);

    return NextResponse.json({ success: true, bookings });
  } catch (err) {
    console.error("💥 Error fetching bookings:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    console.log("POST /api/bookings called");
    await connectDB();

    const { studentId, roomId, seatId, startTime, endTime } = await req.json();

    console.log("Received:", { studentId, roomId, seatId, startTime, endTime });

    if (!studentId || !roomId || !seatId || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert IDs
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const roomObjId = new mongoose.Types.ObjectId(roomId);
    const seatObjId = new mongoose.Types.ObjectId(seatId);

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    // Build date objects
    const fullStart = new Date(`${today}T${startTime}:00`);
    const fullEnd = new Date(`${today}T${endTime}:00`);

    console.log("Parsed times:", fullStart, fullEnd);

    if (isNaN(fullStart.getTime()) || isNaN(fullEnd.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid time format" },
        { status: 400 }
      );
    }

    // ❗ NEW CHECK: Student already booked?
    const studentExisting = await Booking.findOne({
      studentId: studentObjId,
      status: "active",
    });

    if (studentExisting) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have an active booking. You cannot book more than one seat.",
        },
        { status: 403 }
      );
    }

    // Check if seat is already booked
    const existing = await Booking.findOne({
      seatId: seatObjId,
      status: "active",
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Seat already booked!" },
        { status: 409 }
      );
    }

    // Save booking
    const booking = await Booking.create({
      studentId: studentObjId,
      roomId: roomObjId,
      seatId: seatObjId,
      bookingTime: fullStart,
      expiryTime: fullEnd,
      startTime: fullStart,
      endTime: fullEnd,
      status: "active",
      source: "web",
    });

    console.log("Booking saved:", booking);

    return NextResponse.json({ success: true, data: booking });

  } catch (err) {
    console.error("Error creating booking:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
