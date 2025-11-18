import admin from "@/app/lib/FirebaseAdmin";  
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, phoneNumber, name, provider, idToken } = body;

    let userRecord;

    if (provider === "google" || idToken) {
      // Verify Google ID Token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userRecord = await admin.auth().getUser(decodedToken.uid);

    } else if (email && password) {
      // Email + password signup
      userRecord = await admin.auth().createUser({
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        displayName: name,
      });

    } else if (phoneNumber) {
      // Phone only
      userRecord = await admin.auth().createUser({
        phoneNumber,
        displayName: name,
      });

    } else {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // Store in Firestore
    const userRef = admin.firestore().collection("users").doc(userRecord.uid);

    await userRef.set(
      {
        uid: userRecord.uid,
        name: userRecord.displayName || name || null,
        email: userRecord.email || null,
        phoneNumber: userRecord.phoneNumber || null,
        provider: provider || "custom",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("REGISTER API ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
