import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  firebaseUID: string;
  name?: string;
  email?: string;
  phone?: string;
  provider: "email" | "google" | "phone";
  studentId?: string;
  photo?: string;
  macAddresses?: string[];
  createdAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  firebaseUID: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  studentId: { type: String },
  provider: { type: String, required: true },
  photo: { type: String },
  macAddresses: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// 🚀 UNIQUE only when NOT NULL
StudentSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true, $ne: null } } }
);

StudentSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: null } } }
);

StudentSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { studentId: { $exists: true, $ne: null } } }
);

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);
