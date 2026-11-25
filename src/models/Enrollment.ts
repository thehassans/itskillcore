import { Schema, model, models } from "mongoose";

const EnrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
  progress: { type: [String], default: [] },
  paymentReference: String,
  couponCode: { type: String, default: "" },
  discountAmountUSD: { type: Number, default: 0 },
  finalPriceUSD: Number,
  accessLocked: { type: Boolean, default: false },
  lockReason: { type: String, default: "" },
  enrolledAt: { type: Date, default: Date.now },
});
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default models.Enrollment || model("Enrollment", EnrollmentSchema);
