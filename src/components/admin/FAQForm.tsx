"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

const categories = ["General", "Courses", "Enrollment", "Certificates", "Payments", "Technical"] as const;

interface FAQItem {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const empty: FAQItem = { question: "", answer: "", category: "General", order: 0 };

export default function FAQForm({ faq, onClose }: { faq?: FAQItem | null; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<FAQItem>(faq ?? { ...empty });
  const [saving, setSaving] = useState(false);
  const isEdit = !!faq?._id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEdit ? `/api/faqs/${faq!._id}` : "/api/faqs";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      toast.success(isEdit ? "FAQ updated" : "FAQ created");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 overflow-y-auto">
      <form onSubmit={handleSubmit} className="card w-full max-w-lg space-y-4 p-6 relative">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h2 className="h-display text-xl">{isEdit ? "Edit FAQ" : "Add FAQ"}</h2>

        <div>
          <label className="label">Question</label>
          <input className="input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
        </div>

        <div>
          <label className="label">Answer</label>
          <textarea className="input min-h-[120px]" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Order</label>
            <input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} min={0} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : isEdit ? "Update FAQ" : "Create FAQ"}</button>
        </div>
      </form>
    </div>
  );
}
