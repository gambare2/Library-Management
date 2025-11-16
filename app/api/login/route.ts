import { NextResponse } from "next/server";
import { adminAuth } from "@/app/lib/FirebaseAdmin";
import { serialize } from "cookie";

export async function POST(req: Request) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ALLOWED_IPS = ["127.0.0.1", "::1", "103.165.103.25"];

    if (!ALLOWED_IPS.includes(clientIp)) {
      return NextResponse.json(
        { error: "Login allowed only on office WiFi" },
        { status: 403 }
      );
    }

    const { idToken } = await req.json();

    // Verify token using Firebase Admin
    const decoded = await adminAuth.verifyIdToken(idToken);

    const safeUser = {
      uid: decoded.uid,
      email: decoded.email || "",
      name: decoded.name || "",
    };

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

    const response = NextResponse.json(
      { success: true, user: safeUser },
      { status: 200 }
    );

    response.headers.append("Set-Cookie", cookieAuth);
    response.headers.append("Set-Cookie", cookieUser);

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
