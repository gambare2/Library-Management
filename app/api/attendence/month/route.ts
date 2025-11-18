import connectDB from "@/app/lib/db";
import Attendence from "@/app/models/Attendence";
import { getStudentId } from "@/app/lib/Studentauth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();

  let student = await getStudentId(req);
  if (Array.isArray(student)) {
    student = student[0];
  }

  if (!student?._id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const data = await Attendence.find({
    studentId: student._id,
    timestamp: { $gte: start, $lt: end },
  }).lean();

  return NextResponse.json({
    ok: true,
    days: data.map((d) => d.dateString),
  });
}
