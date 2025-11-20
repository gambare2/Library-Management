import Seat from "@/app/models/Seat";
import Booking from "@/app/models/Booking";
import { NextResponse } from "next/server";
import admin from "@/app/lib/FirebaseAdmin";

export async function POST(req: Request) {
  const { seatId, idToken } = await req.json();

  const decoded = await admin.auth().verifyIdToken(idToken);
  const userId = decoded.uid;

  const seat = await Seat.findById(seatId);

  if (seat.bookedBy !== userId)
    return NextResponse.json({ success: false, message: "Not allowed" });

  await Seat.findByIdAndUpdate(seatId, {
    status: "available",
    bookedBy: null,
  });

  await Booking.deleteOne({ seatId, userId });

  return NextResponse.json({ success: true });
}
