import Seat from "@/app/models/Seat";
import Booking from "@/app/models/Booking";
import { NextResponse } from "next/server";
import admin from "@/app/lib/FirebaseAdmin";

export async function POST(req: Request) {
  const { seatId, roomId, idToken } = await req.json();

  // Verify user
  const decoded = await admin.auth().verifyIdToken(idToken);
  const userId = decoded.uid;

  // Check seat status
  const seat = await Seat.findById(seatId);

  if (!seat || seat.status !== "available") {
    return NextResponse.json(
      { success: false, message: "Seat not available" },
      { status: 400 }
    );
  }

  // Book seat
  await Seat.findByIdAndUpdate(seatId, {
    status: "booked",
    bookedBy: userId,
  });

  await Booking.create({
    userId,
    seatId,
    roomId,
  });

  return NextResponse.json({ success: true, message: "Seat booked" });
}
