"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldOff, ShieldCheck, Trash2 } from "lucide-react";

export default function CertificateActionButtons({
  id,
  isRevoked,
}: {
  id: string;
  isRevoked?: boolean;
}) {
  const router = useRouter();

  async function toggleRevoke() {
    const r = await fetch(`/api/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRevoked: !isRevoked }),
    });
    if (r.ok) {
      toast.success(!isRevoked ? "Certificate revoked" : "Certificate restored");
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm("Permanently delete this certificate record?")) return;
    const r = await fetch(`/api/certificates/${id}`, { method: "DELETE" });
    if (r.ok) {
      toast.success("Certificate deleted");
      router.refresh();
    }
  }

  return (
    <span className="inline-flex items-center gap-2 ml-3">
      <button
        type="button"
        onClick={toggleRevoke}
        className="text-xs font-semibold text-slate-500 hover:text-[#063F38]"
        title={isRevoked ? "Restore Certificate" : "Revoke Certificate"}
      >
        {isRevoked ? (
          <span className="inline-flex items-center gap-1 text-[#063F38]">
            <ShieldCheck size={13} /> Restore
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-600">
            <ShieldOff size={13} /> Revoke
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={remove}
        className="text-rose-600 hover:text-rose-800"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </span>
  );
}
