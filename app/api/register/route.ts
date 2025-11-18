import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/app/lib/FirebaseAdmin'; // your firebase-admin setup

type Data = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email, password, phoneNumber, name, provider, idToken } = req.body;

  try {
    let userRecord;

    if (provider === 'google' || idToken) {
      // Verify Google ID Token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userRecord = await admin.auth().getUser(decodedToken.uid);
    } else if (email && password) {
      // Create user with email & password
      userRecord = await admin.auth().createUser({
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        displayName: name,
      });
    } else if (phoneNumber) {
      // Create user with phone number only
      userRecord = await admin.auth().createUser({ phoneNumber, displayName: name });
    } else {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Create Firestore user document
    const userRef = admin.firestore().collection('users').doc(userRecord.uid);
    await userRef.set(
      {
        uid: userRecord.uid,
        name: userRecord.displayName || name || null,
        email: userRecord.email || null,
        phoneNumber: userRecord.phoneNumber || null,
        provider: provider || 'custom',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('REGISTER API ERROR:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
