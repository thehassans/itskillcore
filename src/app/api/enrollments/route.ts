import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Coupon from "@/models/Coupon";
import { applyCouponDiscount } from "@/lib/academic";
import { finalPrice } from "@/lib/utils";

// Admin: all enrollments (optional ?status=). Student: own enrollments.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const status = new URL(req.url).searchParams.get("status");
  const filter: Record<string, unknown> = session.role === "ADMIN" ? {} : { student: session.id };
  if (status) filter.status = status;
  const list = await Enrollment.find(filter)
    .sort({ enrolledAt: -1 })
    .populate("student", "name email")
    .populate("course", "title slug price discountPrice thumbnail curriculum")
    .lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in to enroll" }, { status: 401 });
    const { courseId, paymentReference, couponCode } = await req.json();
    await connectDB();

    const course: any = await Course.findOne({ _id: courseId, isPublished: true })
      .select("_id price discountPrice")
      .lean();
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (await Enrollment.exists({ student: session.id, course: courseId })) {
      return NextResponse.json({ error: "You already requested this course" }, { status: 409 });
    }

    const baseUSD = finalPrice(course);
    let appliedCode = "";
    let discountAmountUSD = 0;
    let finalPriceUSD = baseUSD;

    const cleanCode = String(couponCode || "").trim().toUpperCase();
    if (cleanCode && baseUSD > 0) {
      const now = new Date();
      const coupon: any = await Coupon.findOneAndUpdate(
        {
          code: cleanCode,
          isActive: true,
          $expr: { $lt: ["$usedCount", "$maxUses"] },
          $and: [
            { $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
            { $or: [{ applicableCourse: null }, { applicableCourse: course._id }] },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      ).lean();

      if (!coupon) {
        return NextResponse.json(
          { error: "Coupon code is invalid, expired, or ineligible for this cohort" },
          { status: 400 }
        );
      }

      const calc = applyCouponDiscount(baseUSD, coupon);
      appliedCode = coupon.code;
      discountAmountUSD = calc.discountUSD;
      finalPriceUSD = calc.finalUSD;
    }

    const e = await Enrollment.create({
      student: session.id,
      course: courseId,
      paymentReference,
      couponCode: appliedCode,
      discountAmountUSD,
      finalPriceUSD,
      status: "PENDING",
    });
    return NextResponse.json(e, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
