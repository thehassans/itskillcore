import Link from "next/link";
import { BookOpen, Users, FileCheck, MessageSquare, CalendarCheck, Download, KeyRound, ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Submission from "@/models/Submission";
import LessonQuestion from "@/models/LessonQuestion";
import LeaveRequest from "@/models/LeaveRequest";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorOverview() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const courseFilter = scope !== null ? { _id: { $in: scope } } : {};
  const childFilter = scope !== null ? { course: { $in: scope } } : {};

  const [courses, studentCount, pendingSubs, openQuestions, pendingLeaves]: any[] =
    await Promise.all([
      Course.find(courseFilter).select("title slug batchCode cohortSchedule").lean(),
      Enrollment.countDocuments({ status: "APPROVED", ...childFilter }),
      Submission.countDocuments({ status: "SUBMITTED", ...childFilter }),
      LessonQuestion.countDocuments({ isResolved: false, ...childFilter }),
      LeaveRequest.countDocuments({ status: "PENDING", ...childFilter }),
    ]).then((r) => r.map((x: any) => (typeof x === "number" ? x : plain(x))));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl text-slate-900">Instructor Workspace</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Course-scoped teaching console for your assigned IT SkillCore cohorts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/instructor/attendance" className="btn-primary btn-sm">
            <KeyRound size={15} /> Launch Live PIN
          </Link>
          <a href="/api/admin/export?type=gradebook" className="btn-outline btn-sm">
            <Download size={15} /> Export Gradebook CSV
          </a>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white grid grid-cols-2 divide-y divide-slate-200 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        {[
          [BookOpen, "Assigned Cohorts", courses.length],
          [Users, "Active Learners", studentCount],
          [FileCheck, "Pending Grading", pendingSubs],
          [MessageSquare, "Open Q&A", openQuestions],
          [CalendarCheck, "Leave Requests", pendingLeaves],
        ].map(([Icon, l, v]: any) => (
          <div key={l} className="p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{l}</p>
              <Icon size={16} className="text-[#063F38]/60" />
            </div>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      {/* Assigned Courses */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Assigned Cohorts</h2>
          <Link href="/instructor/assignments" className="text-xs font-bold text-[#063F38] hover:underline">
            Manage Assignments →
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            No courses assigned to your instructor profile yet. Ask your Super Admin to assign a cohort under Admin → Instructors.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {courses.map((c: any) => (
              <div key={c._id} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="badge bg-[#F4FFE2] text-[#063F38] font-mono text-[10px]">
                    {c.batchCode || "Batch 01"}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-1">{c.title}</h3>
                  <p className="text-xs text-slate-500">
                    {c.cohortSchedule?.timing || "Monday to Friday · 8:00 PM – 9:30 PM PKT"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/learn/${c.slug}`} className="btn-outline btn-sm text-xs">
                    Classroom View <ArrowRight size={13} />
                  </Link>
                  <Link href="/instructor/attendance" className="btn-primary btn-sm text-xs">
                    Live Roll-Call PIN
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
