// app/admin/seats/page.tsx
"use client";
import useAdminGuard from "@/app/hooks/useAdminGuard";
import { useEffect, useState } from "react";

export default function SeatsPage() {
  useAdminGuard();
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [count, setCount] = useState<number>(10);

  useEffect(() => {
    fetch("/api/admin/rooms/list").then(r => r.json()).then(d => setRooms(d.rooms || []));
  }, []);

  async function addSeats() {
    if (!roomId) return alert("select room");
    await fetch("/api/admin/seats/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, count }),
    });
    alert("Added seats");
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Seats</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2 items-center">
          <select className="p-2 border rounded" onChange={e => setRoomId(e.target.value)} value={roomId}>
            <option value="">Select room</option>
            {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>

          <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="p-2 border rounded w-28" />
          <button onClick={addSeats} className="px-4 py-2 bg-green-600 text-white rounded">Add seats</button>
        </div>
        <p className="text-sm text-gray-500 mt-2">This will create seats labeled 1..N for the selected room.</p>
      </div>
    </div>
  );
}
