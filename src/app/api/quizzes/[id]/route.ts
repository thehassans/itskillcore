import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import "@/models/User";
import "@/models/Course";
import { requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const quiz: any = await Quiz.findById(id).populate("course", "title").lean();
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const scope = await getTeacherCourseIds(teacher);
  const cid = String(quiz.course?._id || quiz.course);
  if (scope !== null && !scope.includes(cid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const submissions = await QuizSubmission.find({ quiz: id })
    .populate("student", "name email")
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json({ quiz, submissions });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const quiz: any = await Quiz.findById(id).lean();
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(quiz.course))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Quiz.findByIdAndDelete(id);
  await QuizSubmission.deleteMany({ quiz: id });

  return NextResponse.json({ ok: true });
}
