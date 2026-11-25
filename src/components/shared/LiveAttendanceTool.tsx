"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Copy, Check, CheckCircle2, Radio, UserCheck } from "lucide-react";

export default function LiveAttendanceTool({ courses }: { courses: any[] }) {
  const [courseId, setCourseId] = useState<string>(courses[0]?._id || "");
  const [lessonTitle, setLessonTitle] = useState("Live Cohort Session");
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function loadStatus(cid: string) {
    if (!cid) return;
    const r = await fetch(`/api/attendance/session?courseId=${cid}`);
    if (r.ok) {
      const data = await r.json();
      setActiveSession(data.session || null);
      setCheckIns(data.checkIns || []);
    }
  }

  useEffect(() => {
    if (courseId) loadStatus(courseId);
  }, [courseId]);

  async function generatePin(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return;
    setBusy(true);
    const r = await fetch("/api/attendance/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, lessonTitle, hoursValid: 3 }),
    });
    const data = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(data.error || "Could not generate PIN");
    setActiveSession(data);
    toast.success(`Live Attendance PIN ${data.code} active for 3 hours`);
    loadStatus(courseId);
  }

  function copyPin() {
    if (!activeSession?.code) return;
    navigator.clipboard.writeText(activeSession.code);
    setCopied(true);
    toast.success("PIN copied — paste in Google Meet chat");
    setTimeout(() => setCopied(false), 2000);
  }

  async function verifyStudent(studentId: string) {
    const r = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, studentId, lessonTitle }),
    });
    if (r.ok) {
      toast.success("Attendance marked as instructor-verified");
      loadStatus(courseId);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={generatePin}
        className="card p-6 grid gap-4 md:grid-cols-[1.2fr_1.2fr_auto] items-end"
      >
        <div>
          <label className="label">Assigned Cohort Course</label>
          <select
            className="input"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} {c.batchCode ? `(${c.batchCode})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Today&apos;s Class Topic</label>
          <input
            className="input"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Week 2 · Server Actions & API Auth"
          />
        </div>
        <button disabled={busy || !courseId} className="btn-primary !py-2.5">
          <KeyRound size={15} /> {activeSession ? "Regenerate PIN" : "Launch Live PIN"}
        </button>
      </form>

      {activeSession && (
        <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4FFE2]/60 border-[#063F38]/20">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#063F38]">
              <Radio size={13} /> Active Roll-Call PIN ({activeSession.dateKey})
            </span>
            <p className="text-xs text-slate-600">
              Share this PIN inside Google Meet chat during class so student check-ins upgrade to{" "}
              <b>Instructor Verified</b>.
            </p>
            <p className="text-[11px] text-slate-500">
              Expires at {new Date(activeSession.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-[#063F38]/25 bg-white px-5 py-2.5 font-mono text-2xl font-extrabold tracking-[0.25em] text-[#063F38]">
              {activeSession.code}
            </span>
            <button type="button" onClick={copyPin} className="btn-outline btn-sm">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Today&apos;s Attendance Log ({checkIns.length})
          </h3>
        </div>
        {checkIns.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-400">
            No student check-ins logged today for this cohort yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-[#f8faf9] text-[11px] uppercase tracking-wider text-slate-400">
                <th className="p-4">Student</th>
                <th className="p-4">Method</th>
                <th className="p-4">Joined At</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.map((row: any) => (
                <tr key={row._id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4">
                    <b className="block text-slate-900">{row.student?.name}</b>
                    <span className="text-xs text-slate-400">{row.student?.email}</span>
                  </td>
                  <td className="p-4">
                    <span className="badge bg-[#F4FFE2] text-[#063F38] font-mono text-[11px]">
                      {row.verificationMethod || "LINK_CLICK"}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500 font-mono">
                    {new Date(row.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4 text-right">
                    {row.verifiedByInstructor ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#063F38]">
                        <CheckCircle2 size={14} /> Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => verifyStudent(row.student?._id)}
                        className="btn-outline btn-sm text-xs"
                      >
                        <UserCheck size={13} /> Confirm Present
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
