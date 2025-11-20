import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import Student from "@/app/models/Student";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) return NextResponse.json({ success: false, message: "UID missing" }, { status: 400 });

  await dbConnect();
  const student = await Student.findOne({ firebaseUID: uid });

  if (!student) return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });

  return NextResponse.json({ success: true, student });
}
