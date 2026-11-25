import { Schema, model, models } from "mongoose";

const ReplySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ["ADMIN", "STUDENT"], default: "STUDENT" },
    message: { type: String, required: true },
    attachmentUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LessonQuestionSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    lessonTitle: { type: String, required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    attachmentUrl: { type: String, default: "" },
    isResolved: { type: Boolean, default: false },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

export default models.LessonQuestion || model("LessonQuestion", LessonQuestionSchema);
