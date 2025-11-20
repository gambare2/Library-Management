import connectDB from "@/app/lib/db";
import Room from "@/app/models/Room";
import { NextResponse } from "next/server";

export async function DELETE(req: Request){
    await connectDB();
    const {roomId} = await req.json();

    await Room.findByIdAndDelete(roomId)

    return NextResponse.json({
        ok: true,
        message: "Room Deleted successfully"
    })
}