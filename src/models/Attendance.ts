import { Schema, model, models } from "mongoose";

const AttendanceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  lessonTitle: { type: String, default: "Live Cohort Session" },
  dateKey: { type: String, required: true }, // YYYY-MM-DD
  verificationMethod: {
    type: String,
    enum: ["LINK_CLICK", "LIVE_PIN", "MAKEUP_CREDIT", "INSTRUCTOR_MARKED"],
    default: "LINK_CLICK",
  },
  verifiedByInstructor: { type: Boolean, default: false },
  checkInCode: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ student: 1, course: 1, dateKey: 1 }, { unique: true });

export default models.Attendance || model("Attendance", AttendanceSchema);
