import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  studentId: mongoose.Types.ObjectId;
  seatId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bookingTime: Date;
  expiryTime?: Date;
  status: "active" | "cancelled" | "completed" | "no-show" | "expired";
  source?: "web" | "reception" | "wifi" | "qr";
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  studentId: { type: Schema.Types.ObjectId, required: true, ref: "Student", index: true },
  seatId: { type: Schema.Types.ObjectId, required: true, ref: "Seat", index: true },
  roomId: { type: Schema.Types.ObjectId, required: true, ref: "Room", index: true },

  bookingTime: {
    type: Date,
    default: Date.now,
  },

  expiryTime: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000),
  },

  status: {
    type: String,
    enum: ["active", "cancelled", "completed", "no-show", "expired"],
    default: "active",
  },

  source: {
    type: String,
    enum: ["web", "reception", "wifi", "qr"],
    default: "web",
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

}, { timestamps: true });

// Indexes for quick lookups
BookingSchema.index({ studentId: 1, status: 1 });
BookingSchema.index({ roomId: 1, bookingTime: -1 });

export default mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
