import { auth } from "./FirebaseConfig";
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  UserCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";

// 1. GOOGLE LOGIN
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// 2. EMAIL + PASSWORD LOGIN
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// 3. SEND OTP (PHONE NUMBER LOGIN)
export const sendOTP = async (phone: string): Promise<ConfirmationResult> => {
    if (typeof window === "undefined") {
      throw new Error("Cannot run Recaptcha on server");
    }
  
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,                    // AUTH instance FIRST
        "recaptcha-container",   // Container ID
        { size: "invisible" }    // Config
      );
    }
  
    return await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
  };
  
// 4. VERIFY OTP
export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<UserCredential> => {
  return await confirmationResult.confirm(otp);
};

// 5. TYPE FOR GLOBAL WINDOW
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
