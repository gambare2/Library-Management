// app/api/login/route.ts
import { NextResponse } from "next/server";
import admin from "@/app/lib/FirebaseAdmin";
import { serialize } from "cookie";
import connectDB from "@/app/lib/db";
import Student from "@/app/models/Student";
import { ADMIN_EMAILS } from "@/app/hooks/useAdminlogin";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { idToken, loginMethod } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    // ---- Verify Firebase token ----
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email || "";
    const uid = decoded.uid;
    const name = decoded.name || "";

    // ---- ROLE CHECK ----
    let role: "admin" | "student" = "student";

    if (loginMethod === "email" && ADMIN_EMAILS.includes(email)) {
      role = "admin";
    }

    // ---- Generate ADMIN TOKEN if admin ----
    let adminToken: string | null = null;
    if (role === "admin") {
      adminToken = jwt.sign(
        { uid, email, role: "admin" },
        process.env.JWT_ADMIN_SECRET!,
        { expiresIn: "7d" }
      );
    }

    // ---- MONGO USER ----
    let student = await Student.findOne({ firebaseUID: uid });

    if (!student) {
      if (loginMethod === "email") {
        // Allow creating email-based student if not exist
        student = await Student.create({
          firebaseUID: uid,
          name,
          email,
          studentId: "STU-" + Math.floor(100000 + Math.random() * 900000),
          provider: "email", // required by schema
        });
      } else {
        // Google/Phone login: do not create student
        return NextResponse.json(
          { error: "Student not registered. Please sign up first." },
          { status: 401 }
        );
      }
    }

    // ---- COOKIES ----
    const cookieAuth = serialize("study_auth", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const cookieUser = serialize(
      "study_user",
      JSON.stringify({ uid, email, name, role, studentId: student.studentId }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    const cookieAdmin =
      role === "admin"
        ? serialize("admin_token", adminToken!, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          })
        : null;

    const response = NextResponse.json({
      success: true,
      role,
      user: { uid, email, name },
      studentId: student?.studentId,
      adminToken,
    });

    response.headers.append("Set-Cookie", cookieAuth);
    response.headers.append("Set-Cookie", cookieUser);
    if (cookieAdmin) response.headers.append("Set-Cookie", cookieAdmin);

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
