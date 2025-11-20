import connectDB from "@/app/lib/db";
import Seat from "@/app/models/Seat"; // make sure you have Seat model
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("GET /api/admin/seats/list called");

    await connectDB();
    const seats = await Seat.find({});
    console.log("Seats fetched:", seats);

    return NextResponse.json({ ok: true, seats });
  } catch (error) {
    console.error("Error fetching seats:", error);
    return NextResponse.json({ ok: false, seats: [], error: (error as Error).message }, { status: 500 });
  }
}
