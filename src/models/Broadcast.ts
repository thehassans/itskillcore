import { Schema, model, models } from "mongoose";

const BroadcastSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  linkUrl: { type: String, required: true },
  linkLabel: { type: String, default: "Open Link" },
  target: { type: String, enum: ["ALL", "COURSE"], default: "ALL" },
  course: { type: Schema.Types.ObjectId, ref: "Course" },
  senderName: { type: String, default: "IT SkillCore Administration" },
  createdAt: { type: Date, default: Date.now },
});

export default models.Broadcast || model("Broadcast", BroadcastSchema);
