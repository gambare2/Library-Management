"use client";

import useAdminGuard from "@/app/hooks/useAdminGuard";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Box, 
  Typography
} from "@mui/material";

type Room = { _id: string; name: string; seatCount?: number };

export default function RoomsPage() {
  useAdminGuard();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [name, setName] = useState("");
  const [seatCount, setSeatCount] = useState<number | "">("");
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  // Load rooms and seat counts
  async function load() {
    try {
      const resRooms = await fetch("/api/admin/rooms/list");
      const dataRooms = await resRooms.json();
      const roomsList: Room[] = dataRooms.rooms || [];

      const resSeats = await fetch("/api/admin/seats/list");
      const dataSeats = await resSeats.json();
      const seatsList = dataSeats.seats || [];

      const roomsWithSeats = roomsList.map(room => ({
        ...room,
        seatCount: seatsList.filter((s: any) => s.roomId === room._id).length
      }));

      setRooms(roomsWithSeats);
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  }

  async function addRoom() {
    if (!name || seatCount === "") return;
  
    // Create room
    const res = await fetch("/api/admin/rooms/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    const roomId = data.room._id;
  
    // Generate a short unique room code, e.g., first 3 letters + timestamp
    const roomCode = name.trim().slice(0, 3).toUpperCase() + Date.now().toString().slice(-4);
  
    // Create seats with unique, friendly labels
    for (let i = 0; i < Number(seatCount); i++) {
      const seatLabel = `${roomCode}-S${i + 1}`;
      await fetch("/api/admin/seats/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          label: seatLabel
        }),
      });
    }
  
    setName("");
    setSeatCount("");
    load();
  }
  

  async function updateRoom() {
    if (!editing) return;

    // Update room name
    await fetch("/api/admin/rooms/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: editing._id, updates: { name: editing.name } }),
    });

    // Update seats: first delete all current seats for room
    await fetch("/api/admin/seats/deleteByRoom", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: editing._id }),
    });

    // Add new seat count
    for (let i = 0; i < (editing.seatCount || 0); i++) {
      await fetch("/api/admin/seats/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: editing._id }),
      });
    }

    setEditing(null);
    load();
  }

  async function deleteRoom() {
    if (!deleteRoomId) return;

    // Delete room
    await fetch("/api/admin/rooms/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: deleteRoomId }),
    });

    // Delete seats
    await fetch("/api/admin/seats/deleteByRoom", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: deleteRoomId }),
    });

    setDeleteRoomId(null);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">Rooms & Seats</h1>

      {/* Add / Edit Room */}
      <Card sx={{ maxWidth: 420, width: "100%", mb: 3, p: 1, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Room Name */}
            <TextField
              label="Room Name"
              variant="filled"
              fullWidth
              value={editing ? editing.name : name}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, name: e.target.value })
                  : setName(e.target.value)
              }
            />

            {/* Seat Count */}
            <TextField
              label="Number of Seats"
              type="number"
              variant="filled"
              fullWidth
              value={editing ? editing.seatCount || 0 : seatCount}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, seatCount: Number(e.target.value) })
                  : setSeatCount(e.target.value ? Number(e.target.value) : "")
              }
            />

            {/* Buttons */}
            <Box display="flex" justifyContent="center" gap={2}>
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={updateRoom}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={addRoom}>
                  Add Room
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Rooms List */}
      <Stack
      spacing={2}
      sx={{ width: "100%", maxWidth: 420 }}
    >
      {rooms.map((r) => (
        <Card
          key={r._id}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            p: 1,
          }}
        >
          <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            
            {/* Left: Name + Seats */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {r.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Seats: {r.seatCount ?? 0}
              </Typography>
            </Box>

            {/* Right: Buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => setEditing({ ...r })}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => setDeleteRoomId(r._id)}
              >
                Delete
              </Button>
            </Stack>

          </CardContent>
        </Card>
      ))}
    </Stack>

      {/* Delete Confirmation Modal */}
      {deleteRoomId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Delete Room?</h2>
            <p>Are you sure you want to delete this room and all its seats?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteRoomId(null)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={deleteRoom} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
