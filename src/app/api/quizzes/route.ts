import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import "@/models/Course";
import { getSession, requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");

  const filter: any = courseId ? { course: courseId } : {};
  if (session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    filter.course = courseId && scope?.includes(courseId) ? courseId : { $in: scope || [] };
  }
  const quizzes: any = await Quiz.find(filter)
    .populate("course", "title")
    .sort({ weekNumber: 1, createdAt: -1 })
    .lean();

  if (session.role === "ADMIN" || session.role === "INSTRUCTOR") {
    const withCounts = await Promise.all(
      quizzes.map(async (q: any) => {
        const attemptCount = await QuizSubmission.countDocuments({ quiz: q._id });
        const passedCount = await QuizSubmission.countDocuments({
          quiz: q._id,
          passed: true,
        });
        return { ...q, attemptCount, passedCount };
      })
    );
    return NextResponse.json(withCounts);
  }

  // For students, attach their last attempt
  const withResults = await Promise.all(
    quizzes.map(async (q: any) => {
      const lastResult = await QuizSubmission.findOne({
        quiz: q._id,
        student: session.id,
      })
        .sort({ submittedAt: -1 })
        .lean();
      return { ...q, lastResult };
    })
  );
  return NextResponse.json(withResults);
}

export async function POST(req: NextRequest) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(body.courseId))) {
    return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
  }

  if (!body.title || !body.courseId || !body.questions?.length) {
    return NextResponse.json(
      { error: "Title, courseId, and at least one question are required" },
      { status: 400 }
    );
  }

  const quiz = await Quiz.create({
    course: body.courseId,
    title: body.title.trim(),
    description: body.description || "",
    weekNumber: Number(body.weekNumber) || 1,
    passingScore: Number(body.passingScore) || 70,
    questions: body.questions,
  });

  return NextResponse.json(quiz, { status: 201 });
}
