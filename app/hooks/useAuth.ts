"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userCookie = Cookies.get("study_user"); // cookie name from API

    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  return user;
}
