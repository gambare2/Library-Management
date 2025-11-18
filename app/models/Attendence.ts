import mongoose, { Schema, Document } from "mongoose";

export interface IAttendence extends Document{
    studentId: mongoose.Types.ObjectId;
    dateString: string;
    timestamp: Date;
    method: "wifi" | "qr" | "manual";
    ip?: string;
    meta?: any;
}

const AttendenceSchema = new Schema<IAttendence>({
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    dateString: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    method: { type: String, enum: ["wifi", "qr", "manual"], default: "wifi" },
    ip: { type: String },
    meta: { type: Schema.Types.Mixed },
})

AttendenceSchema.index({ studentId: 1, dateString: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendence>("Attendance", AttendenceSchema);
