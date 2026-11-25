import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import LessonQuestion from "@/models/LessonQuestion";
import "@/models/User";
import "@/models/Course";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");

  const filter: any = {};
  if (courseId) filter.course = courseId;
  if (lessonId) filter.lessonId = lessonId;

  const list = await LessonQuestion.find(filter)
    .populate("student", "name email avatar")
    .populate("course", "title slug")
    .sort({ isResolved: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { courseId, lessonId, lessonTitle, question, attachmentUrl = "" } = body;

  if (!courseId || !lessonId || !question?.trim()) {
    return NextResponse.json(
      { error: "courseId, lessonId and question text are required" },
      { status: 400 }
    );
  }

  const created = await LessonQuestion.create({
    course: courseId,
    lessonId: String(lessonId),
    lessonTitle: lessonTitle || "Live Session",
    student: session.id,
    question: question.trim(),
    attachmentUrl,
  });

  const populated = await LessonQuestion.findById(created._id)
    .populate("student", "name email avatar")
    .lean();

  return NextResponse.json(populated, { status: 201 });
}
