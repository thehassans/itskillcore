import { Schema, model, models } from "mongoose";

const FeeInstallmentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    enrollment: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
    installmentNumber: { type: Number, required: true, min: 1, max: 6 },
    monthLabel: { type: String, required: true }, // e.g. "Month 1 Tuition"
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paymentMethod: {
      type: String,
      enum: ["JazzCash", "EasyPaisa", "Bank Transfer", "Cash"],
      default: "JazzCash",
    },
    transactionId: { type: String, default: "" },
    receiptUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["UNPAID", "SUBMITTED", "VERIFIED", "OVERDUE", "REJECTED"],
      default: "UNPAID",
      index: true,
    },
    adminNote: { type: String, default: "" },
    submittedAt: Date,
    verifiedAt: Date,
  },
  { timestamps: true }
);

FeeInstallmentSchema.index({ student: 1, course: 1, installmentNumber: 1 }, { unique: true });

export default models.FeeInstallment || model("FeeInstallment", FeeInstallmentSchema);
