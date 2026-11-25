import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Course from "@/models/Course";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const inst: any = await User.findOne({ _id: id, role: "INSTRUCTOR" });
  if (!inst) return NextResponse.json({ error: "Instructor not found" }, { status: 404 });

  if (body.name !== undefined) inst.name = String(body.name).trim();
  if (body.title !== undefined) inst.title = String(body.title).trim();
  if (body.bio !== undefined) inst.bio = String(body.bio).trim();
  if (typeof body.isSuspended === "boolean") inst.isSuspended = body.isSuspended;
  if (body.password && String(body.password).length >= 8) {
    inst.password = await bcrypt.hash(String(body.password), 12);
  }

  if (Array.isArray(body.courseIds)) {
    inst.assignedCourses = body.courseIds;
    // Unassign previously linked courses not in new list
    await Course.updateMany(
      { assignedInstructor: inst._id, _id: { $nin: body.courseIds } },
      { $unset: { assignedInstructor: 1 } }
    );
    if (body.courseIds.length > 0) {
      await Course.updateMany(
        { _id: { $in: body.courseIds } },
        {
          $set: {
            assignedInstructor: inst._id,
            "instructor.name": inst.name,
            "instructor.title": inst.title || "Cohort Instructor",
          },
        }
      );
    }
  }

  await inst.save();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  await Course.updateMany({ assignedInstructor: id }, { $unset: { assignedInstructor: 1 } });
  await User.deleteOne({ _id: id, role: "INSTRUCTOR" });
  return NextResponse.json({ ok: true });
}
