import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import LessonQuestion from "@/models/LessonQuestion";
import "@/models/User";
import "@/models/Course";
import AdminQAManager from "@/components/admin/AdminQAManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorQAPage() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const filter = scope !== null ? { course: { $in: scope } } : {};

  const questions: any[] = plain(
    await LessonQuestion.find(filter)
      .populate("student", "name email")
      .populate("course", "title slug")
      .sort({ isResolved: 1, createdAt: -1 })
      .lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Cohort Lesson Q&amp;A</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Answer student questions for your assigned courses.
        </p>
      </div>
      <AdminQAManager initialQuestions={questions} />
    </div>
  );
}
