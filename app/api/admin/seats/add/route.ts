import connectDB from "@/app/lib/db";
import Seat from "@/app/models/Seat";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    await connectDB();
    const body = await req.json()

    const seat = Seat.create(body);
    return NextResponse.json({
        ok: true, 
        seat
    })
}