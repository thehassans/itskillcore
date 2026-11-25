"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, CalendarCheck } from "lucide-react";

export default function LeaveManager({ initialLeaves }: { initialLeaves: any[] }) {
  const router = useRouter();
  const [leaves, setLeaves] = useState<any[]>(initialLeaves);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, status: "APPROVED" | "REJECTED") {
    setBusyId(id);
    const r = await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote: notes[id] || "" }),
    });
    const data = await r.json();
    setBusyId(null);
    if (!r.ok) return toast.error(data.error || "Update failed");
    setLeaves((prev) => prev.map((l) => (l._id === id ? { ...l, status, reviewNote: data.reviewNote } : l)));
    toast.success(
      status === "APPROVED"
        ? "Leave approved & Make-Up Attendance Credit granted!"
        : "Leave request rejected"
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {leaves.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">
          <CalendarCheck className="mx-auto mb-2 text-slate-300" size={36} />
          No student leave or make-up attendance requests submitted yet.
        </div>
      ) : (
        leaves.map((l) => (
          <div
            key={l._id}
            className="card p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`badge text-[10px] font-bold uppercase ${
                    l.status === "APPROVED"
                      ? "bg-[#C9FA52]/45 text-[#063F38]"
                      : l.status === "REJECTED"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-[#F4FFE2] text-[#063F38]"
                  }`}
                >
                  {l.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  Missed Date: {l.dateKey}
                </span>
                <span className="text-xs text-slate-500">· {l.course?.title}</span>
              </div>
              <h3 className="font-bold text-slate-900">
                {l.student?.name}{" "}
                <span className="text-xs font-normal text-slate-400">({l.student?.email})</span>
              </h3>
              <p className="text-xs text-slate-600">
                <b>Reason:</b> {l.reason}
              </p>
              {l.makeupSummary && (
                <p className="rounded-lg border border-slate-100 bg-[#f8faf9] p-2.5 text-xs text-slate-700">
                  <b>Make-Up Recording Notes:</b> {l.makeupSummary}
                </p>
              )}
            </div>

            {l.status === "PENDING" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <input
                  className="input text-xs sm:w-44"
                  placeholder="Instructor remark"
                  value={notes[l._id] || ""}
                  onChange={(e) => setNotes({ ...notes, [l._id]: e.target.value })}
                />
                <button
                  disabled={busyId === l._id}
                  onClick={() => decide(l._id, "APPROVED")}
                  className="btn-primary btn-sm text-xs"
                >
                  <Check size={14} /> Grant Make-Up Credit
                </button>
                <button
                  disabled={busyId === l._id}
                  onClick={() => decide(l._id, "REJECTED")}
                  className="btn-danger btn-sm text-xs"
                >
                  <X size={14} /> Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
