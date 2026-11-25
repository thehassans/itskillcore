"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function EnrollmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const set = async (s: string) => {
    setBusy(true);
    const r = await fetch(`/api/enrollments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
    setBusy(false);
    r.ok ? (toast.success(s === "APPROVED" ? "Enrollment approved. Course unlocked." : "Enrollment rejected"), router.refresh()) : toast.error("Action failed");
  };
  return (
    <div className="flex justify-end gap-2">
      {status !== "APPROVED" && <button disabled={busy} onClick={() => set("APPROVED")} className="btn-success btn-sm"><Check size={14} />Approve</button>}
      {status === "PENDING" && <button disabled={busy} onClick={() => set("REJECTED")} className="btn-danger btn-sm"><X size={14} />Reject</button>}
    </div>
  );
}
