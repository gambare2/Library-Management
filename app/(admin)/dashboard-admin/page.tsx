"use client";

import { useEffect, useState } from "react";

interface Stats {
  rooms: number;
  seats: number;
}

export default function AdminHome() {
  const [stats, setStats] = useState<Stats>({ rooms: 0, seats: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Fetch rooms
        const r1 = await fetch("/api/admin/rooms/list").then(r => r.json());
        const roomsCount = (r1.rooms || []).length;

        // Fetch seats
        const r2 = await fetch("/api/admin/seats/list").then(r => r.json());
        const seatsCount = (r2.seats || []).length;

        setStats({ rooms: roomsCount, seats: seatsCount });
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Error loading stats");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Rooms</div>
          <div className="text-2xl font-semibold">{stats.rooms}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Seats</div>
          <div className="text-2xl font-semibold">{stats.seats}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Bookings</div>
          <div className="text-2xl font-semibold">0</div>
        </div>
      </div>
    </div>
  );
}
