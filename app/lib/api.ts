import { auth } from "@/app/lib/FirebaseConfig";

export async function apiFetch(url: string, options: any = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : "";

  return fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
