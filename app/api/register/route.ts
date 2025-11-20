import admin from "@/app/lib/FirebaseAdmin";
import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Student from "@/app/models/Student";
import { generateUniqueStudentId } from "@/app/hooks/generateStudentId";  // <-- IMPORTED

export async function POST(req: Request) {
  try {
    console.log("➡️ API HIT: /api/auth/register");

    await connectDB();
    console.log("🟢 Database Connected");

    const { provider, email, password, name, phoneNumber, idToken } = await req.json();

    console.log("📩 Incoming Payload:", {
      provider,
      email,
      name,
      phoneNumber,
      hasIdToken: !!idToken,
    });

    let firebaseUser;

    // ---------------------------
    // PROVIDER HANDLING
    // ---------------------------
    if (provider === "google" || provider === "phone") {
      console.log(`🔐 Provider Login: ${provider}`);

      if (!idToken) {
        console.log("❌ Missing idToken");
        return NextResponse.json(
          { success: false, message: "Missing ID Token" },
          { status: 400 }
        );
      }

      console.log("🔍 Verifying Firebase ID Token...");
      const decoded = await admin.auth().verifyIdToken(idToken);

      console.log("🟢 Token Verified:", decoded.uid);

      firebaseUser = await admin.auth().getUser(decoded.uid);

      console.log("👤 Firebase User Fetched:", {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
      });
    }

    else if (provider === "email") {
      console.log("✉️ Email/Password Provider");

      if (!email || !password || !name) {
        console.log("❌ Missing Email/Password/Name");
        return NextResponse.json(
          { success: false, message: "Name, Email & Password required" },
          { status: 400 }
        );
      }

      try {
        console.log("🛠 Creating Firebase User...");
        firebaseUser = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });

        console.log("🟢 Firebase User Created:", firebaseUser.uid);
      } catch (err: any) {
        console.log("⚠️ Firebase Error:", err.code, err.message);

        if (err.code === "auth/email-already-exists") {
          console.log("🔄 Email exists. Fetching existing Firebase user...");
          firebaseUser = await admin.auth().getUserByEmail(email);
        } else {
          throw err;
        }
      }
    }

    else {
      console.log("❌ Invalid Provider:", provider);
      return NextResponse.json(
        { success: false, message: "Invalid provider" },
        { status: 400 }
      );
    }

    // ---------------------------
    // STUDENT DOCUMENT HANDLING
    // ---------------------------
    const uid = firebaseUser.uid;
    console.log("🔑 Firebase UID:", uid);

    let existingUser = await Student.findOne({ firebaseUID: uid });

    console.log("🔍 Searching DB User:", existingUser ? "FOUND" : "NOT FOUND");

    const incomingPhone = firebaseUser.phoneNumber || phoneNumber || null;
    const incomingEmail = firebaseUser.email || email || null;

    console.log("📞 Incoming Phone:", incomingPhone);
    console.log("📧 Incoming Email:", incomingEmail);

    const finalPhone = incomingPhone ?? existingUser?.phone ?? null;
    const finalEmail = incomingEmail ?? existingUser?.email ?? null;

    console.log("✅ Final Phone Saved:", finalPhone);
    console.log("✅ Final Email Saved:", finalEmail);

    // ---------------------------
    // CREATE OR UPDATE STUDENT
    // ---------------------------
    if (!existingUser) {
      // Generate studentId
      const studentId = await generateUniqueStudentId();
      console.log("🆔 Generated Unique Student ID:", studentId);

      console.log("🆕 Creating New Student Document...");

      existingUser = await Student.create({
        firebaseUID: uid,
        provider,
        name: firebaseUser.displayName || name || null,
        email: finalEmail,
        phone: finalPhone,
        studentId,   // <--- SAVED HERE
      });

      console.log("🟢 Student Created:", existingUser._id);
    } else {
      console.log("📝 Updating Existing Student...");

      existingUser.provider = provider;
      existingUser.name = firebaseUser.displayName || name || existingUser.name;
      existingUser.email = finalEmail;
      existingUser.phone = finalPhone;

      // DO NOT override studentId
      console.log("🆔 Existing studentId remains:", existingUser.studentId);

      await existingUser.save();

      console.log("🟢 Student Updated:", existingUser._id);
    }

    return NextResponse.json({ success: true, user: existingUser });
  } catch (error: any) {
    console.log("❌ SERVER ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
