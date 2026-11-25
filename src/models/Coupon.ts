import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["PERCENT", "FIXED_USD"], default: "PERCENT" },
    discountValue: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    maxUses: { type: Number, default: 100, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true, index: true },
    applicableCourse: { type: Schema.Types.ObjectId, ref: "Course", default: null },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", CouponSchema);
