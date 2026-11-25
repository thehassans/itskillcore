"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tag, Plus, Trash2, Copy, Power, X } from "lucide-react";

export default function CouponManager({
  initialCoupons,
  courses,
}: {
  initialCoupons: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>(initialCoupons);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    code: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED_USD",
    discountValue: "25",
    description: "",
    maxUses: "100",
    expiresAt: "",
    applicableCourse: "",
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        discountValue: Number(f.discountValue),
        maxUses: Number(f.maxUses) || 100,
      }),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(d.error || "Could not create coupon");
    setCoupons((prev) => [d, ...prev]);
    setOpen(false);
    setF({
      code: "",
      discountType: "PERCENT",
      discountValue: "25",
      description: "",
      maxUses: "100",
      expiresAt: "",
      applicableCourse: "",
    });
    toast.success(`Coupon ${d.code} created`);
    router.refresh();
  }

  async function toggleActive(c: any) {
    const next = !c.isActive;
    const r = await fetch(`/api/coupons/${c._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    if (r.ok) {
      setCoupons((prev) => prev.map((x) => (x._id === c._id ? { ...x, isActive: next } : x)));
      toast.success(next ? `${c.code} activated` : `${c.code} paused`);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon code?")) return;
    const r = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (r.ok) {
      setCoupons((prev) => prev.filter((x) => x._id !== id));
      toast.success("Coupon deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500">
          {coupons.length} active &amp; archived code{coupons.length !== 1 ? "s" : ""}
        </span>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary btn-sm">
          <Plus size={14} /> New Coupon / Scholarship
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Cohort Scope</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coupons.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/60 transition">
                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-[#063F38]/20 bg-[#F4FFE2] px-2.5 py-1 font-mono text-xs font-bold text-[#063F38]">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        toast.success(`Copied ${c.code}`);
                      }}
                      className="text-slate-400 hover:text-[#063F38]"
                      title="Copy code"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                  {c.description && <p className="mt-1 text-xs text-slate-400">{c.description}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-slate-900">
                  {c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-600">
                  {c.applicableCourse?.title || "All Cohorts"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-slate-600">
                  {c.usedCount || 0} / {c.maxUses}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      c.isActive ? "bg-[#F4FFE2] text-[#063F38]" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right space-x-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className="btn-ghost btn-sm !px-2 text-slate-600 hover:text-[#063F38]"
                    title={c.isActive ? "Pause" : "Activate"}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c._id)}
                    className="btn-ghost btn-sm !px-2 text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-400">
            No coupon or scholarship codes created yet.
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag size={15} className="text-[#063F38]" /> Create Promo / Scholarship Code
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={create} className="p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label text-xs">Code</label>
                  <input
                    required
                    className="input font-mono text-sm uppercase"
                    value={f.code}
                    onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })}
                    placeholder="SCHOLAR50"
                  />
                </div>
                <div>
                  <label className="label text-xs">Discount Type</label>
                  <select
                    className="input text-xs"
                    value={f.discountType}
                    onChange={(e) => setF({ ...f, discountType: e.target.value as any })}
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED_USD">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label text-xs">
                    {f.discountType === "PERCENT" ? "Percentage (1–100)" : "USD Off"}
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={f.discountType === "PERCENT" ? 100 : undefined}
                    className="input text-sm"
                    value={f.discountValue}
                    onChange={(e) => setF({ ...f, discountValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Max Redemptions</label>
                  <input
                    required
                    type="number"
                    min={1}
                    className="input text-sm"
                    value={f.maxUses}
                    onChange={(e) => setF({ ...f, maxUses: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label text-xs">Cohort Scope</label>
                  <select
                    className="input text-xs"
                    value={f.applicableCourse}
                    onChange={(e) => setF({ ...f, applicableCourse: e.target.value })}
                  >
                    <option value="">All Live Cohorts</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="input text-xs"
                    value={f.expiresAt}
                    onChange={(e) => setF({ ...f, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Description / Grant Name</label>
                <input
                  className="input text-xs"
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                  placeholder="Merit Scholarship Grant (50% tuition waiver)"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setOpen(false)} className="btn-outline btn-sm">
                  Cancel
                </button>
                <button disabled={busy} className="btn-primary btn-sm">
                  {busy ? "Creating…" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
