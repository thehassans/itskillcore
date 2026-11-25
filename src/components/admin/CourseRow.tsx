"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { finalPrice } from "@/lib/utils";

export default function CourseRow({ c }: { c: any }) {
  const router = useRouter();
  const call = async (method: string, body?: object) => {
    const r = await fetch(`/api/courses/${c._id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
    r.ok ? (toast.success("Updated"), router.refresh()) : toast.error("Action failed");
  };

  async function cloneBatch() {
    const r = await fetch(`/api/courses/${c._id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const d = await r.json();
    if (!r.ok) return toast.error(d.error || "Could not clone cohort");
    toast.success(`Cloned as ${d.course.batchCode} with ${d.clonedAssignments} assignments & ${d.clonedQuizzes} quizzes!`);
    router.refresh();
  }

  const p = finalPrice(c);
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-[#F4FFE2]/30 transition">
      <td className="p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.thumbnail}
            alt=""
            className="h-12 w-20 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <b className="text-slate-900">{c.title}</b>
              <span className="badge bg-[#F4FFE2] text-[#063F38] font-mono text-[10px]">
                {c.batchCode || "Batch 01"}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {c.category} · {c.level} · {c.maxSeats || 40} seats
            </span>
          </div>
        </div>
      </td>
      <td className="p-4 font-semibold text-slate-900">
        {p === 0 ? <span className="text-[#063F38]">Free</span> : `$${p}`}
      </td>
      <td className="p-4">
        <StatusBadge s={c.isPublished ? "Published" : "Draft"} />
      </td>
      <td className="p-4">
        <div className="flex justify-end gap-1.5">
          <button
            title="Clone Next Cohort Batch"
            onClick={cloneBatch}
            className="btn-outline btn-sm text-xs"
          >
            <Copy size={13} className="text-[#063F38]" /> Clone Batch
          </button>
          <button
            title={c.isPublished ? "Unpublish" : "Publish"}
            onClick={() => call("PUT", { isPublished: !c.isPublished })}
            className="btn-outline btn-sm"
          >
            {c.isPublished ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} className="text-[#063F38]" />
            )}
          </button>
          <Link href={`/admin/courses/${c._id}`} className="btn-outline btn-sm">
            <Pencil size={14} className="text-[#063F38]" /> Edit
          </Link>
          <button
            onClick={() =>
              confirm(`Delete "${c.title}"? This cannot be undone.`) && call("DELETE")
            }
            className="btn-danger btn-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
