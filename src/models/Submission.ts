import { Schema, model, models } from "mongoose";

const SubmissionSchema = new Schema(
  {
    assignment: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    studentComment: { type: String, default: "" },
    fileUrl: { type: String, required: true }, // URL to uploaded Word doc, PDF, image, or ZIP
    fileName: { type: String, required: true },
    fileType: { type: String, default: "document" },
    status: {
      type: String,
      enum: ["SUBMITTED", "GRADED", "RESUBMIT"],
      default: "SUBMITTED",
    },
    score: { type: Number, min: 0 },
    feedback: { type: String, default: "" }, // Instructor review notes
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Submission || model("Submission", SubmissionSchema);
