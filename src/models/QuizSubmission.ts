import { Schema, model, models } from "mongoose";

const QuizSubmissionSchema = new Schema(
  {
    quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    score: { type: Number, required: true }, // percentage e.g. 85
    passed: { type: Boolean, required: true },
    userAnswers: [Number], // array of chosen indices
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.QuizSubmission || model("QuizSubmission", QuizSubmissionSchema);
