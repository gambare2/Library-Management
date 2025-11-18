import mongoose, { Schema, Document } from "mongoose";

export interface IQrcode extends Document{
    token: string;
    validUntil: Date;
    used: boolean;
    createdBy?: string;
    createdAt: Date;
}

const QrCodeSchema = new Schema<IQrcode>({
    token: { type: String, required: true, unique: true },
    validUntil: { type: Date, required: true },
    used: { type: Boolean, default: false },
    createdBy: { type: String },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.QrCode || mongoose.model<IQrcode>("QrCode", QrCodeSchema)