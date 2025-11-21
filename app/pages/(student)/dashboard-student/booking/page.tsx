"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
} from "@mui/material";

// Fetch current logged-in student
async function getCurrentStudent() {
  try {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("study_user="));
    if (!cookie) return null;

    const cookieValue = decodeURIComponent(cookie.split("=")[1]);
    const user = JSON.parse(cookieValue);
    if (!user?.uid) return null;

    const res = await fetch(`/api/students/by-uid?uid=${user.uid}`);
    const data = await res.json();
    return data?.student || null;
  } catch {
    return null;
  }
}

export default function BookSeatPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [selectedSeat, setSelectedSeat] = useState<string>("");

  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [booking, setBooking] = useState(false);

  const [myBookedSeatId, setMyBookedSeatId] = useState<string | null>(null);
  const timeSlots = [
    "06:00", "07:00", "08:00", "09:00",
    "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00",
    "22:00"
  ];

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");


  useEffect(() => {
    async function fetchStudent() {
      const student = await getCurrentStudent();
      if (student) {
        setStudentId(student._id);
      }
    }
    fetchStudent();
  }, []);

  useEffect(() => {
    async function fetchRooms() {
      setLoadingRooms(true);
      try {
        const res = await fetch("/api/admin/rooms/list");
        const data = await res.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, []);

  // Load seats for selected room
  const loadSeats = async (id: string) => {
    if (!studentId) return;

    setRoomId(id);
    setSeats([]);
    setSelectedSeat("");
    setLoadingSeats(true);

    try {
      // Fetch seats
      const resSeats = await fetch("/api/admin/seats/list");
      const seatsData = await resSeats.json();
      const roomSeats = (seatsData.seats || []).filter((s: any) => s.roomId === id);

      // Fetch bookings
      const resBookings = await fetch(`/api/booking/list?roomId=${id}`);
      const bookingsData = await resBookings.json();
      const bookings = bookingsData.bookings || [];

      // Merge
      const updatedSeats = roomSeats.map((s: any) => {
        const booking = bookings.find((b: any) => b.seatId === s._id);
        return {
          ...s,
          isBooked: !!booking,
          isMine: booking?.studentId === studentId,
        };
      });

      setSeats(updatedSeats);
    } catch (err) {
      console.error("Error loading seats:", err);
    } finally {
      setLoadingSeats(false);
    }
  };


  const bookSeat = async () => {
    if (!studentId) return alert("You are not logged in!");
    if (!roomId || !selectedSeat) return alert("Select a room and seat!");

    setBooking(true);
    console.log("Start:", startTime, "End:", endTime);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          roomId,
          seatId: selectedSeat,
          startTime,
          endTime,
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Seat booked successfully!");
        loadSeats(roomId); // refresh seats
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed. Check console for details.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={3} fontWeight={700}>
        Book a Seat
      </Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Start Time</InputLabel>
        <Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          {timeSlots.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>End Time</InputLabel>
        <Select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
          {timeSlots
            .filter(t => t > startTime) // End must be after start
            .map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Room</InputLabel>
        <Select
          value={roomId}
          label="Select Room"
          onChange={(e) => loadSeats(e.target.value)}
          disabled={loadingRooms}
        >
          {rooms.map((r) => (
            <MenuItem key={r._id} value={r._id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loadingSeats && <CircularProgress />}

      {roomId && !loadingSeats && (
        <Grid container spacing={2} mb={3}>
          {seats.map((s) => {
            const isDisabled = s.isBooked && !s.isMine;
            return (
              <Card
                key={s._id}
                onClick={() => !isDisabled && setSelectedSeat(s._id)}
                sx={{
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  border: s.isMine
                    ? "2px solid #1976d2" // BLUE BORDER FOR MY SEAT
                    : selectedSeat === s._id
                      ? "2px solid #1976d2"
                      : "1px solid #ccc",

                  backgroundColor: s.isMine
                    ? "#E3F2FD" /* Blue background */
                    : s.isBooked
                      ? "#f0f0f0" /* Gray background for others */
                      : "#fff",   /* White for free seats */

                  opacity: s.isBooked && !s.isMine ? 0.6 : 1,
                  textAlign: "center",
                }}
              >
                <CardContent>
                  <Typography fontWeight={600}>{s.label}</Typography>

                  {s.isBooked && !s.isMine && (
                    <Typography variant="caption" color="error">
                      Booked
                    </Typography>
                  )}

                  {s.isMine && (
                    <Typography variant="caption" color="primary">
                      Your Seat
                    </Typography>
                  )}
                </CardContent>
              </Card>

            );
          })}
        </Grid>
      )}



      {selectedSeat && selectedSeat !== myBookedSeatId && (
        <Button
          variant="contained"
          fullWidth
          onClick={bookSeat}
          disabled={booking}
        >
          {booking ? <CircularProgress size={20} /> : "Confirm Booking"}
        </Button>
      )}
    </Box>
  );
}
