import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/app/lib/db";
import Booking from "@/app/models/Booking";

export async function GET() {
  try {
    console.log("GET /api/bookings called");
    await dbConnect();

    const bookings = await Booking.find().populate("studentId seatId roomId");
    console.log("Bookings fetched:", bookings);

    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log("POST /api/bookings called");
    await dbConnect();

    const { studentId, roomId, seatId } = await req.json();
    console.log("Received:", { studentId, roomId, seatId });

    if (!studentId || !roomId || !seatId) {
      console.warn("Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // Convert to ObjectId
    let studentObjId, roomObjId, seatObjId;
    try {
      studentObjId = new mongoose.Types.ObjectId(studentId);
      roomObjId = new mongoose.Types.ObjectId(roomId);
      seatObjId = new mongoose.Types.ObjectId(seatId);
    } catch (err) {
      console.error("Invalid ObjectId format:", err);
      return NextResponse.json(
        { success: false, message: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Check if seat is already booked
    const existing = await Booking.findOne({
      seatId: seatObjId,
      status: "active",
    });
    console.log("Existing booking check:", existing);

    if (existing) {
      console.warn("Seat already booked!");
      return NextResponse.json(
        { success: false, message: "Seat already booked!" },
        { status: 409 }
      );
    }

    const bookingTime = new Date();
    const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const booking = await Booking.create({
      studentId: studentObjId,
      roomId: roomObjId,
      seatId: seatObjId,
      bookingTime,
      expiryTime,
      status: "active",
      source: "web",
    });

    console.log("Booking created successfully:", booking);

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
