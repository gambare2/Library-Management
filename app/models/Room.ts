import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  slug?: string;
  description?: string;
  createdAt: Date;
}

const RoomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  slug: { type: String, index: true, unique: true, sparse: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
