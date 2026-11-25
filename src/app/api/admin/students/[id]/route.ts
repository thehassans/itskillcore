import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const stu: any = await User.findOne({ _id: id, role: "STUDENT" });
  if (!stu) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  if (body.name !== undefined) stu.name = String(body.name).trim();
  if (typeof body.isSuspended === "boolean") stu.isSuspended = body.isSuspended;
  if (body.password && String(body.password).length >= 8) {
    stu.password = await bcrypt.hash(String(body.password), 12);
  }
  await stu.save();

  if (body.assignCourseId) {
    await Enrollment.updateOne(
      { student: stu._id, course: body.assignCourseId },
      {
        $set: {
          student: stu._id,
          course: body.assignCourseId,
          status: "APPROVED",
          paymentReference: "Admin Assigned",
        },
      },
      { upsert: true }
    );
  }

  return NextResponse.json({ ok: true, isSuspended: stu.isSuspended });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  await Promise.all([
    Enrollment.deleteMany({ student: id }),
    User.deleteOne({ _id: id, role: "STUDENT" }),
  ]);
  return NextResponse.json({ ok: true });
}
