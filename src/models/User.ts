import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["STUDENT", "INSTRUCTOR", "ADMIN"], default: "STUDENT" },
    avatar: String,
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    isSuspended: { type: Boolean, default: false },
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.User || model("User", UserSchema);
