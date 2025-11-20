import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/app/components/Navbar";  // ✅ Import here

export const metadata: Metadata = {
  title: "Library Management System",
  description: "Generated for maintaining Library very well",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* 🔵 Navbar visible on all pages */}
        <Navbar />    

        {/* 🔵 Page content */}
        {children}
      </body>
    </html>
  );
}
