"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, X, Copy, Wand2 } from "lucide-react";

const genPw = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  const a = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(a, (n) => c[n % c.length]).join("");
};

export default function CreateStudentForm({ courses }: { courses: { _id: string; title: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, courseIds: sel }) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(d.error ?? "Could not create student");
    toast.success("Student created" + (sel.length ? " and courses assigned" : ""));
    setOpen(false); setF({ name: "", email: "", password: "" }); setSel([]); router.refresh();
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary"><UserPlus size={16} />Create student & assign course</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6 shadow-2xl border-slate-200">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">Create student & assign courses</h2><button type="button" onClick={() => setOpen(false)} className="btn-ghost !p-1.5"><X size={18} /></button></div>
            <div><label className="label">Full name</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><label className="label">Login password</label>
              <div className="flex gap-2">
                <input className="input font-mono" minLength={8} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                <button type="button" className="btn-outline" title="Auto-generate" onClick={() => setF({ ...f, password: genPw() })}><Wand2 size={16} className="text-[#063F38]" /></button>
                <button type="button" className="btn-outline" title="Copy credentials" onClick={() => { navigator.clipboard.writeText(`Email: ${f.email}\nPassword: ${f.password}`); toast.success("Credentials copied"); }}><Copy size={16} className="text-[#063F38]" /></button>
              </div>
            </div>
            <div><label className="label">Assign courses (instantly approved)</label>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {courses.map((c) => (
                  <label key={c._id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#F4FFE2]/60 font-medium text-slate-700">
                    <input type="checkbox" className="h-4 w-4 accent-emerald-600 rounded" checked={sel.includes(c._id)} onChange={(e) => setSel(e.target.checked ? [...sel, c._id] : sel.filter((x) => x !== c._id))} />{c.title}
                  </label>))}
              </div></div>
            <button disabled={busy} className="btn-primary w-full">{busy ? "Creating…" : "Create student"}</button>
          </form>
        </div>
      )}
    </>
  );
}
