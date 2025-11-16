"use client";
import dynamic from "next/dynamic";

const PolygonCard = dynamic(() => import("@/app/components/PolygonCard"), {
  ssr: false,
});
import { useState } from "react";
import { loginWithGoogle, sendOTP } from "@/app/lib/auth";
import { signInWithCredential, PhoneAuthProvider, signInWithEmailAndPassword, type ConfirmationResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { auth } from "@/app/lib/FirebaseConfig";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "phone" | "otp">("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // ================================
  // EMAIL LOGIN
  // ================================
  const handleEmailLogin = async () => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCred.user.getIdToken();
  
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  
    const data = await res.json();
  
    if (data.success) router.push("/");
    else alert(data.error);
  };
  

  // ================================
  // GOOGLE LOGIN
  // ================================
// ✅ GOOGLE LOGIN
const handleGoogleLogin = async () => {
  try {
    const result = await loginWithGoogle();       // Firebase Popup Login
    const idToken = await result.user.getIdToken();   // Get ID Token

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),          // Send ONLY token
    });

    const data = await res.json();

    if (data.success) {
      alert("Google Login Successful");
      router.push("/");
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error("Google login failed:", err);
    alert("Google login failed");
  }
};

  // ================================
  // PHONE — SEND OTP
  // ================================
// ✅ PHONE — SEND OTP
const handleSendOTP = async () => {
  try {
    const result = await sendOTP(phone);  // Firebase Recaptcha + OTP
    setConfirmationResult(result);
    setStep("otp");
  } catch (error) {
    console.error(error);
    alert("Failed to send OTP. Try again.");
  }
};

  // PHONE — VERIFY OTP
const handleOTPVerify = async () => {
  try {
    if (!confirmationResult) {
      alert("OTP session expired. Please request again.");
      return;
    }

    const credential = PhoneAuthProvider.credential(
      confirmationResult.verificationId,
      otp
    );

    // Sign in using phone OTP
    const userCred = await signInWithCredential(auth, credential);
    const idToken = await userCred.user.getIdToken();   // Only token

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),                // Send ONLY token
    });

    const data = await res.json();

    if (data.success) {
      alert("Phone Login Successful");
      router.push("/");
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error(error);
    alert("OTP verification failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 to-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ rotateX: 6, rotateY: -6, scale: 1.02 }}
        className="relative w-[1000px] max-w-full"
      >
        {/* SVG folded polygon card */}
        <div className="mx-auto">
          <svg viewBox="0 0 900 600" className="w-full h-auto">
            <defs>
              {/* main glass gradient */}
              <linearGradient id="gGlass" x1="0" x2="1">
                <stop offset="0%" stopColor="#0b0b0b" stopOpacity="0.85" />
                <stop offset="60%" stopColor="#111827" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0b1220" stopOpacity="0.55" />
              </linearGradient>

              {/* folded highlight gradient */}
              <linearGradient id="gFold" x1="0" x2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#66b3ff" stopOpacity="0.06" />
              </linearGradient>

              {/* neon glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* subtle inner shadow */}
              <filter id="innerShadow">
                <feOffset dx="0" dy="4" result="offOut" />
                <feGaussianBlur in="offOut" stdDeviation="6" result="blurOut" />
                <feComposite in="SourceGraphic" in2="blurOut" operator="over" />
              </filter>

              {/* glossy top sheen */}
              <linearGradient id="sheen" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* soft blue vignette */}
              <radialGradient id="blueV" cx="80%" cy="10%" r="60%">
                <stop offset="0%" stopColor="#66b3ff" stopOpacity="0.18" />
                <stop offset="50%" stopColor="#66b3ff" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#66b3ff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* outer soft shadow/backdrop to emulate floating */}
            <ellipse cx="435" cy="545" rx="300" ry="18" fill="#000" opacity="0.45" />

            {/* main polygon (back face) */}
            <motion.polygon
              points="110,40 790,70 820,420 400,560 60,300 "
              fill="url(#gGlass)"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
              style={{ filter: "url(#innerShadow)" }}
              initial={{ y: 6 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            {/* fold crease (lighter) */}
            <motion.polygon
              points="110,40 420,80 400,560 60,300"
              fill="url(#gFold)"
              opacity="0.35"
              initial={{ opacity: 0.2 }}
              animate={{ opacity: [0.25, 0.45, 0.25] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            />
            {/* main complex polygon background */}
            <motion.polygon
              points="
                      110,40  
                      350,20 
                      520,10  
                      790,70  
                      830,200  
                      820,420  
                      600,520  
                      400,560  
                      220,480  
                      60,300  
                      80,150
                    "
              fill="url(#gGlass)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
              style={{ filter: "url(#innerShadow)" }}
              initial={{ y: 6 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />

            {/* left inner cut */}
            <polygon
              points="90,160 200,120 260,200 150,260"
              fill="url(#gFold)"
              opacity="0.3"
            />

            {/* upper micro cut */}
            <polygon
              points="360,50 450,70 430,110 340,90"
              fill="url(#sheen)"
              opacity="0.4"
              style={{ mixBlendMode: "overlay" }}
            />

            {/* right-side long angular cut */}
            <polygon
              points="650,90 760,110 740,260 620,230"
              fill="url(#blueV)"
              opacity="0.45"
              style={{ filter: "url(#glow)" }}
            />

            {/* deeper inner triangular fold */}
            <polygon
              points="300,250 450,140 600,240 480,360"
              fill="#ffffff"
              opacity="0.04"
              style={{ mixBlendMode: "screen" }}
            />

            {/* bottom shattered shard */}
            <polygon
              points="250,420 340,500 420,530 330,460"
              fill="#ffffff"
              opacity="0.07"
              style={{ mixBlendMode: "overlay" }}
            />

            {/* extra broken-edge highlight */}
            <polyline
              points="130,40 350,55 520,35 780,70"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* top sheen (gloss) */}
            <polygon
              points="120,60 760,85 730,160 180,140"
              fill="url(#sheen)"
              opacity="0.9"
              style={{ mixBlendMode: "overlay" }}
            />

            {/* right neon highlight */}
            <polygon
              points="620,90 820,70 760,360 640,420"
              fill="url(#blueV)"
              opacity="0.5"
              style={{ filter: "url(#glow)" }}
            />

            {/* subtle triangular reflection */}
            <polygon
              points="250,280 410,120 580,200 480,360"
              fill="#ffffff"
              opacity="0.03"
              style={{ mixBlendMode: "screen" }}
            />

            {/* thin top border highlight */}
            <polyline
              points="110,40 790,70"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* content card overlay (positioned over the SVG) */}
        <div className="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="w-[320px] pointer-events-auto">

            <h2 className="text-center text-4xl font-thin tracking-wider text-white mb-8">
              LOGIN
            </h2>

            {/* EMAIL LOGIN UI */}
            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <input
                    aria-label="email"
                    type="email"
                    placeholder="USER NAME"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />

                  <input
                    aria-label="password"
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />

                  <button
                    onClick={handleEmailLogin}
                    className="w-full py-3 mb-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer"
                  >
                    SIGN IN
                  </button>

                  <Link href="" className="text-blue-700 flex justify-end mb-4 cursor-pointer">
                    Forget Password ?
                  </Link>

                  <div className="text-center text-white/70 my-3">OR</div>

                  <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 rounded-lg bg-white/95 text-black font-semibold flex items-center justify-center gap-3 shadow cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden>
                      <path fill="#4285F4" d="M533.5 278.4c0-18.4-1.6-36-4.6-53.2H272v100.8h146.9c-6.3 34-25.6 62.8-54.6 82.1v68.2h88.1c51.6-47.6 81.1-117.6 81.1-197.9z" />
                      <path fill="#34A853" d="M272 544.3c73.6 0 135.6-24.4 180.8-66.3l-88.1-68.2c-24.5 16.5-55.8 26.6-92.7 26.6-71.2 0-131.7-48.1-153.4-112.7H29.9v70.9C75.4 480 167.4 544.3 272 544.3z" />
                      <path fill="#FBBC05" d="M118.6 324.7c-5.6-16.5-8.8-34.1-8.8-52.1s3.2-35.6 8.8-52.1v-70.9H29.9C10.7 197.4 0 234.9 0 272.6s10.7 75.2 29.9 108.9l88.7-57z" />
                      <path fill="#EA4335" d="M272 107.4c39.9 0 75.8 13.7 104.1 40.6l78.1-78.1C407.5 24.6 345.5 0 272 0 167.4 0 75.4 64.3 29.9 162.3l88.7 70.9C140.3 155.5 200.8 107.4 272 107.4z" />
                    </svg>
                    Sign in with Google
                  </button>
                  <button
                    onClick={() => setStep("phone")}
                    className="mt-4 text-center w-full text-gray-300 underline cursor-pointer"
                  >
                    LOGIN WITH PHONE
                  </button>
                </motion.div>
              )}

              {step === "phone" && (
                <motion.div
                  key="phone-step"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                >
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />

                  <button
                    onClick={handleSendOTP}
                    className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition cursor-pointer"
                  >
                    SEND OTP
                  </button>

                  <button
                    onClick={() => setStep("email")}
                    className="mt-4 text-center w-full text-gray-300 underline cursor-pointer"
                  >
                    ← Back to Email Login
                  </button>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                >
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />

                  <button
                    onClick={handleOTPVerify}
                    className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold transition"
                  >
                    VERIFY OTP
                  </button>
                </motion.div>
              )}
            </AnimatePresence>


            {/* OTP VERIFY UI */}
            {step === "otp" && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                />

                <button
                  onClick={handleOTPVerify}
                  className="w-full py-3 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold transition"
                >
                  VERIFY OTP
                </button>
              </>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
