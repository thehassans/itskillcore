import { Schema, model, models } from "mongoose";

const AttendanceSessionSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lessonTitle: { type: String, default: "Live Class Check-In" },
    dateKey: { type: String, required: true }, // YYYY-MM-DD
    code: { type: String, required: true }, // e.g. 6-char live verification PIN
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

AttendanceSessionSchema.index({ course: 1, dateKey: 1 }, { unique: true });

export default models.AttendanceSession || model("AttendanceSession", AttendanceSessionSchema);
