"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function useAuth() {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const loadUser = () => {
      // Try cookie first
      const userCookie = Cookies.get("study_user");

      if (userCookie) {
        try {
          const parsed = JSON.parse(userCookie);
          setUser(parsed);
          return;
        } catch (e) {}
      }

      // Try localStorage fallback
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          setUser(JSON.parse(lsUser));
          return;
        } catch (e) {}
      }

      setUser(null); // not logged in
    };

    loadUser();

    // Listen for storage changes (login from other tabs)
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  return user;
}
