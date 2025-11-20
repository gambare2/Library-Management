import mongoose, { Schema, Document } from "mongoose";

export interface ISeat extends Document {
  roomId: mongoose.Types.ObjectId | string;
  label: string;
  number?: number;
  zone?: string;
  status: "available" | "booked" | "blocked" | "maintenance";
  meta?: any; 
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>({
  roomId: { type: Schema.Types.ObjectId, required: true, ref: "Room", index: true },
  label: { type: String, required: true },
  number: Number,
  zone: String,
  status: { type: String, enum: ["available", "booked", "blocked", "maintenance"], default: "available" },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: true });

SeatSchema.index({ roomId: 1, label: 1 }, { unique: true });

export default mongoose.models.Seat || mongoose.model<ISeat>("Seat", SeatSchema);
