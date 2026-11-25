import Link from "next/link";
import { Users, BookOpen, Clock, Award, DollarSign, ArrowRight, FileCheck, Radio, CheckSquare, CreditCard, MessageSquare } from "lucide-react";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Certificate from "@/models/Certificate";
import Submission from "@/models/Submission";
import FeeInstallment from "@/models/FeeInstallment";
import LessonQuestion from "@/models/LessonQuestion";
import StatusBadge from "@/components/admin/StatusBadge";
import { finalPrice, plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Overview() {
  await connectDB();
  const [students, courses, pending, certs, pendingHomework, pendingFees, openQuestions, approved, recent, all]: any[] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    Course.countDocuments(),
    Enrollment.countDocuments({ status: "PENDING" }),
    Certificate.countDocuments(),
    Submission.countDocuments({ status: "SUBMITTED" }),
    FeeInstallment.countDocuments({ status: "SUBMITTED" }),
    LessonQuestion.countDocuments({ isResolved: false }),
    Enrollment.find({ status: "APPROVED", paymentReference: { $ne: "Admin Assigned" } }).populate("course", "price discountPrice").lean(),
    Enrollment.find().sort({ enrolledAt: -1 }).limit(6).populate("student", "name email").populate("course", "title price discountPrice").lean(),
    Enrollment.find().select("enrolledAt").lean(),
  ]).then((r) => r.map((x: any) => (typeof x === "number" ? x : plain(x))));
  const revenue = approved.reduce((n: number, e: any) => n + (e.course ? finalPrice(e.course) : 0), 0);

  // enrollments per month, last 6 months
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return d; });
  const series = months.map((d) => ({ label: d.toLocaleString("en", { month: "short" }), n: all.filter((e: any) => { const x = new Date(e.enrolledAt); return x.getMonth() === d.getMonth() && x.getFullYear() === d.getFullYear(); }).length }));
  const max = Math.max(1, ...series.map((s) => s.n));

  const kpis = [
    [Users, "Total Students", students, "emerald"],
    [BookOpen, "Total Courses", courses, "emeraldDark"],
    [Clock, "Pending Enrollments", pending, "lime"],
    [Award, "Certificates Issued", certs, "emerald"],
    [DollarSign, "Total Revenue", `$${revenue}`, "limeSoft"],
  ] as const;

  const tone: Record<string, string> = {
    emerald: "bg-[#F4FFE2] text-[#063F38]",
    emeraldDark: "bg-[#063F38] text-[#C9FA52]",
    lime: "bg-[#C9FA52]/50 text-[#063F38]",
    limeSoft: "bg-[#F4FFE2] text-[#063F38]",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="h-display text-2xl text-slate-900">Admin Control Center</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/broadcast" className="btn-accent btn-sm">
            <Radio size={15} /> Send Broadcast Link
          </Link>
          <Link href="/admin/assignments" className="btn-primary btn-sm">
            <FileCheck size={15} /> Grade Homework
          </Link>
          <Link href="/admin/quizzes" className="btn-outline btn-sm">
            <CheckSquare size={15} /> Manage Quizzes
          </Link>
          <Link href="/admin/fees" className="btn-outline btn-sm">
            <CreditCard size={15} /> Verify Fees
          </Link>
          <Link href="/admin/qa" className="btn-outline btn-sm">
            <MessageSquare size={15} /> Answer Q&amp;A
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {pending > 0 && (
          <Link href="/admin/enrollments?status=PENDING" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 transition hover:border-[#063F38]">
            <span className="flex items-center gap-2.5">
              <span className="rounded-md bg-[#C9FA52] px-2 py-0.5 font-mono text-xs font-bold text-[#063F38]">{pending}</span>
              <span>enrollment request{pending > 1 ? "s" : ""} awaiting approval</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#063F38]">Review <ArrowRight size={13} /></span>
          </Link>
        )}
        {pendingHomework > 0 && (
          <Link href="/admin/assignments" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 transition hover:border-[#063F38]">
            <span className="flex items-center gap-2.5">
              <span className="rounded-md bg-[#F4FFE2] border border-[#063F38]/15 px-2 py-0.5 font-mono text-xs font-bold text-[#063F38]">{pendingHomework}</span>
              <span>homework submission{pendingHomework > 1 ? "s" : ""} awaiting review</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#063F38]">Grade <ArrowRight size={13} /></span>
          </Link>
        )}
        {pendingFees > 0 && (
          <Link href="/admin/fees" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 transition hover:border-[#063F38]">
            <span className="flex items-center gap-2.5">
              <span className="rounded-md bg-[#C9FA52] px-2 py-0.5 font-mono text-xs font-bold text-[#063F38]">{pendingFees}</span>
              <span>fee receipt{pendingFees > 1 ? "s" : ""} awaiting verification</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#063F38]">Verify <ArrowRight size={13} /></span>
          </Link>
        )}
        {openQuestions > 0 && (
          <Link href="/admin/qa" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 transition hover:border-[#063F38]">
            <span className="flex items-center gap-2.5">
              <span className="rounded-md bg-[#F4FFE2] border border-[#063F38]/15 px-2 py-0.5 font-mono text-xs font-bold text-[#063F38]">{openQuestions}</span>
              <span>lesson question{openQuestions > 1 ? "s" : ""} awaiting instructor reply</span>
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#063F38]">Reply <ArrowRight size={13} /></span>
          </Link>
        )}
      </div>

      {/* Unified Architectural KPI Grid */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white grid grid-cols-2 divide-y divide-slate-200 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        {kpis.map(([Icon, l, v]) => (
          <div key={l} className="p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{l}</p>
              <Icon size={16} className="text-[#063F38]/60" />
            </div>
            <p className="font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900 text-sm">Recent enrollment requests</h2>
            <Link href="/admin/enrollments" className="text-xs font-bold text-[#063F38] hover:underline">View all</Link>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {recent.filter((e: any) => e.student && e.course).map((e: any) => (
                <tr key={e._id} className="border-b border-slate-50 last:border-0 hover:bg-[#f8faf9] transition">
                  <td className="px-5 py-3.5"><b className="block text-slate-900 text-sm">{e.student.name}</b><span className="text-xs text-slate-400">{e.student.email}</span></td>
                  <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">{e.course.title}</td>
                  <td className="px-5 py-3.5 text-right"><StatusBadge s={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-5">
          <h2 className="font-bold text-slate-900 text-sm">Enrollments (last 6 months)</h2>
          <div className="mt-6 flex h-48 items-end justify-between gap-3">
            {series.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-600">{s.n}</span>
                <div className="w-full rounded-t-md bg-[#063F38] hover:bg-[#0b5c52] transition" style={{ height: `${Math.max(6, (s.n / max) * 140)}px` }} />
                <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
