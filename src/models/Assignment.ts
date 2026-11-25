import { Schema, model, models } from "mongoose";

const AttachmentSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: "pdf" },
  },
  { _id: false }
);

const AssignmentSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonTitle: { type: String, default: "" }, // optional link to specific day/lesson
    title: { type: String, required: true },
    description: { type: String, required: true }, // Homework details / problem statement
    weekNumber: { type: Number, default: 1 },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100 },
    attachments: [AttachmentSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

if (models.Assignment) {
  delete (models as any).Assignment;
}

export default models.Assignment || model("Assignment", AssignmentSchema);
