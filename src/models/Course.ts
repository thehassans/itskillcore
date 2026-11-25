import { Schema, model, models } from "mongoose";

const LessonSchema = new Schema({
  title: { type: String, required: true },
  day: { type: String, default: "" }, // e.g. "Day 1 (Mon)"
  type: {
    type: String,
    enum: ["LECTURE", "ASSIGNMENT", "QUIZ", "WORKSHOP"],
    default: "LECTURE",
  },
  videoUrl: String,
  liveMeetingUrl: String,
  duration: String,
  content: String, // In-depth lecture notes
  presentationUrl: String, // Slide deck / presentation download link
  presentationName: String, // e.g. "Week1_Lecture1_Slides.pdf"
  assignmentPrompt: String, // Specific homework instructions
  timestamps: [
    {
      time: { type: String, required: true }, // e.g. "04:15"
      label: { type: String, required: true }, // e.g. "REST API Route Setup"
    },
  ],
  isFreePreview: { type: Boolean, default: false },
});

const ModuleSchema = new Schema({
  moduleTitle: { type: String, required: true }, // e.g. "Week 1: Foundations & Web Architecture"
  weekNumber: { type: Number, default: 1 },
  lessons: [LessonSchema],
});

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: Number,
    category: { type: String, required: true, index: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: String, // e.g. "3 Months (60 Live Sessions)"
    batchCode: { type: String, default: "Batch 01" },
    batchStartDate: { type: Date, default: Date.now },
    maxSeats: { type: Number, default: 40 },
    assignedInstructor: { type: Schema.Types.ObjectId, ref: "User" },
    cohortSchedule: {
      durationMonths: { type: Number, default: 3 },
      daysPerWeek: { type: Number, default: 5 },
      timing: {
        type: String,
        default: "Monday to Friday · 8:00 PM – 9:30 PM PKT",
      },
      mode: {
        type: String,
        default: "Live Online Classes via Google Meet",
      },
      liveClassLink: {
        type: String,
        default: "https://meet.google.com/itskillcore-live",
      },
    },
    instructor: {
      name: String,
      title: String,
      avatar: String,
      bio: String,
    },
    outcomes: [String],
    curriculum: [ModuleSchema],
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.Course || model("Course", CourseSchema);
