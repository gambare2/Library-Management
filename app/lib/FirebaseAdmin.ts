import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
    
    }),
  });
  console.log("Firebase key loaded?", !!process.env.FIREBASE_PRIVATE_KEY);
}

// Export admin instance (correct)
export default admin;
