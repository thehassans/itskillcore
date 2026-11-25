import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Course from "@/models/Course";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const course = await Course.findOne(isValidObjectId(id) ? { _id: id } : { slug: id }).lean();
  return course ? NextResponse.json(course) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await connectDB();
    const c = await Course.findByIdAndUpdate(id, await req.json(), { new: true, runValidators: true });
    return c ? NextResponse.json(c) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await connectDB();
  await Course.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
