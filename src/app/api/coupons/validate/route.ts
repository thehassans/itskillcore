import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import Course from "@/models/Course";
import { applyCouponDiscount } from "@/lib/academic";
import { finalPrice } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { code, courseId } = await req.json();
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized || !courseId) {
      return NextResponse.json({ error: "Enter a coupon code" }, { status: 400 });
    }

    await connectDB();
    const [coupon, course]: any[] = await Promise.all([
      Coupon.findOne({ code: normalized }).lean(),
      Course.findById(courseId).select("price discountPrice title").lean(),
    ]);

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    if (!coupon) return NextResponse.json({ error: "Invalid coupon or scholarship code" }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ error: "This coupon is currently paused" }, { status: 400 });
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its redemption limit" }, { status: 400 });
    }
    if (coupon.applicableCourse && String(coupon.applicableCourse) !== String(course._id)) {
      return NextResponse.json({ error: "Coupon is not valid for this cohort" }, { status: 400 });
    }

    const basePriceUSD = finalPrice(course);
    const { discountUSD, finalUSD } = applyCouponDiscount(basePriceUSD, coupon);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
      basePriceUSD,
      discountUSD,
      finalUSD,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not validate coupon" }, { status: 500 });
  }
}
