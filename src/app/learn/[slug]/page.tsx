import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Lock, CreditCard, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import LessonQuestion from "@/models/LessonQuestion";
import Player from "@/components/dashboard/Player";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Learn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getSession();
  if (!s) redirect(`/login?next=/learn/${slug}`);
  await connectDB();

  const course: any = plain(await Course.findOne({ slug }).lean());
  if (!course) notFound();

  const enr: any = plain(
    await Enrollment.findOne({ student: s.id, course: course._id, status: "APPROVED" }).lean()
  );
  if (!enr && s.role !== "ADMIN") redirect("/dashboard");

  // Enforce automatic cohort access lock if installment is overdue
  if (enr?.accessLocked && s.role !== "ADMIN") {
    return (
      <main className="min-h-screen bg-[#fbfdfb] grid place-items-center p-6">
        <div className="card max-w-lg w-full p-8 text-center border-[#063F38]/20 shadow-xl space-y-5 bg-white">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#C9FA52]/45 text-[#063F38]">
            <Lock size={32} />
          </span>
          <span className="badge bg-[#C9FA52]/45 text-[#063F38] text-xs font-bold uppercase tracking-wider">
            Installment Verification Required
          </span>
          <h1 className="h-display text-2xl font-extrabold text-slate-900">
            Cohort Classroom Access Paused
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {enr.lockReason ||
              "An installment for this cohort is currently overdue. Please submit your JazzCash, EasyPaisa, or Bank Transfer receipt in your Student Dashboard to restore instant access."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <Link href="/dashboard" className="btn-accent">
              <CreditCard size={16} /> Pay / Upload Receipt
            </Link>
            <Link href="/courses" className="btn-outline">
              <ArrowLeft size={16} /> Browse Courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch course assignments, student submissions, quizzes, and lesson Q&A threads
  const [assignments, submissions, quizzes, questions]: any[] = await Promise.all([
    Assignment.find({ course: course._id }).sort({ weekNumber: 1, dueDate: 1 }).lean(),
    Submission.find({ course: course._id, student: s.id }).lean(),
    Quiz.find({ course: course._id }).sort({ weekNumber: 1 }).lean(),
    LessonQuestion.find({ course: course._id })
      .populate("student", "name avatar")
      .sort({ isResolved: 1, createdAt: -1 })
      .lean(),
  ]).then(plain);

  return (
    <Player
      course={course}
      enrollmentId={enr?._id ?? null}
      initialDone={enr?.progress ?? []}
      assignments={assignments}
      initialSubmissions={submissions}
      quizzes={quizzes}
      initialQuestions={questions}
      currentUserRole={s.role}
    />
  );
}
