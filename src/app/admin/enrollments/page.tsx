import Link from "next/link";
import { Download } from "lucide-react";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import EnrollmentActions from "@/components/admin/EnrollmentActions";
import StatusBadge from "@/components/admin/StatusBadge";
import { finalPrice, plain } from "@/lib/utils";

export const dynamic = "force-dynamic";
const tabs = [["All", ""], ["Pending", "PENDING"], ["Approved", "APPROVED"], ["Rejected", "REJECTED"]];

export default async function Enrollments({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  await connectDB();
  const [list, counts]: any[] = await Promise.all([
    Enrollment.find(status ? { status } : {}).sort({ enrolledAt: -1 }).populate("student", "name email").populate("course", "title price discountPrice").lean(),
    Enrollment.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]).then(plain);
  const count = (v: string) => (v ? counts.find((c: any) => c._id === v)?.n ?? 0 : counts.reduce((a: number, c: any) => a + c.n, 0));
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="h-display text-2xl">Enrollments</h1>
        <a href="/api/admin/export?type=enrollments" className="btn-outline btn-sm">
          <Download size={14} /> Export Enrollments CSV
        </a>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">{tabs.map(([l, v]) => (
        <Link key={l} href={v ? `?status=${v}` : "?"} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${(status ?? "") === v ? "bg-[#063F38] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-emerald-400 hover:text-[#063F38]"}`}>{l} <span className="opacity-70">{count(v)}</span></Link>))}</div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">{["Student", "Course", "Price", "Date", "Payment ref", "Status", ""].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{list.filter((e: any) => e.student && e.course).map((e: any) => (
            <tr key={e._id} className="border-b border-slate-50 last:border-0">
              <td className="p-4"><b className="block">{e.student.name}</b><span className="text-xs text-slate-400">{e.student.email}</span></td>
              <td className="p-4">
                <b className="font-semibold text-slate-900">
                  ${typeof e.finalPriceUSD === "number" ? e.finalPriceUSD : finalPrice(e.course)}
                </b>
                {e.couponCode && (
                  <span className="ml-2 rounded bg-[#F4FFE2] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#063F38]">
                    {e.couponCode} (-${e.discountAmountUSD || 0})
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap p-4 text-slate-500">{new Date(e.enrolledAt).toLocaleDateString("en-GB")}</td>
              <td className="p-4 text-slate-500">{e.paymentReference ?? "—"}</td><td className="p-4"><StatusBadge s={e.status} /></td>
              <td className="p-4"><EnrollmentActions id={e._id} status={e.status} /></td>
            </tr>))}</tbody>
        </table>
        {list.length === 0 && <p className="p-10 text-center text-slate-400">No enrollments here yet.</p>}
      </div>
    </>
  );
}
