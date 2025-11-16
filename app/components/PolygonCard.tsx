"use client";
import { motion } from "framer-motion";

export default function PolygonCard() {
  return (
    <svg viewBox="0 0 900 600" className="w-full h-auto">
      <motion.polygon
        points="110,40 790,70 820,420 400,560 60,300"
        fill="rgba(0,0,0,0.5)"
      />
    </svg>
  );
}
