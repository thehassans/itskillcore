"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Radio, Send, Trash2, ExternalLink, Users, BookOpen } from "lucide-react";

interface BroadcastItem {
  _id: string;
  title: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  target: "ALL" | "COURSE";
  course?: { _id: string; title: string };
  senderName: string;
  createdAt: string;
}

export default function BroadcastManager({
  broadcasts,
  courses,
}: {
  broadcasts: BroadcastItem[];
  courses: { _id: string; title: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    linkUrl: "",
    linkLabel: "Join Broadcast / Meeting",
    target: "ALL" as "ALL" | "COURSE",
    courseId: "",
  });

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.linkUrl.trim() || !form.message.trim()) {
      return toast.error("Please fill in title, message, and link URL");
    }

    setBusy(true);
    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send broadcast");

      toast.success("Broadcast sent to all students!");
      setForm({
        title: "",
        message: "",
        linkUrl: "",
        linkLabel: "Join Broadcast / Meeting",
        target: "ALL",
        courseId: "",
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this broadcast message?")) return;
    try {
      const res = await fetch(`/api/broadcasts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete broadcast");
      toast.success("Broadcast deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
      {/* Create Broadcast Form */}
      <div className="card space-y-4 p-6 border-slate-200 shadow-sm h-fit">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C9FA52]/45 text-[#063F38]">
            <Radio size={20} />
          </span>
          Send Live Broadcast Link
        </div>
        <p className="text-xs text-slate-500">
          Transmit live meeting links (Google Meet, Zoom, YouTube Live) or resource announcements to all students in one click.
        </p>

        <form onSubmit={handleSend} className="space-y-4 pt-2">
          <div>
            <label className="label">Broadcast Title</label>
            <input
              required
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Live Architecture Q&A Workshop"
            />
          </div>

          <div>
            <label className="label">Meeting / Broadcast Link URL</label>
            <input
              required
              type="url"
              className="input font-mono text-xs"
              value={form.linkUrl}
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              placeholder="https://meet.google.com/xyz-abcd-efg"
            />
          </div>

          <div>
            <label className="label">Link Button Label</label>
            <input
              className="input"
              value={form.linkLabel}
              onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
              placeholder="e.g. Join Google Meet Live"
            />
          </div>

          <div>
            <label className="label">Target Audience</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setForm({ ...form, target: "ALL" })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-semibold transition ${
                  form.target === "ALL"
                    ? "border-emerald-600 bg-[#F4FFE2] text-[#063F38]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Users size={14} /> All Students
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, target: "COURSE" })}
                className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-semibold transition ${
                  form.target === "COURSE"
                    ? "border-emerald-600 bg-[#F4FFE2] text-[#063F38]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <BookOpen size={14} /> Specific Course
              </button>
            </div>
          </div>

          {form.target === "COURSE" && (
            <div>
              <label className="label">Select Target Course</label>
              <select
                required
                className="input"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">Choose course…</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Message / Instructions</label>
            <textarea
              required
              rows={3}
              className="input"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Please join promptly with your questions on Module 3 ready..."
            />
          </div>

          <button disabled={busy} type="submit" className="btn-primary w-full !py-3">
            <Send size={16} /> {busy ? "Sending Broadcast…" : "Broadcast Link to Students"}
          </button>
        </form>
      </div>

      {/* Broadcast History */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 text-lg flex items-center justify-between">
          <span>Active Broadcasts & Sent Links</span>
          <span className="badge bg-[#C9FA52]/40 text-[#063F38]">{broadcasts.length} Sent</span>
        </h2>

        {broadcasts.length === 0 ? (
          <div className="card p-12 text-center border-slate-200">
            <Radio size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-900">No broadcasts sent yet</h3>
            <p className="text-sm text-slate-500 mt-1">
              Use the form on the left to broadcast a live class link or announcement to all students.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((b) => (
              <div
                key={b._id}
                className="card p-5 border-slate-200 hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                      <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px]">
                        {b.target === "ALL" ? "All Students" : b.course?.title || "Course Specific"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sent by {b.senderName} on {new Date(b.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="btn-ghost !p-2 text-slate-400 hover:text-rose-600"
                    title="Delete Broadcast"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{b.message}</p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs font-mono text-slate-500 truncate max-w-sm">
                    {b.linkUrl}
                  </div>
                  <a
                    href={b.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary btn-sm"
                  >
                    {b.linkLabel} <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
