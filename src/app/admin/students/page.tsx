import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Submission from "@/models/Submission";
import QuizSubmission from "@/models/QuizSubmission";
import Certificate from "@/models/Certificate";
import Attendance from "@/models/Attendance";
import CreateStudentForm from "@/components/admin/CreateStudentForm";
import StudentRowActions from "@/components/admin/StudentRowActions";
import { plain } from "@/lib/utils";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Students() {
  await connectDB();
  const [students, courses, enr, subs, quizSubs, certs, attendanceList]: any[] = await Promise.all([
    User.find({ role: "STUDENT" }).sort({ createdAt: -1 }).lean(),
    Course.find().select("title").lean(),
    Enrollment.find().populate("course", "title curriculum").lean(),
    Submission.find().select("student status score").lean(),
    QuizSubmission.find().select("student passed score").lean(),
    Certificate.find().select("student certificateId isRevoked").lean(),
    Attendance.find().select("student").lean(),
  ]).then(plain);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="h-display text-2xl text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enrolled cohorts, milestone metrics, verified credentials, and account controls.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/admin/export?type=students" className="btn-outline btn-sm">
            <Download size={14} /> Export CSV
          </a>
          <CreateStudentForm courses={courses} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Student</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Cohorts</th>
              <th className="px-4 py-3">Performance</th>
              <th className="px-4 py-3">Credentials</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s: any) => {
              const mine = enr.filter((e: any) => e.student === s._id && e.course);
              const mySubs = subs.filter((x: any) => x.student === s._id);
              const gradedSubs = mySubs.filter((x: any) => x.status === "GRADED" && x.score != null);
              const avgScore = gradedSubs.length
                ? Math.round(gradedSubs.reduce((sum: number, x: any) => sum + x.score, 0) / gradedSubs.length)
                : null;
              const myQuizzes = quizSubs.filter((q: any) => q.student === s._id);
              const passedQuizzes = myQuizzes.filter((q: any) => q.passed).length;
              const myCerts = certs.filter((c: any) => c.student === s._id && !c.isRevoked);
              const myAttendance = attendanceList.filter((a: any) => a.student === s._id).length;

              return (
                <tr key={s._id} className="hover:bg-slate-50/60 transition align-top">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#063F38]/15 bg-[#F4FFE2] text-xs font-bold text-[#063F38]">
                        {s.name?.[0] || "S"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 whitespace-nowrap">{s.name}</span>
                          {s.isSuspended && (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[210px]">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-500">
                    {new Date(s.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-4 py-3.5 min-w-[200px] max-w-[240px]">
                    {mine.length ? (
                      <div className="space-y-2">
                        {mine.map((e: any) => {
                          const totalLessons = (e.course?.curriculum || []).reduce(
                            (sum: number, m: any) => sum + (m.lessons?.length || 0),
                            0
                          );
                          const completed = Array.isArray(e.progress) ? e.progress.length : 0;
                          const pct = totalLessons ? Math.min(100, Math.round((completed / totalLessons) * 100)) : 0;

                          return (
                            <div key={e._id} className="space-y-1">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate font-medium text-slate-700" title={e.course.title}>
                                  {e.course.title}
                                </span>
                                <span className="shrink-0 font-mono text-[11px] font-semibold text-[#063F38]">
                                  {e.status === "APPROVED" ? `${pct}%` : e.status}
                                </span>
                              </div>
                              {e.status === "APPROVED" && (
                                <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#063F38]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 tabular-nums">
                    <div className="space-y-0.5 font-mono text-[11px]">
                      <div>
                        HW <span className="font-semibold text-slate-900">{mySubs.length}</span>
                        {avgScore !== null && <span className="text-[#063F38]"> ({avgScore}%)</span>}
                      </div>
                      <div>
                        Quiz <span className="font-semibold text-slate-900">{passedQuizzes}/{myQuizzes.length}</span>
                      </div>
                      <div>
                        Live <span className="font-semibold text-[#063F38]">{myAttendance}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {myCerts.length > 0 ? (
                      <div className="flex flex-col items-start gap-1">
                        {myCerts.map((c: any) => (
                          <Link
                            key={c._id}
                            href={`/verify/${c.certificateId}`}
                            target="_blank"
                            className="whitespace-nowrap rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#063F38] hover:border-[#063F38] hover:bg-[#F4FFE2] transition"
                          >
                            {c.certificateId}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href="/admin/certificates"
                        className="whitespace-nowrap text-xs font-medium text-slate-400 hover:text-[#063F38]"
                      >
                        Issue →
                      </Link>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3.5 text-right">
                    <StudentRowActions student={s} courses={courses} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {students.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-400">No students registered yet.</p>
        )}
      </div>
    </div>
  );
}
