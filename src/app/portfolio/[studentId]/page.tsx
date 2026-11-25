import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";
import Certificate from "@/models/Certificate";
import Submission from "@/models/Submission";
import Attendance from "@/models/Attendance";
import "@/models/Course";
import "@/models/Assignment";
import { plain } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GoldenSeal from "@/components/certificate/GoldenSeal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ studentId: string }>;
}): Promise<Metadata> {
  const { studentId } = await params;
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return { title: "Graduate Portfolio | IT SkillCore" };
  }
  await connectDB();
  const user: any = await User.findById(studentId).select("name").lean();
  return {
    title: user ? `${user.name} — Graduate Portfolio | IT SkillCore` : "Graduate Portfolio | IT SkillCore",
    description: "Verified academic credentials, live cohort completions, and graded capstone work at IT SkillCore.",
  };
}

export default async function GraduatePortfolioPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  if (!mongoose.Types.ObjectId.isValid(studentId)) notFound();

  await connectDB();

  const student: any = plain(
    await User.findById(studentId).select("name avatar createdAt role title bio").lean()
  );
  if (!student) notFound();

  const [enrollments, certificates, submissions, verifiedAttendanceCount] = await Promise.all([
    Enrollment.find({ student: studentId, status: "APPROVED" })
      .populate("course", "title slug thumbnail category level duration batchCode cohortSchedule")
      .sort({ createdAt: -1 })
      .lean()
      .then((d) => plain(d)),
    Certificate.find({ student: studentId, isRevoked: { $ne: true } })
      .populate("course", "title slug level category duration batchCode")
      .sort({ issuedAt: -1 })
      .lean()
      .then((d) => plain(d)),
    Submission.find({ student: studentId, status: "GRADED" })
      .populate("assignment", "title maxScore weekNumber")
      .populate("course", "title slug")
      .sort({ updatedAt: -1 })
      .lean()
      .then((d) => plain(d)),
    Attendance.countDocuments({ student: studentId, verifiedByInstructor: true }),
  ]);

  const gradedAvg =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum: number, s: any) => {
            const max = s.assignment?.maxScore || 100;
            return sum + ((s.score || 0) / max) * 100;
          }, 0) / submissions.length
        )
      : null;

  const memberSince = new Date(student.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Navbar />
      <main className="min-h-[82vh] bg-[#fcfdfc] py-10 sm:py-14">
        <div className="container-x max-w-6xl space-y-8">
          {/* Header Banner */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-5">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#063F38] text-2xl font-bold text-[#C9FA52]">
                    {student.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4FFE2] border border-[#063F38]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#063F38]">
                    <ShieldCheck size={13} /> Verified IT SkillCore Portfolio
                  </div>
                  <h1 className="mt-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {student.name}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Cohort Member since {memberSince} · Live Mentor-Led Technical Training
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-center">
                  <div className="text-xl font-bold tabular-nums text-[#063F38]">
                    {certificates.length}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Credentials</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-center">
                  <div className="text-xl font-bold tabular-nums text-[#063F38]">
                    {enrollments.length}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Cohorts</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-center">
                  <div className="text-xl font-bold tabular-nums text-[#063F38]">
                    {verifiedAttendanceCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Verified Classes</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-center">
                  <div className="text-xl font-bold tabular-nums text-[#063F38]">
                    {gradedAvg !== null ? `${gradedAvg}%` : "—"}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Avg. Grade</div>
                </div>
              </div>
            </div>
          </section>

          {/* Verified Credentials */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Award size={19} className="text-[#063F38]" /> Verified Academic Credentials
              </h2>
              <Link
                href="/verify"
                className="text-xs font-semibold text-[#063F38] hover:underline inline-flex items-center gap-1"
              >
                Employer Registry Lookup <ExternalLink size={12} />
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                No verified certificates issued yet. Credentials appear here automatically upon cohort completion.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {certificates.map((cert: any) => (
                  <div
                    key={cert._id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#063F38]/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F4FFE2] px-2.5 py-0.5 text-[11px] font-bold text-[#063F38]">
                          <CheckCircle2 size={11} /> Official Seal · {cert.certificateId}
                        </span>
                        <h3 className="mt-2.5 text-lg font-bold text-slate-900">
                          {cert.course?.title || "IT SkillCore Track"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {cert.course?.batchCode || "Live Cohort"} · Issued{" "}
                          {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <GoldenSeal className="h-20 w-20" />
                      </div>
                    </div>

                    {cert.gradeNote && (
                      <p className="mt-3 rounded-xl border border-slate-100 bg-[#f8faf9] px-3.5 py-2.5 text-xs text-slate-600">
                        {cert.gradeNote}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-slate-500">
                        {cert.course?.level || "Professional"} · {cert.course?.duration || "3 Months"}
                      </span>
                      <Link
                        href={`/verify/${cert.certificateId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#063F38] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#085249]"
                      >
                        Verify Credential <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Two-column: Cohorts + Graded Capstone Work */}
          <div className="grid gap-8 lg:grid-cols-12">
            <section className="lg:col-span-6 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BookOpen size={18} className="text-[#063F38]" /> Enrolled Cohorts
              </h2>
              {enrollments.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  No active cohort enrollments recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enr: any) => (
                    <div
                      key={enr._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#063F38]">
                          <span className="rounded-md bg-[#F4FFE2] px-2 py-0.5">
                            {enr.course?.batchCode || "Batch 01"}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{enr.course?.category || "Tech"}</span>
                        </div>
                        <h3 className="mt-1 truncate font-bold text-slate-900 text-sm">
                          {enr.course?.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {enr.course?.cohortSchedule?.timing || "Mon–Fri Live Schedule"}
                        </p>
                      </div>
                      {enr.course?.slug && (
                        <Link
                          href={`/courses/${enr.course.slug}`}
                          className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#063F38] hover:text-[#063F38]"
                        >
                          Syllabus
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="lg:col-span-6 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileCheck2 size={18} className="text-[#063F38]" /> Evaluated Assignments & Capstones
              </h2>
              {submissions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  No graded homework or capstone submissions published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub: any) => {
                    const max = sub.assignment?.maxScore || 100;
                    return (
                      <div
                        key={sub._id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold text-slate-500">
                              {sub.course?.title}
                            </p>
                            <h3 className="text-sm font-bold text-slate-900">
                              {sub.assignment?.title || "Weekly Capstone"}
                            </h3>
                          </div>
                          <span className="shrink-0 rounded-xl bg-[#063F38] px-2.5 py-1 text-xs font-bold tabular-nums text-[#C9FA52]">
                            {sub.score ?? 0} / {max}
                          </span>
                        </div>
                        {sub.feedback && (
                          <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                            Mentor Feedback: {sub.feedback}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
