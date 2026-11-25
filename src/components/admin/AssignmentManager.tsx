"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileCheck,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  Clock,
  ExternalLink,
  X,
  Upload,
} from "lucide-react";

export default function AssignmentManager({
  assignments,
  courses,
}: {
  assignments: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [gradingSub, setGradingSub] = useState<any | null>(null);
  const [score, setScore] = useState<number>(90);
  const [feedback, setFeedback] = useState("");
  const [gradeStatus, setGradeStatus] = useState<"GRADED" | "RESUBMIT">("GRADED");
  const [busy, setBusy] = useState(false);

  // New assignment form state
  const [form, setForm] = useState({
    courseId: courses[0]?._id || "",
    title: "",
    description: "",
    weekNumber: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxScore: 100,
    attachments: [] as { name: string; url: string; type: string }[],
  });

  async function uploadBriefFile(file?: File) {
    if (!file) return;
    const tid = toast.loading(`Uploading ${file.name}...`);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "Upload failed", { id: tid });
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    setForm((p) => ({
      ...p,
      attachments: [...p.attachments, { name: file.name, url: d.url, type: ext }],
    }));
    toast.success("Brief document attached!", { id: tid });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");
      toast.success("Assignment created and assigned to students!");
      setCreating(false);
      setForm({
        courseId: courses[0]?._id || "",
        title: "",
        description: "",
        weekNumber: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        maxScore: 100,
        attachments: [],
      });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function openSubmissions(assignment: any) {
    setSelectedAssignment(assignment);
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/assignments/${assignment._id}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
      }
    } catch {
      toast.error("Could not load submissions");
    } finally {
      setLoadingSubs(false);
    }
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!gradingSub) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${gradingSub._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback, status: gradeStatus }),
      });
      if (!res.ok) throw new Error("Failed to save review");
      toast.success(gradeStatus === "GRADED" ? "Submission graded and feedback sent!" : "Resubmission requested from student!");
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === gradingSub._id ? { ...s, score, feedback, status: gradeStatus } : s
        )
      );
      setGradingSub(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this assignment and all student submissions?")) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Assignment deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl text-slate-900">Homework & Assignments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign homework tasks, track student file uploads (Word, PDF, Images), and review submissions.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={16} /> Assign New Homework
        </button>
      </div>

      {/* Assignments Table */}
      <div className="card overflow-x-auto border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
              <th className="p-4 font-semibold">Assignment Title</th>
              <th className="p-4 font-semibold">Course Program</th>
              <th className="p-4 font-semibold">Week</th>
              <th className="p-4 font-semibold">Due Date</th>
              <th className="p-4 font-semibold">Submissions</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr
                key={a._id}
                className="border-b border-slate-50 last:border-0 hover:bg-[#F4FFE2]/30 transition"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F4FFE2] text-[#063F38]">
                      <FileCheck size={18} />
                    </span>
                    <div>
                      <b className="block text-slate-900 font-semibold">{a.title}</b>
                      <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                        {a.description}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-700 font-medium">{a.course?.title || "Course"}</td>
                <td className="p-4">
                  <span className="badge bg-slate-100 text-slate-700">Week {a.weekNumber}</span>
                </td>
                <td className="p-4 text-slate-600 font-medium">
                  {new Date(a.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-[#C9FA52]/40 text-[#063F38]">
                      {a.submissionCount || 0} Submitted
                    </span>
                    {a.gradedCount > 0 && (
                      <span className="badge bg-slate-100 text-slate-600">
                        {a.gradedCount} Graded
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openSubmissions(a)}
                      className="btn-outline btn-sm text-xs font-semibold"
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="btn-ghost !p-2 text-slate-400 hover:text-rose-600"
                      title="Delete Assignment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">No assignments created yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Assign New Homework&quot; to assign tasks to your online cohort.
            </p>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreate}
            className="card w-full max-w-xl space-y-4 p-6 relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h2 className="h-display text-xl text-slate-900">Assign New Homework / Project</h2>

            <div>
              <label className="label">Target Course</label>
              <select
                required
                className="input"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Assignment Title</label>
              <input
                required
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Week 2: Build Responsive Portfolio in Tailwind CSS"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Week #</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  className="input"
                  value={form.weekNumber}
                  onChange={(e) => setForm({ ...form, weekNumber: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Max Score</label>
                <input
                  type="number"
                  min={10}
                  className="input"
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="label">Homework Instructions / Problem Brief</label>
              <textarea
                required
                rows={5}
                className="input text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="1. Clone the starter repository...&#10;2. Implement responsive grid...&#10;3. Submit Word document report, screenshots, or zip file."
              />
            </div>

            <div>
              <label className="label">Attach Reference Brief / Starter Kit (PDF, Word, ZIP - Optional)</label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn-outline btn-sm text-xs cursor-pointer flex items-center gap-1.5">
                  <Upload size={13} /> Upload Reference File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.ppt,.pptx,.png,.jpg"
                    onChange={(e) => {
                      uploadBriefFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {form.attachments.map((att, idx) => (
                  <span key={idx} className="badge bg-[#F4FFE2] text-[#063F38] border border-[#063F38]/20 text-xs flex items-center gap-1">
                    {att.name}
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, attachments: p.attachments.filter((_, i) => i !== idx) }))}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button disabled={busy} type="submit" className="btn-primary">
                {busy ? "Assigning…" : "Publish Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions Review Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col p-6 relative">
            <button
              onClick={() => setSelectedAssignment(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="mb-4">
              <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold">
                Week {selectedAssignment.weekNumber} Assignment
              </span>
              <h2 className="h-display text-xl text-slate-900 mt-1">
                {selectedAssignment.title}
              </h2>
              <p className="text-xs text-slate-500">
                Course: {selectedAssignment.course?.title} · Due:{" "}
                {new Date(selectedAssignment.dueDate).toLocaleDateString("en-GB")}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {loadingSubs ? (
                <div className="p-10 text-center text-slate-400">Loading student work…</div>
              ) : submissions.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  No students have uploaded work for this assignment yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <div key={sub._id} className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#C9FA52]/40 text-[#063F38] font-bold text-sm">
                            {sub.student?.name?.[0] || "S"}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{sub.student?.name}</p>
                            <p className="text-xs text-slate-400">{sub.student?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`badge ${
                              sub.status === "GRADED"
                                ? "bg-[#C9FA52]/40 text-[#063F38]"
                                : sub.status === "RESUBMIT"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-[#C9FA52]/45 text-[#063F38]"
                            }`}
                          >
                            {sub.status === "GRADED"
                              ? `Graded: ${sub.score} / ${selectedAssignment.maxScore}`
                              : sub.status === "RESUBMIT"
                              ? "Resubmit Requested"
                              : "Pending Review"}
                          </span>

                          <button
                            onClick={() => {
                              setGradingSub(sub);
                              setScore(sub.score || 90);
                              setFeedback(sub.feedback || "");
                              setGradeStatus(sub.status === "RESUBMIT" ? "RESUBMIT" : "GRADED");
                            }}
                            className="btn-primary btn-sm text-xs"
                          >
                            {sub.status === "GRADED" ? "Edit Grade" : "Review Work"}
                          </button>
                        </div>
                      </div>

                      {/* Student submitted file */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#063F38]" />
                          <span className="text-xs font-mono font-semibold text-slate-700 truncate max-w-md">
                            {sub.fileName}
                          </span>
                        </div>
                        <a
                          href={sub.fileUrl}
                          download={sub.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-outline btn-sm text-xs flex items-center gap-1.5"
                        >
                          <Download size={13} /> Download File
                        </a>
                      </div>

                      {sub.studentComment && (
                        <p className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-100">
                          <b className="text-slate-800">Student Note:</b> {sub.studentComment}
                        </p>
                      )}

                      {sub.feedback && (
                        <p className="text-xs text-[#063F38] bg-[#F4FFE2] rounded-lg p-2.5 border border-[#063F38]/15">
                          <b>Teacher Feedback:</b> {sub.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grading Form Drawer inside modal */}
            {gradingSub && (
              <form
                onSubmit={handleGrade}
                className="mt-4 border-t border-slate-200 pt-4 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Grading: {gradingSub.student?.name}&apos;s Submission
                  </h3>
                  <button
                    type="button"
                    onClick={() => setGradingSub(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid sm:grid-cols-[130px_160px_1fr] gap-3">
                  <div>
                    <label className="label">Score (out of {selectedAssignment.maxScore})</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={selectedAssignment.maxScore}
                      className="input"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Review Status</label>
                    <select
                      className="input"
                      value={gradeStatus}
                      onChange={(e) => setGradeStatus(e.target.value as "GRADED" | "RESUBMIT")}
                    >
                      <option value="GRADED">Approved & Graded</option>
                      <option value="RESUBMIT">Request Resubmission</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Instructor Feedback</label>
                    <input
                      className="input"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Excellent implementation of responsive grid. Keep it up!"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setGradingSub(null)}
                    className="btn-outline btn-sm"
                  >
                    Close
                  </button>
                  <button disabled={busy} type="submit" className="btn-primary btn-sm">
                    {busy ? "Saving…" : "Save Score & Feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
