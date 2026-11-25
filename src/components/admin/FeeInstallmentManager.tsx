"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  ExternalLink,
  Plus,
  FileDown,
} from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  VERIFIED: "bg-[#C9FA52]/40 text-[#063F38]",
  SUBMITTED: "bg-[#C9FA52]/45 text-[#063F38]",
  OVERDUE: "bg-rose-100 text-rose-700",
  REJECTED: "bg-rose-50 text-rose-700",
  UNPAID: "bg-slate-100 text-slate-600",
};

export default function FeeInstallmentManager({
  initialInstallments,
  students,
  courses,
}: {
  initialInstallments: any[];
  students: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialInstallments);
  const [filter, setFilter] = useState<string>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    installmentNumber: "1",
    monthLabel: "Month 1 Tuition",
    amount: "12000",
    dueDate: new Date().toISOString().slice(0, 10),
  });

  const shown =
    filter === "ALL" ? items : items.filter((it) => it.status === filter);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/installments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: notes[id] || "" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Update failed");
      setItems((prev) =>
        prev.map((x) =>
          x._id === id
            ? {
                ...x,
                status: data.status,
                adminNote: data.adminNote,
                enrollment: {
                  ...x.enrollment,
                  accessLocked: status === "OVERDUE" ? true : status === "VERIFIED" ? false : x.enrollment?.accessLocked,
                },
              }
            : x
        )
      );
      toast.success(
        status === "VERIFIED"
          ? "Payment verified & cohort classroom unlocked!"
          : status === "OVERDUE"
          ? "Marked overdue — student classroom access locked."
          : `Installment updated to ${status}`
      );
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAccess(id: string, currentlyLocked: boolean) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/installments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: currentlyLocked ? "UNLOCK_ACCESS" : "LOCK_ACCESS",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setItems((prev) =>
        prev.map((x) =>
          x._id === id
            ? { ...x, enrollment: { ...x.enrollment, accessLocked: data.accessLocked } }
            : x
        )
      );
      toast.success(data.accessLocked ? "Course access paused" : "Course access unlocked");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function addInstallment(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/installments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      toast.success("Installment plan saved!");
      router.refresh();
      const refreshed = await fetch("/api/installments").then((x) => x.json());
      if (Array.isArray(refreshed)) setItems(refreshed);
    } else {
      toast.error((await r.json()).error || "Could not create installment");
    }
  }

  const submittedCount = items.filter((i) => i.status === "SUBMITTED").length;
  const overdueCount = items.filter((i) => i.status === "OVERDUE").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["ALL", `All (${items.length})`],
            ["SUBMITTED", `Pending Proof (${submittedCount})`],
            ["OVERDUE", `Overdue Locked (${overdueCount})`],
            ["UNPAID", "Unpaid"],
            ["VERIFIED", "Verified"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filter === k
                  ? "bg-[#063F38] text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-[#F4FFE2]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Create / Adjust Installment */}
      <form
        onSubmit={addInstallment}
        className="card p-5 border-slate-200 bg-white grid gap-3 sm:grid-cols-6 items-end"
      >
        <div className="sm:col-span-2">
          <label className="label">Student</label>
          <select
            required
            className="input text-xs"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          >
            <option value="">Select student…</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Course</label>
          <select
            required
            className="input text-xs"
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
          >
            <option value="">Select course…</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Month / Label</label>
          <input
            className="input text-xs"
            value={form.monthLabel}
            onChange={(e) => setForm({ ...form, monthLabel: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Amount (PKR)</label>
          <input
            type="number"
            className="input text-xs"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary btn-sm !py-2.5">
          <Plus size={14} /> Add Installment
        </button>
      </form>

      {/* Installments Review List */}
      {shown.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-slate-400">
          No installments matching this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((inst) => {
            const locked = Boolean(inst.enrollment?.accessLocked);
            return (
              <div
                key={inst._id}
                className="card p-5 border-slate-200 bg-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge text-[10px] font-bold uppercase ${
                        STATUS_STYLE[inst.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inst.status}
                    </span>
                    <span className="badge bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {inst.paymentMethod}
                    </span>
                    {locked && (
                      <span className="badge bg-rose-100 text-rose-700 text-[10px] font-bold inline-flex items-center gap-1">
                        <Lock size={11} /> Access Locked
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Due:{" "}
                      {new Date(inst.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="font-bold text-slate-900">
                      {inst.student?.name || "Student"} — {inst.monthLabel}
                    </h3>
                    <span className="font-mono text-sm font-extrabold text-[#063F38]">
                      PKR {Number(inst.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Course: <b>{inst.course?.title}</b>
                    {inst.transactionId && (
                      <>
                        {" · "}TID / Ref:{" "}
                        <span className="font-mono font-bold text-slate-800">{inst.transactionId}</span>
                      </>
                    )}
                  </p>

                  {inst.receiptUrl && (
                    <div className="pt-1">
                      <a
                        href={inst.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063F38] hover:underline"
                      >
                        <CreditCard size={13} /> View Uploaded Receipt Screenshot <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  <input
                    className="input text-xs sm:w-44"
                    placeholder="Admin remark (optional)"
                    value={notes[inst._id] ?? inst.adminNote ?? ""}
                    onChange={(e) => setNotes({ ...notes, [inst._id]: e.target.value })}
                  />
                  {inst.status !== "VERIFIED" && (
                    <button
                      disabled={busyId === inst._id}
                      onClick={() => updateStatus(inst._id, "VERIFIED")}
                      className="btn-success btn-sm text-xs"
                    >
                      <CheckCircle2 size={14} /> Verify &amp; Unlock
                    </button>
                  )}
                  {inst.status !== "OVERDUE" && inst.status !== "VERIFIED" && (
                    <button
                      disabled={busyId === inst._id}
                      onClick={() => updateStatus(inst._id, "OVERDUE")}
                      className="btn-danger btn-sm text-xs"
                    >
                      <AlertTriangle size={14} /> Mark Overdue &amp; Lock
                    </button>
                  )}
                  {inst.status === "SUBMITTED" && (
                    <button
                      disabled={busyId === inst._id}
                      onClick={() => updateStatus(inst._id, "REJECTED")}
                      className="btn-outline btn-sm text-xs text-rose-700 border-rose-200"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  )}
                  <a
                    href={`/api/installments/${inst._id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline btn-sm text-xs"
                    title="Download Invoice / Receipt PDF"
                  >
                    <FileDown size={13} /> Invoice PDF
                  </a>
                  <button
                    disabled={busyId === inst._id}
                    onClick={() => toggleAccess(inst._id, locked)}
                    className="btn-outline btn-sm text-xs"
                    title={locked ? "Unlock Cohort Access" : "Pause Cohort Access"}
                  >
                    {locked ? (
                      <>
                        <Unlock size={14} className="text-[#063F38]" /> Unlock
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="text-slate-500" /> Lock
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
