"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare, Send, CheckCircle2, Trash2 } from "lucide-react";

export default function AdminQAManager({ initialQuestions }: { initialQuestions: any[] }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  const shown = questions.filter((q) => {
    if (filter === "OPEN") return !q.isResolved;
    if (filter === "RESOLVED") return q.isResolved;
    return true;
  });

  async function reply(id: string) {
    const msg = drafts[id]?.trim();
    if (!msg) return toast.error("Please type a reply first");
    const r = await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, isResolved: true }),
    });
    const data = await r.json();
    if (!r.ok) return toast.error(data.error || "Could not post reply");
    setQuestions((prev) => prev.map((q) => (q._id === id ? data : q)));
    setDrafts((prev) => ({ ...prev, [id]: "" }));
    toast.success("Official instructor reply published & marked resolved!");
    router.refresh();
  }

  async function toggleResolve(id: string, current: boolean) {
    const r = await fetch(`/api/qa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: !current }),
    });
    const data = await r.json();
    if (r.ok) {
      setQuestions((prev) => prev.map((q) => (q._id === id ? data : q)));
      toast.success(!current ? "Marked as resolved" : "Reopened question");
    }
  }

  async function remove(id: string) {
    const r = await fetch(`/api/qa/${id}`, { method: "DELETE" });
    if (r.ok) {
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      toast.success("Question deleted");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["ALL", `All (${questions.length})`],
            ["OPEN", `Unanswered (${questions.filter((q) => !q.isResolved).length})`],
            ["RESOLVED", `Resolved (${questions.filter((q) => q.isResolved).length})`],
          ] as const
        ).map(([k, label]) => (
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

      {shown.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-slate-400">
          <MessageSquare className="mx-auto mb-2 text-slate-300" size={40} />
          No lesson questions in this filter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((q) => (
            <div key={q._id} className="card p-6 border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold mr-2">
                    {q.course?.title || "Course"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{q.lessonTitle}</span>
                  <h3 className="font-bold text-slate-900 mt-1">
                    {q.student?.name || "Student"}{" "}
                    <span className="text-xs font-normal text-slate-400">({q.student?.email})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleResolve(q._id, q.isResolved)}
                    className={`badge cursor-pointer text-[11px] font-bold ${
                      q.isResolved
                        ? "bg-[#C9FA52]/40 text-[#063F38]"
                        : "bg-[#C9FA52]/45 text-[#063F38]"
                    }`}
                  >
                    <CheckCircle2 size={12} className="mr-1" />
                    {q.isResolved ? "Resolved" : "Needs Answer"}
                  </button>
                  <button
                    onClick={() => remove(q._id)}
                    className="btn-ghost btn-sm text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-800 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                {q.question}
              </p>

              {q.attachmentUrl && (
                <a
                  href={q.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-xl overflow-hidden border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.attachmentUrl} alt="" className="max-h-40 object-contain" />
                </a>
              )}

              {q.replies?.length > 0 && (
                <div className="space-y-2 border-l-2 border-emerald-300 pl-4">
                  {q.replies.map((r: any, idx: number) => (
                    <div key={r._id || idx} className="rounded-lg bg-[#F4FFE2]/70 p-2.5 text-xs">
                      <b>{r.authorName}</b> ({r.authorRole}): {r.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <input
                  className="input text-xs flex-1"
                  value={drafts[q._id] || ""}
                  onChange={(e) => setDrafts({ ...drafts, [q._id]: e.target.value })}
                  placeholder="Write official instructor reply for the cohort…"
                />
                <button onClick={() => reply(q._id)} className="btn-primary btn-sm text-xs">
                  <Send size={13} /> Answer &amp; Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
