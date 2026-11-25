"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, CheckCircle2, Clock, Trash2, Save } from "lucide-react";

const BADGE: Record<string, string> = {
  NEW: "bg-[#C9FA52]/55 text-[#063F38]",
  IN_PROGRESS: "bg-slate-100 text-slate-700",
  RESOLVED: "bg-[#063F38] text-white",
};

export default function ContactInboxManager({ initialMessages }: { initialMessages: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialMessages);
  const [filter, setFilter] = useState<string>("ALL");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = filter === "ALL" ? items : items.filter((m) => (m.status || "NEW") === filter);
  const newCount = items.filter((m) => (m.status || "NEW") === "NEW").length;

  async function patchLead(id: string, payload: { status?: string; adminNotes?: string }) {
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await r.json();
      if (!r.ok) throw new Error(updated.error || "Update failed");
      setItems((prev) => prev.map((x) => (x._id === id ? updated : x)));
      toast.success("Lead updated");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    const r = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (r.ok) {
      setItems((prev) => prev.filter((x) => x._id !== id));
      toast.success("Inquiry deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      {/* Minimalist Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["ALL", `All (${items.length})`],
            ["NEW", `New (${newCount})`],
            ["IN_PROGRESS", "In Progress"],
            ["RESOLVED", "Resolved"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === k
                  ? "bg-[#063F38] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#063F38]/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
          No contact inquiries in this view.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((m) => {
            const st = m.status || "NEW";
            const currentNote = notes[m._id] ?? m.adminNotes ?? "";
            return (
              <div
                key={m._id}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${BADGE[st] || BADGE.NEW}`}>
                        {st.replace("_", " ")}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{m.subject}</h3>
                    <p className="text-xs text-slate-500">
                      From <span className="font-semibold text-slate-800">{m.name}</span> ·{" "}
                      <a href={`mailto:${m.email}`} className="text-[#063F38] hover:underline font-mono">
                        {m.email}
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                      className="btn-outline btn-sm text-xs"
                    >
                      <Mail size={13} /> Reply
                    </a>
                    {st !== "IN_PROGRESS" && st !== "RESOLVED" && (
                      <button
                        type="button"
                        disabled={busyId === m._id}
                        onClick={() => patchLead(m._id, { status: "IN_PROGRESS", adminNotes: currentNote })}
                        className="btn-outline btn-sm text-xs"
                      >
                        <Clock size={13} /> Mark In Progress
                      </button>
                    )}
                    {st !== "RESOLVED" && (
                      <button
                        type="button"
                        disabled={busyId === m._id}
                        onClick={() => patchLead(m._id, { status: "RESOLVED", adminNotes: currentNote })}
                        className="btn-primary btn-sm text-xs"
                      >
                        <CheckCircle2 size={13} /> Resolve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(m._id)}
                      className="btn-ghost btn-sm !px-2 text-rose-600 hover:bg-rose-50"
                      title="Delete Lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="rounded-lg border border-slate-100 bg-[#f8faf9] px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {m.message}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="input text-xs flex-1"
                    placeholder="Internal admissions follow-up note..."
                    value={currentNote}
                    onChange={(e) => setNotes({ ...notes, [m._id]: e.target.value })}
                  />
                  <button
                    type="button"
                    disabled={busyId === m._id}
                    onClick={() => patchLead(m._id, { adminNotes: currentNote })}
                    className="btn-outline btn-sm text-xs shrink-0"
                  >
                    <Save size={13} /> Save Note
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
