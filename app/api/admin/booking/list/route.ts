import connectDB from "@/app/lib/db";
import Booking from "@/app/models/Booking";
import { NextResponse } from "next/server";

export async function GET(req: Request){
    await connectDB();
    const booking = await Booking.find().populate("roomId").populate("seatId")

    return NextResponse.json({
        ok: true,
        booking
    })
}