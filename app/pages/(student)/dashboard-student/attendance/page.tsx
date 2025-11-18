"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";

import QRScanner from "@/app/components/QRScanner";

export default function AttendancePage() {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthDays, setMonthDays] = useState<string[]>([]);
  const [monthLoading, setMonthLoading] = useState(false);

  const [stats, setStats] = useState({
    percentage: 0,
    streak: 0,
    longestStreak: 0,
  });

  async function fetchToday() {
    setLoading(true);
    try {
      const res = await fetch("/api/attendence/today", {
        credentials: "include",
      });

      const j = await res.json();
      setAttendance(j.attendance || null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function tryWifiMark() {
    setLoading(true);
    try {
      const res = await fetch("/api/attendence/mark-wifi", {
        method: "POST",
        credentials: "include",
      });

      const j = await res.json();
      if (!j.ok) setError(j.message);
      else setAttendance(j.attendance);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleScan(tokenValue: string | null) {
    if (!tokenValue) return;
    setScannerOpen(false);
    setLoading(true);

    try {
      let token = tokenValue;

      try {
        const u = new URL(tokenValue);
        token = u.searchParams.get("token") || tokenValue;
      } catch { }

      const res = await fetch("/api/attendence/mark-qr", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const j = await res.json();
      if (!j.ok) setError(j.message);
      else setAttendance(j.attendance);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonth(y: number, m: number) {
    setMonthLoading(true);
    try {
      const res = await fetch(`/api/attendence/month?year=${y}&month=${m}`, {
        credentials: "include",
      });

      const j = await res.json();

      if (j.ok) {
        setMonthDays(j.days);

        const daysInMonth = new Date(y, m, 0).getDate();
        const today = new Date();

        let streak = 0,
          longest = 0,
          currentStreak = 0;

        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(y, m - 1, d).toISOString().slice(0, 10);
          const present = j.days.includes(dt);

          if (present) {
            streak++;
            longest = Math.max(longest, streak);
          } else streak = 0;

          if (present && d <= today.getDate()) currentStreak++;
          else if (d <= today.getDate()) currentStreak = 0;
        }

        setStats({
          percentage: Math.round((j.days.length / daysInMonth) * 100),
          streak: currentStreak,
          longestStreak: longest,
        });
      }
    } finally {
      setMonthLoading(false);
    }
  }

  useEffect(() => {
    fetchToday();
    tryWifiMark();
    loadMonth(year, month);
  }, []);

  useEffect(() => {
    loadMonth(year, month);
  }, [month, year]);

  return (
    <Box sx={{ p: 3, maxWidth: 880, mx: "auto" }}>
      {/* ⭐ TOP SUMMARY CARD */}
      <Paper
        elevation={6}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          textAlign: "center",
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.7)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Attendance Overview
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#2e7d32" }}>
              {stats.percentage}%
            </Typography>
            <Typography color="text.secondary">Percentage</Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#0288d1" }}>
              {stats.streak}
            </Typography>
            <Typography color="text.secondary">Current Streak</Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "#6a1b9a" }}>
              {stats.longestStreak}
            </Typography>
            <Typography color="text.secondary">Longest Streak</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 🟢 TODAY */}
      <Card sx={{ borderRadius: 4, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Today's Attendance
          </Typography>

          {loading ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : attendance ? (
            <Box sx={{ mt: 2 }}>
              <Typography>Marked: {new Date(attendance.timestamp).toLocaleString()}</Typography>
              <Typography>Method: {attendance.method}</Typography>
            </Box>
          ) : (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Not marked yet
            </Typography>
          )}

          {error && <Typography color="error">{error}</Typography>}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={() => setScannerOpen(true)}>
              Scan QR
            </Button>
            <Button variant="outlined" onClick={tryWifiMark}>
              Try WiFi Mark
            </Button>
          </Box>

          {scannerOpen && (
            <Box sx={{ mt: 2 }}>
              <QRScanner onScan={(data) => handleScan(data)} />
              <Button onClick={() => setScannerOpen(false)} sx={{ mt: 1 }}>
                Close Scanner
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 📅 MONTH */}
      <Box sx={{ mt: 5 }}>
        {/* NAVIGATION */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              borderRadius: "20px",
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear(year - 1);
              } else setMonth(month - 1);
            }}
          >
            ⬅ Previous
          </Button>

          <Typography
            variant="h5"
            sx={{ fontWeight: 800, letterSpacing: 1 }}
          >
            {new Date(year, month - 1).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </Typography>

          <Button
            variant="outlined"
            sx={{
              borderRadius: "20px",
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear(year + 1);
              } else setMonth(month + 1);
            }}
          >
            Next ➡
          </Button>
        </Box>

        {monthLoading ? (
          <CircularProgress />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            {Array.from({
  length: new Date(year, month, 0).getDate(),
}).map((_, i) => {
  const day = i + 1;

  // Create the date without time
  const checkDate = new Date(year, month - 1, day);
  checkDate.setHours(0, 0, 0, 0);

  // Normalize today date
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const dateStr = checkDate.toISOString().slice(0, 10);
  const present = monthDays.includes(dateStr);

  const isToday = checkDate.getTime() === todayDate.getTime();
  const isFuture = checkDate.getTime() > todayDate.getTime();

  let bgColor = "#d32f2f"; // 🔴 Absent

  if (present) bgColor = "#2e7d32"; // 🟢 Present
  if (isFuture) bgColor = "#1976d2"; // 🔵 Future

  const borderStyle = isToday ? "3px solid #0288d1" : "none";

  return (
    <Box
      key={day}
      sx={{
        p: 1.3,
        borderRadius: 2,
        textAlign: "center",
        fontWeight: 600,
        bgcolor: bgColor,
        color: "white",
        border: borderStyle,
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0 0 8px rgba(0,0,0,0.2)",
          transform: "scale(1.05)",
        },
      }}
    >
      {day}
    </Box>
  );
})}

          </Box>
        )}
      </Box>
    </Box>
  );
}
