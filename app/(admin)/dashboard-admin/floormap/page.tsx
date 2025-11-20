// app/admin/floormap/page.tsx
"use client";
import useAdminGuard from "@/app/hooks/useAdminGuard";
import { useEffect, useState } from "react";

export default function FloorMapPage() {
    useAdminGuard();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>("/mnt/data/b5275656-2ca7-491e-83bf-6c0cb40fd227.png"); // sample preview path
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/rooms/list").then(r => r.json()).then(d => setRooms(d.rooms || []));
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function upload() {
    if (!file || !roomId) return alert("Select file and room");
    const form = new FormData();
    form.append("file", file);
    form.append("roomId", roomId);

    const res = await fetch("/api/admin/floormap/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data?.url) {
      alert("Uploaded");
      // Optionally attach url to room via rooms update
      await fetch("/api/admin/rooms/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, updates: { floorMapUrl: data.url } }),
      });
      // reload rooms
    } else {
      alert("Upload failed");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Floor Maps</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-2">
          <select className="p-2 border rounded" onChange={(e) => setRoomId(e.target.value)} value={roomId}>
            <option value="">Select room</option>
            {rooms.map(r => <option value={r._id} key={r._id}>{r.name}</option>)}
          </select>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button onClick={upload} className="px-4 py-2 bg-purple-600 text-white rounded">Upload</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Preview</h2>
        {preview ? (
          <img src={preview} alt="floor map preview" className="max-w-full h-auto border" />
        ) : (
          <div className="text-gray-500">No preview</div>
        )}
      </div>
    </div>
  );
}
