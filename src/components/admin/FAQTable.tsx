"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FAQForm from "./FAQForm";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export default function FAQTable({ faqs }: { faqs: FAQItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<FAQItem | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("FAQ deleted"); router.refresh(); }
    else toast.error("Failed to delete");
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-display text-2xl">FAQs</h1>
        <button onClick={() => setCreating(true)} className="btn-primary"><Plus size={16} />Add FAQ</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {["Question", "Category", "Order", ""].map((h) => (
                <th key={h} className="p-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {faqs.map((f) => (
              <tr key={f._id} className="border-b border-slate-50 hover:bg-[#F4FFE2]/30 transition">
                <td className="p-4 font-medium text-slate-800 max-w-sm truncate">{f.question}</td>
                <td className="p-4"><span className="badge">{f.category || "General"}</span></td>
                <td className="p-4 text-slate-500">{f.order}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(f)} className="btn-ghost !px-2 text-slate-500 hover:text-[#063F38]" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(f._id)} className="btn-ghost !px-2 text-slate-500 hover:text-rose-600" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {faqs.length === 0 && <p className="p-10 text-center text-slate-400">No FAQs yet. Create your first one.</p>}
      </div>

      {creating && <FAQForm onClose={() => setCreating(false)} />}
      {editing && <FAQForm faq={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
