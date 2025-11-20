// app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      // POST to your admin auth route (create if missing)
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setErr(data?.message || "Login failed");
      }
    } catch (e) {
      setErr("Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Admin Login</h2>

      <form onSubmit={handleLogin} className="space-y-3">
        <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border rounded" />
        <div className="flex items-center justify-between">
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
        {err && <div className="text-red-600">{err}</div>}
      </form>
    </div>
  );
}
