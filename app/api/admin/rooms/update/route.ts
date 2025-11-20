import connectDB from "@/app/lib/db";
import Room from "@/app/models/Room";
import { NextResponse } from "next/server";

export async function PUT(req: Request){
    await connectDB();
    const {roomId, updates} = await req.json()

    const updated = await Room.findByIdAndUpdate(roomId, updates, {new: true})

    return NextResponse.json({
        ok: true, 
        updated
    })
}