import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import { getSession, requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const assignment: any = await Assignment.findById(id).populate("course", "title").lean();
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  if (session.role === "ADMIN" || session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    const cid = String(assignment.course?._id || assignment.course);
    if (scope !== null && !scope.includes(cid)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const submissions = await Submission.find({ assignment: id })
      .sort({ submittedAt: -1 })
      .populate("student", "name email avatar")
      .lean();
    return NextResponse.json({ assignment, submissions });
  }

  // Student view
  const mySubmission = await Submission.findOne({
    assignment: id,
    student: session.id,
  }).lean();

  return NextResponse.json({ assignment, mySubmission });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const assignment: any = await Assignment.findById(id).lean();
  if (!assignment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(assignment.course))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Promise.all([
    Assignment.findByIdAndDelete(id),
    Submission.deleteMany({ assignment: id }),
  ]);

  return NextResponse.json({ ok: true });
}
