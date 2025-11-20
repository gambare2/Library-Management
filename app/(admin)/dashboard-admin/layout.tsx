// app/admin/layout.tsx
import "@/app/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Admin — Library Management",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <div className="flex h-screen">
          {/* Sidebar */}
          {/* <aside className="w-64 bg-white border-r">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Admin Panel</h2>
              <p className="text-sm text-gray-500">Library Management</p>
            </div>

            <nav className="p-4 space-y-2">
              <a href="/dashboard-admin" className="block py-2 px-3 rounded hover:bg-gray-50">Dashboard</a>
              <a href="/dashboard-admin/room" className="block py-2 px-3 rounded hover:bg-gray-50">Rooms</a>
              <a href="/dashboard-admin/seats" className="block py-2 px-3 rounded hover:bg-gray-50">Seats</a>
              <a href="/dashboard-admin/bookings" className="block py-2 px-3 rounded hover:bg-gray-50">Bookings</a>
              <a href="/dashboard-admin/floormap" className="block py-2 px-3 rounded hover:bg-gray-50">Floor Maps</a>
              <a href="/dashboard-admin/login" className="block py-2 px-3 rounded hover:bg-gray-50 text-red-600">Sign Out</a>
            </nav>
          </aside> */}

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
