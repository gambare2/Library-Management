import { NextResponse } from "next/server";
import admin from "@/app/lib/FirebaseAdmin";
import { serialize } from "cookie";
import connectDB from "@/app/lib/db";
import Student from "@/app/models/Student";

export async function POST(req: Request) {
  console.log("📩 LOGIN API CALLED");

  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    const body = await req.json();
    const { idToken } = body;

    if (!idToken) return NextResponse.json({ error: "Token missing" }, { status: 400 });

    // ---- Verify Firebase token ----
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decoded.uid;
    const email = decoded.email || "";
    const name = decoded.name || "";
    const provider = decoded.firebase?.sign_in_provider || "unknown";

    // ---- MongoDB Student ----
    let student = await Student.findOne({ firebaseUID: uid });
    if (!student) {
      student = await Student.create({
        firebaseUID: uid,
        name,
        email,
        studentId: "STU-" + Math.floor(100000 + Math.random() * 900000),
        macAddresses: [],
      });
      console.log("✅ New Student Created:", student.studentId);
    } else {
      console.log("✅ Existing Student Found:", student.studentId);
    }

    // ---- Cookies & Response ----
    const safeUser = { uid, email, name, provider };
    const cookieAuth = serialize("study_auth", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    const cookieUser = serialize("study_user", JSON.stringify(safeUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      studentId: student.studentId,
    });

    response.headers.append("Set-Cookie", cookieAuth);
    response.headers.append("Set-Cookie", cookieUser);

    return response;
  } catch (error) {
    console.log("🔥 LOGIN API ERROR:", error);
    return NextResponse.json({ error: "Login failed", details: String(error) }, { status: 500 });
  }
}
