import connectDB from "@/app/lib/db";
import Room from "@/app/models/Room";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("POST /api/admin/rooms/list called");

    // Parse the request body
    const body = await req.json();
    console.log("Request body:", body);

    // Connect to MongoDB
    await connectDB();
    console.log("Database connected");

    // Create the room
    const room = await Room.create(body);
    console.log("Room created:", room);

    // Return success response
    return NextResponse.json({
      ok: true,
      room,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/rooms/list:", error);

    // Return 500 response if something goes wrong
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
