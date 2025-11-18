import connectDB from "./db";
import Student from "../models/Student";
import admin from "@/app/lib/FirebaseAdmin";

export async function getStudentId(req: Request) {
  console.log("🔍 [getStudentId] Function triggered");

  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("study_auth="))
    ?.split("=")[1];

  console.log("🍪 Cookie Token:", token ? token.substring(0, 20) + "..." : "NOT FOUND");

  if (!token) {
    console.log("❌ No Firebase token found in cookie");
    return null;
  }

  try {
    console.log("🔥 Verifying Firebase token...");
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Firebase Verified:", decoded.uid);

    await connectDB();

    const student = await Student.findOne({ firebaseUID: decoded.uid }).lean();

    if (!student) {
      console.log("❌ Student NOT found in MongoDB");
      return null;
    }

    // console.log("🎉 Student Found:", student._id);
    return student;
  } catch (err) {
    console.log("❌ Token verification failed:", err);
    return null;
  }
}
