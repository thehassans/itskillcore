import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const quiz: any = await Quiz.findById(id).lean();
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const body = await req.json();
  const userAnswers: number[] = body.answers || []; // e.g. [0, 2, 1, 3]

  let correctCount = 0;
  const review = quiz.questions.map((q: any, i: number) => {
    const isCorrect = userAnswers[i] === q.correctIndex;
    if (isCorrect) correctCount++;
    return {
      question: q.question,
      options: q.options,
      selectedIndex: userAnswers[i],
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const total = quiz.questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= (quiz.passingScore || 70);

  const submission = await QuizSubmission.create({
    quiz: id,
    student: session.id,
    course: quiz.course,
    score,
    passed,
    userAnswers,
  });

  return NextResponse.json({
    submissionId: submission._id,
    score,
    passed,
    correctCount,
    total,
    passingScore: quiz.passingScore || 70,
    review,
  });
}
