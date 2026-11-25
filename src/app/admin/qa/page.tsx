import { connectDB } from "@/lib/db";
import LessonQuestion from "@/models/LessonQuestion";
import "@/models/User";
import "@/models/Course";
import AdminQAManager from "@/components/admin/AdminQAManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminQAPage() {
  await connectDB();
  const questions: any[] = plain(
    await LessonQuestion.find()
      .populate("student", "name email")
      .populate("course", "title slug")
      .sort({ isResolved: 1, createdAt: -1 })
      .lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Student Lesson Q&amp;A Inbox</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Answer student questions posted per live recording/lesson. Replies appear publicly inside that lesson&apos;s cohort thread.
        </p>
      </div>
      <AdminQAManager initialQuestions={questions} />
    </div>
  );
}
