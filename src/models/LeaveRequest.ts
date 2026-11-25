import { Schema, model, models } from "mongoose";

const LeaveRequestSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    dateKey: { type: String, required: true }, // YYYY-MM-DD missed session
    reason: { type: String, required: true },
    makeupSummary: { type: String, default: "" }, // notes proving recording review
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewNote: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ student: 1, course: 1, dateKey: 1 }, { unique: true });

export default models.LeaveRequest || model("LeaveRequest", LeaveRequestSchema);
