import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Coupon from "@/models/Coupon";
import "@/models/Course";

const createSchema = z.object({
  code: z.string().trim().min(3).max(24),
  discountType: z.enum(["PERCENT", "FIXED_USD"]),
  discountValue: z.coerce.number().min(1),
  description: z.string().optional(),
  maxUses: z.coerce.number().min(1).default(100),
  expiresAt: z.string().optional(),
  applicableCourse: z.string().optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const list = await Coupon.find()
    .populate("applicableCourse", "title")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon details" }, { status: 400 });
    }
    const data = parsed.data;
    if (data.discountType === "PERCENT" && data.discountValue > 100) {
      return NextResponse.json({ error: "Percentage cannot exceed 100%" }, { status: 400 });
    }

    await connectDB();
    const code = data.code.toUpperCase().replace(/\s+/g, "");
    if (await Coupon.exists({ code })) {
      return NextResponse.json({ error: `Coupon ${code} already exists` }, { status: 409 });
    }

    const coupon = await Coupon.create({
      code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      description: data.description || "",
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      applicableCourse: data.applicableCourse || null,
    });
    const populated = await Coupon.findById(coupon._id).populate("applicableCourse", "title").lean();
    return NextResponse.json(populated, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
