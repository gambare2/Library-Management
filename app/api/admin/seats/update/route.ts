import connectDB from "@/app/lib/db";
import Seat from "@/app/models/Seat";
import { NextResponse } from "next/server";

export async function PUT(req: Request){
    await connectDB();
    const {seatId, updates} = await req.json();

    const updated = await Seat.findByIdAndUpdate(seatId, updates, {new: true})

    return NextResponse.json({
        ok :true, 
        message: "Seat Updated",
        updated
    })
}