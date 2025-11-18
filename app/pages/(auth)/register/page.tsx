'use client';

import { useState } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { app } from '@/app/lib/FirebaseConfig';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';

const auth = getAuth(app);

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // ---------------- EMAIL/PASSWORD REGISTER ----------------
  const handleEmailRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken(true); // force refresh

      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, provider: 'email', idToken }),
      });

      alert('Registered successfully!');
      router.push('/pages/login');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------------- GOOGLE REGISTER / LOGIN ----------------
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get fresh ID token
      const idToken = await result.user.getIdToken(true);

      // Call login API (it will create Firestore + MongoDB user if missing)
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Login failed');

      alert(`Logged in as ${data.user.name}`);
      router.push('/dashboard'); // redirect after login
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------------- PHONE REGISTER ----------------
  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      );
    }
  };

  const handlePhoneRegister = async () => {
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      alert('OTP sent to phone!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      if (!confirmationResult) throw new Error('No OTP sent yet.');
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken(true);

      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, provider: 'phone', idToken }),
      });

      alert('Phone number registered!');
      router.push('/pages/login');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Paper elevation={3} className="w-full max-w-md p-6 rounded-lg shadow-md">
        <Typography variant="h4" className="text-center mb-6">
          Register
        </Typography>

        {/* Email/Password */}
        <TextField
          fullWidth
          label="Name"
          variant="outlined"
          className="mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          className="mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          className="mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="mb-6"
          onClick={handleEmailRegister}
        >
          Register with Email
        </Button>

        <Divider className="my-6">OR</Divider>

        {/* Google */}
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          className="mb-6"
          onClick={handleGoogleLogin}
        >
          Register / Login with Google
        </Button>

        <Divider className="my-6">OR</Divider>

        {/* Phone */}
        <TextField
          fullWidth
          label="Phone Number"
          placeholder="+911234567890"
          variant="outlined"
          className="mb-4"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="mb-4"
          onClick={handlePhoneRegister}
        >
          Send OTP
        </Button>
        <TextField
          fullWidth
          label="OTP"
          variant="outlined"
          className="mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          fullWidth
          onClick={verifyOtp}
        >
          Verify OTP
        </Button>

        <div id="recaptcha-container" className="mt-4"></div>
      </Paper>
    </Box>
  );
}
