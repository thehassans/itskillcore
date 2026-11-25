import { Schema, model, models } from "mongoose";

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});

const QuizSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    weekNumber: { type: Number, default: 1 },
    passingScore: { type: Number, default: 70 }, // percentage
    questions: [QuestionSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Quiz || model("Quiz", QuizSchema);
