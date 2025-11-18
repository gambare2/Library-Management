import connectDB from "@/app/lib/db";
import { getStudentId } from "@/app/lib/Studentauth";
import Attendence from "@/app/models/Attendence";
import Qrtoken from "@/app/models/Qrtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    await connectDB;

    let student = await getStudentId(req);
    if (Array.isArray(student)) student = student[0];
    if (!student?._id)
        return NextResponse.json({
            ok: false,
            message: "Unavailable"
        }, { status: 401 })

    const body = await req.json()
    const token = body?.token;
    if (!token)
        return NextResponse.json({
            ok: false,
            message: "Unavailable"
        }, { status: 401 })
    const qr = await Qrtoken.findOne({ token })
    if (!qr)
        return NextResponse.json({
            ok: false,
            message: "Unavailable to give Qr"
        }, { status: 400 })
    if (qr.used)
        return NextResponse.json({
            ok: false,
            message: "Qr code used"
        }, { status: 400 })
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);

    try {
        const doc = await Attendence.findOneAndUpdate(
            { studentId: student._id, dateString },
            { $setOnInsert: { studentId: student._id, dateString, timestamp: now, method: "qr", meta: { token } } },
            { upsert: true, new: true }
        )
        qr.used = true;
        await qr.save();

        return NextResponse.json({ ok: true, attendance: doc });
    } catch (error) {
        return NextResponse.json({
            ok: false,
            message: "Internal server error"
        }, { status: 500 })
    }

}