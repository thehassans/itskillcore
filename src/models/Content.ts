import { Schema, model, models } from "mongoose";

export const Blog = models.Blog || model("Blog", new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String, content: String, coverImage: String, author: String,
  tags: [String], publishedAt: { type: Date, default: Date.now },
}));

export const FAQ = models.FAQ || model("FAQ", new Schema({
  question: { type: String, required: true }, answer: { type: String, required: true },
  category: String, order: { type: Number, default: 0 },
}));

export const ContactMessage = models.ContactMessage || model(
  "ContactMessage",
  new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      subject: { type: String, required: true },
      message: { type: String, required: true },
      status: {
        type: String,
        enum: ["NEW", "IN_PROGRESS", "RESOLVED"],
        default: "NEW",
        index: true,
      },
      adminNotes: { type: String, default: "" },
      resolvedAt: Date,
    },
    { timestamps: true }
  )
);
