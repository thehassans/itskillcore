import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Coupon from "@/models/Coupon";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const patch: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
  if (typeof body.maxUses === "number" && body.maxUses >= 1) patch.maxUses = body.maxUses;
  if (typeof body.description === "string") patch.description = body.description;

  const updated = await Coupon.findByIdAndUpdate(id, { $set: patch }, { new: true })
    .populate("applicableCourse", "title")
    .lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  const deleted = await Coupon.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
