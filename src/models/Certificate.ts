import { Schema, model, models } from "mongoose";

const CertificateSchema = new Schema({
  certificateId: { type: String, required: true, unique: true },
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  issuedAt: { type: Date, default: Date.now },
  customNote: String,
  attendancePct: Number,
  homeworkAvg: Number,
  quizScore: Number,
  overrideGate: { type: Boolean, default: false },
  isRevoked: { type: Boolean, default: false },
  revokedReason: { type: String, default: "" },
});

export default models.Certificate || model("Certificate", CertificateSchema);
