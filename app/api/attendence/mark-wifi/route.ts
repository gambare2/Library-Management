import connectDB from "@/app/lib/db";
import { getStudentId } from "@/app/lib/Studentauth";
import { NextResponse } from "next/server";
import { getClientIp, Ipallowed } from "@/app/lib/Wifi";
import Attendence from "@/app/models/Attendence";

export async function POST(req: Request) {
    console.log("📌 [ATTENDANCE API] POST request received");

    await connectDB();
    console.log("🔗 DB Connected");

    // --- GET STUDENT ---
    let student = await getStudentId(req);
    console.log("🎯 getStudentId response:", student);

    // FIX: If student returns array, take first
    if (Array.isArray(student)) {
        console.warn("⚠️ getStudentId returned an ARRAY. Using first element.");
        student = student[0];
    }

    if (!student?._id) {
        console.error("❌ Unauthorized: Student not found");
        return NextResponse.json(
            { ok: false, message: "unauthorized" },
            { status: 401 }
        );
    }

    console.log("🆔 Student Authenticated:", student._id);

    // --- GET CLIENT IP ---
    const clientIp = getClientIp(req);
    console.log("📡 Client IP detected:", clientIp);

    const allowed = Ipallowed(clientIp);
    console.log("📶 WiFi Allowed Status:", allowed);

    if (!allowed) {
        console.warn("🚫 WiFi NOT allowed for IP:", clientIp);
        return NextResponse.json(
            { ok: false, message: "Not connected to allowed WiFi" },
            { status: 400 }
        );
    }

    // --- DATE STRING ---
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);
    console.log("📅 Attendance date:", dateString);

    // --- UPSERT ATTENDANCE ---
    try {
        console.log("📝 Saving attendance...");
        const doc = await Attendence.findOneAndUpdate(
            { studentId: student._id, dateString },
            {
                $setOnInsert: {
                    studentId: student._id,
                    dateString,
                    timestamp: now,
                    method: "wifi",
                    ip: clientIp,
                },
            },
            { upsert: true, new: true }
        );

        console.log("✅ Attendance saved/updated:", doc);

        return NextResponse.json({ ok: true, attendance: doc });
    } catch (error: any) {
        console.error("🔥 Error saving attendance:", error);
        return NextResponse.json(
            { ok: false, message: "Unable to access your request", error: error.message },
            { status: 500 }
        );
    }
}
