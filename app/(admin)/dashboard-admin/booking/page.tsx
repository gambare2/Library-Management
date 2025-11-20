// app/admin/bookings/page.tsx
"use client";
import { useEffect, useState } from "react";
import useAdminGuard from "@/app/hooks/useAdminGuard";

export default function BookingsPage() {
  useAdminGuard();
  const [bookings, setBookings] = useState<any[]>([]);

  async function load() {
    const res = await fetch("/api/admin/bookings/list");
    const data = await res.json();
    setBookings(data.bookings || []);
  }

  async function cancel(bid: string) {
    if (!confirm("Cancel booking?")) return;
    await fetch("/api/admin/bookings/cancel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: bid }),
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Bookings</h1>

      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b._id} className="bg-white p-4 rounded flex justify-between items-center">
            <div>
              <div className="font-medium">User: {b.studentId}</div>
              <div className="text-sm text-gray-500">Room: {b.roomId?.name ?? b.roomId} • Seat: {b.seatId?.seatNumber ?? b.seatId}</div>
              <div className="text-sm text-gray-400">Status: {b.status}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => cancel(b._id)} className="px-3 py-1 bg-red-500 text-white rounded">Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
