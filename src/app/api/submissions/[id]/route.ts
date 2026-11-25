import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const submission = await Submission.findById(id);
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(submission.course))) {
    return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
  }

  if (body.score !== undefined) submission.score = Number(body.score);
  if (body.feedback !== undefined) submission.feedback = String(body.feedback);
  if (body.status) submission.status = body.status;
  submission.gradedAt = new Date();

  await submission.save();

  return NextResponse.json(submission);
}
