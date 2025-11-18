import connectDB from "@/app/lib/db";
import { getStudentId } from "@/app/lib/Studentauth";
import Attendence from "@/app/models/Attendence";
import { NextResponse } from "next/server";

interface Student {
    _id: string;
    name?: string;
    email?: string;
}

export async function GET(req: Request) {
    console.log("📌 Attendance API triggered");

    await connectDB();

    let student = await getStudentId(req) as Student | Student[];

    // Handle array response
    if (Array.isArray(student)) {
        console.log("⚠️ getStudentId returned array. Taking first student.");
        student = student[0];
    }

    if (!student?._id) {
        console.warn("❌ No valid student found.");
        return NextResponse.json(
            { ok: false, message: "Unavailable" },
            { status: 401 }
        );
    }

    console.log("🎯 Student ID:", student._id);

    const dateString = new Date().toISOString().slice(0, 10);
    console.log("📅 Checking attendance for:", dateString);

    const att = await Attendence.findOne({
        studentId: student._id,
        dateString,
    }).lean();

    console.log("📘 Attendance record:", att);

    return NextResponse.json({
        ok: true,
        attendance: att || null,
    });
}
