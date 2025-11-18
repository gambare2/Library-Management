import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  firebaseUID: string;      // 🔥 MUST ADD
  name: string;
  email: string;
  phone?: string;
  studentId: string;
  photo?: string;
  macAddresses?: string[];
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  firebaseUID: { type: String, required: true, unique: true }, // 🔥 REQUIRED
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  studentId: { type: String, required: true, unique: true },
  photo: { type: String },
  macAddresses: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);
