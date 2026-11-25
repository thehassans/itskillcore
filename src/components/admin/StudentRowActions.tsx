"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  UserCog,
  ShieldOff,
  ShieldCheck,
  Trash2,
  ExternalLink,
  X,
} from "lucide-react";

export default function StudentRowActions({
  student,
  courses,
}: {
  student: any;
  courses: any[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(student.name || "");
  const [password, setPassword] = useState("");
  const [assignCourseId, setAssignCourseId] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body: any = { name };
    if (password.trim()) body.password = password.trim();
    if (assignCourseId) body.assignCourseId = assignCourseId;

    const r = await fetch(`/api/admin/students/${student._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!r.ok) return toast.error("Failed to update student");
    toast.success("Student account updated");
    setPassword("");
    setAssignCourseId("");
    setOpen(false);
    router.refresh();
  }

  async function toggleSuspend() {
    const next = !student.isSuspended;
    const r = await fetch(`/api/admin/students/${student._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: next }),
    });
    if (r.ok) {
      toast.success(next ? "Student suspended" : "Student reactivated");
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm(`Delete student "${student.name}" and their enrollments?`)) return;
    const r = await fetch(`/api/admin/students/${student._id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Student deleted");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        href={`/portfolio/${student._id}`}
        target="_blank"
        title="Public Graduate Portfolio"
        className="btn-outline btn-sm text-xs"
      >
        <ExternalLink size={12} /> Portfolio
      </Link>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Edit / Reset Password / Assign Course"
        className="btn-outline btn-sm text-xs"
      >
        <UserCog size={13} />
      </button>
      <button
        type="button"
        onClick={toggleSuspend}
        title={student.isSuspended ? "Activate" : "Suspend"}
        className="btn-outline btn-sm text-xs"
      >
        {student.isSuspended ? (
          <ShieldCheck size={13} className="text-[#063F38]" />
        ) : (
          <ShieldOff size={13} className="text-slate-500" />
        )}
      </button>
      <button
        type="button"
        onClick={remove}
        title="Delete Student"
        className="btn-danger btn-sm text-xs"
      >
        <Trash2 size={13} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm text-left"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Manage {student.name}</h3>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost !p-1">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Reset Password (Optional)</label>
              <input
                type="text"
                minLength={8}
                className="input font-mono text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing"
              />
            </div>
            <div>
              <label className="label">Assign Additional Course</label>
              <select
                className="input text-xs"
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
              >
                <option value="">None (keep current)</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <button disabled={busy} className="btn-primary w-full">
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
