"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAdminGuard() {
  const router = useRouter();

  useEffect(() => {
    const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const adminToken = cookies["admin_token"];

    if (!adminToken) {
      router.push("/pages/login");
    }
  }, [router]);
}
