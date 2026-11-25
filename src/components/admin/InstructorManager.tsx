"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  ShieldOff,
  ShieldCheck,
  BookOpen,
  Wand2,
  Copy,
  X,
  Pencil,
} from "lucide-react";

const genPw = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#";
  const a = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(a, (n) => c[n % c.length]).join("");
};

export default function InstructorManager({
  initialInstructors,
  courses,
}: {
  initialInstructors: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [instructors, setInstructors] = useState<any[]>(initialInstructors);
  const [showCreate, setShowCreate] = useState(false);
  const [editingInst, setEditingInst] = useState<any | null>(null);
  const [editCourseIds, setEditCourseIds] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    title: "Senior Cohort Instructor",
    courseIds: [] as string[],
  });
  const [busy, setBusy] = useState(false);

  async function refreshList() {
    const list = await fetch("/api/admin/instructors").then((x) => x.json());
    if (Array.isArray(list)) setInstructors(list);
    router.refresh();
  }

  async function createInstructor(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/admin/instructors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(d.error || "Could not create instructor");
    toast.success("Instructor tenant created");
    setF({ name: "", email: "", password: "", title: "Senior Cohort Instructor", courseIds: [] });
    setShowCreate(false);
    await refreshList();
  }

  function openAssignModal(inst: any) {
    const ids = (inst.assignedCourses || []).map((c: any) => String(c._id || c));
    setEditCourseIds(ids);
    setEditingInst(inst);
  }

  async function saveAssignedCourses(e: React.FormEvent) {
    e.preventDefault();
    if (!editingInst) return;
    setSavingEdit(true);
    const r = await fetch(`/api/admin/instructors/${editingInst._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds: editCourseIds }),
    });
    setSavingEdit(false);
    if (r.ok) {
      toast.success("Assigned cohorts updated");
      setEditingInst(null);
      await refreshList();
    } else {
      toast.error("Failed to update course assignments");
    }
  }

  async function toggleSuspend(inst: any) {
    const next = !inst.isSuspended;
    const r = await fetch(`/api/admin/instructors/${inst._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: next }),
    });
    if (r.ok) {
      setInstructors((prev) =>
        prev.map((x) => (x._id === inst._id ? { ...x, isSuspended: next } : x))
      );
      toast.success(next ? "Instructor suspended" : "Instructor activated");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this instructor account?")) return;
    const r = await fetch(`/api/admin/instructors/${id}`, { method: "DELETE" });
    if (r.ok) {
      setInstructors((prev) => prev.filter((x) => x._id !== id));
      toast.success("Instructor removed");
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Minimalist Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-slate-500">
          {instructors.length} instructor tenant{instructors.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="btn-primary btn-sm"
        >
          <UserPlus size={14} /> New Instructor
        </button>
      </div>

      {/* Instructor Roster */}
      {instructors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <p className="text-sm text-slate-500">
            No instructor accounts configured yet.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn-outline btn-sm"
          >
            <UserPlus size={14} /> Create First Instructor
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {instructors.map((inst) => {
            const assignedList = (inst.assignedCourses || [])
              .map((c: any) =>
                typeof c === "object" && c?.title
                  ? c
                  : courses.find((x) => x._id === String(c))
              )
              .filter(Boolean);

            return (
              <div
                key={inst._id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#063F38]/15 bg-[#F4FFE2] text-xs font-bold text-[#063F38]">
                      {inst.name?.[0] || "I"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-900 text-sm">
                          {inst.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            inst.isSuspended
                              ? "bg-rose-50 text-rose-700"
                              : "bg-[#F4FFE2] text-[#063F38]"
                          }`}
                        >
                          {inst.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </div>
                      <p className="truncate text-xs text-slate-500 mt-0.5">
                        {inst.title || "Cohort Instructor"}
                      </p>
                      <p className="truncate font-mono text-[11px] text-slate-400">
                        {inst.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openAssignModal(inst)}
                      className="btn-outline btn-sm !px-2.5 text-xs"
                      title="Assign Cohorts"
                    >
                      <Pencil size={12} /> Cohorts
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSuspend(inst)}
                      className="btn-ghost btn-sm !px-2 text-slate-500 hover:text-slate-900"
                      title={inst.isSuspended ? "Activate" : "Suspend"}
                    >
                      {inst.isSuspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(inst._id)}
                      className="btn-ghost btn-sm !px-2 text-rose-600 hover:bg-rose-50"
                      title="Delete Instructor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Assigned Courses Only */}
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <BookOpen size={11} /> Assigned Cohorts ({assignedList.length})
                    </span>
                  </div>
                  {assignedList.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => openAssignModal(inst)}
                      className="text-xs font-medium text-slate-400 hover:text-[#063F38]"
                    >
                      + Assign cohort courses
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedList.map((c: any) => (
                        <span
                          key={c._id}
                          className="rounded-md border border-[#063F38]/15 bg-[#F4FFE2]/60 px-2.5 py-1 text-xs font-medium text-[#063F38]"
                        >
                          {c.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Minimalist Modal: Create New Instructor */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={16} className="text-[#063F38]" /> Create Instructor Account
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createInstructor} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label text-xs">Full Name</label>
                  <input
                    required
                    className="input text-sm"
                    value={f.name}
                    onChange={(e) => setF({ ...f, name: e.target.value })}
                    placeholder="Usman Tariq"
                  />
                </div>
                <div>
                  <label className="label text-xs">Title / Specialization</label>
                  <input
                    className="input text-sm"
                    value={f.title}
                    onChange={(e) => setF({ ...f, title: e.target.value })}
                    placeholder="Senior Cohort Instructor"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Email Address</label>
                <input
                  required
                  type="email"
                  autoComplete="off"
                  className="input text-sm"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                  placeholder="instructor@itskillcore.pk"
                />
              </div>

              <div>
                <label className="label text-xs">Initial Password</label>
                <div className="flex gap-2">
                  <input
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="input font-mono text-xs"
                    value={f.password}
                    onChange={(e) => setF({ ...f, password: e.target.value })}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setF({ ...f, password: genPw() })}
                    className="btn-outline btn-sm"
                    title="Generate Strong Password"
                  >
                    <Wand2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Email: ${f.email}\nPassword: ${f.password}`);
                      toast.success("Credentials copied");
                    }}
                    className="btn-outline btn-sm"
                    title="Copy Credentials"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="label text-xs">Assign Cohort Courses</label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
                  {courses.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={f.courseIds.includes(c._id)}
                        onChange={(e) =>
                          setF({
                            ...f,
                            courseIds: e.target.checked
                              ? [...f.courseIds, c._id]
                              : f.courseIds.filter((x) => x !== c._id),
                          })
                        }
                      />
                      <span className="truncate">{c.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button disabled={busy} className="btn-primary btn-sm">
                  {busy ? "Creating…" : "Create Instructor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Minimalist Modal: Edit Assigned Cohorts */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Assign Cohorts</h2>
                <p className="text-xs text-slate-500">{editingInst.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingInst(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveAssignedCourses} className="p-6 space-y-4">
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 p-2 space-y-1">
                {courses.map((c) => {
                  const checked = editCourseIds.includes(c._id);
                  return (
                    <label
                      key={c._id}
                      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(ev) =>
                          setEditCourseIds((prev) =>
                            ev.target.checked
                              ? [...prev, c._id]
                              : prev.filter((x) => x !== c._id)
                          )
                        }
                      />
                      <span className="truncate">{c.title}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button disabled={savingEdit} className="btn-primary btn-sm">
                  {savingEdit ? "Saving…" : "Save Assignments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
