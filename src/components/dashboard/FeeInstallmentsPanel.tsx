"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  ExternalLink,
  FileDown,
} from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  VERIFIED: "bg-[#C9FA52]/40 text-[#063F38]",
  SUBMITTED: "bg-[#C9FA52]/45 text-[#063F38]",
  OVERDUE: "bg-rose-100 text-rose-700",
  REJECTED: "bg-rose-50 text-rose-700",
  UNPAID: "bg-slate-100 text-slate-600",
};

export default function FeeInstallmentsPanel({
  initialInstallments,
}: {
  initialInstallments: any[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>(initialInstallments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [method, setMethod] = useState<"JazzCash" | "EasyPaisa" | "Bank Transfer">("JazzCash");
  const [txId, setTxId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitProof(e: React.FormEvent, instId: string) {
    e.preventDefault();
    if (!file || !txId.trim()) {
      return toast.error("Please enter Transaction ID / TID and select your receipt image");
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upd = await up.json();
      if (!up.ok) throw new Error(upd.error || "Receipt upload failed");

      const r = await fetch(`/api/installments/${instId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          transactionId: txId.trim(),
          receiptUrl: upd.url,
        }),
      });
      const updated = await r.json();
      if (!r.ok) throw new Error(updated.error || "Failed to submit proof");

      setItems((prev) =>
        prev.map((x) => (x._id === instId ? { ...x, ...updated } : x))
      );
      setSelectedId(null);
      setTxId("");
      setFile(null);
      toast.success("Receipt uploaded! Admin accounts team will verify within 2 hours.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Official Institute Payment Accounts Card */}
      <div className="card border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
          <CreditCard size={18} className="text-[#063F38]" />
          IT SkillCore Official Payment Accounts (Pakistan)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Transfer your monthly installment to any verified account below, then upload your screenshot &amp; Transaction ID (TID).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-[#063F38]/20 bg-[#F4FFE2]/80 p-3">
            <p className="font-bold text-[#063F38] uppercase tracking-wider text-[10px]">JazzCash Account</p>
            <p className="mt-1 font-mono font-bold text-slate-900 text-sm">0300-1234567</p>
            <p className="text-slate-600">Title: IT SkillCore</p>
          </div>
          <div className="rounded-xl border border-[#063F38]/20 bg-[#F4FFE2]/70 p-3">
            <p className="font-bold text-[#063F38] uppercase tracking-wider text-[10px]">EasyPaisa Account</p>
            <p className="mt-1 font-mono font-bold text-slate-900 text-sm">0345-7654321</p>
            <p className="text-slate-600">Title: IT SkillCore</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Meezan Bank IBAN</p>
            <p className="mt-1 font-mono font-bold text-slate-900 text-xs">PK12MEZN0002810104829101</p>
            <p className="text-slate-600">Branch: Gulberg Lahore</p>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-sm text-slate-500">
          Your monthly installment schedule appears automatically once an enrollment is approved.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((inst) => {
            const canSubmit = ["UNPAID", "OVERDUE", "REJECTED"].includes(inst.status);
            const isOpen = selectedId === inst._id;
            return (
              <div
                key={inst._id}
                className={`card flex flex-col justify-between p-5 bg-white shadow-sm border ${
                  inst.status === "OVERDUE"
                    ? "border-rose-300 ring-1 ring-rose-100"
                    : inst.status === "VERIFIED"
                    ? "border-[#063F38]/20"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`badge text-[10px] font-bold uppercase ${
                        STATUS_BADGE[inst.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {inst.status === "VERIFIED" && <CheckCircle2 size={11} className="mr-1" />}
                      {inst.status === "SUBMITTED" && <Clock size={11} className="mr-1" />}
                      {inst.status === "OVERDUE" && <AlertTriangle size={11} className="mr-1" />}
                      {inst.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Due{" "}
                      {new Date(inst.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#063F38] truncate">
                      {inst.course?.title}
                    </p>
                    <h3 className="font-bold text-slate-900 text-base">{inst.monthLabel}</h3>
                    <p className="font-mono text-xl font-extrabold text-slate-900 mt-1">
                      PKR {Number(inst.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  {inst.enrollment?.accessLocked && inst.status === "OVERDUE" && (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-start gap-2">
                      <Lock size={14} className="shrink-0 mt-0.5" />
                      <span>Classroom paused until this overdue installment is verified.</span>
                    </div>
                  )}

                  {inst.adminNote && (
                    <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700">
                      <b>Accounts Note:</b> {inst.adminNote}
                    </div>
                  )}

                  {inst.transactionId && (
                    <p className="text-xs text-slate-500">
                      {inst.paymentMethod} · TID:{" "}
                      <span className="font-mono font-bold text-slate-800">{inst.transactionId}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {inst.receiptUrl ? (
                      <a
                        href={inst.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#063F38] hover:underline"
                      >
                        View Uploaded Proof <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span />
                    )}
                    <a
                      href={`/api/installments/${inst._id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#063F38] hover:border-[#063F38]/40 hover:bg-[#F4FFE2] transition"
                    >
                      <FileDown size={12} /> {inst.status === "VERIFIED" ? "Official Receipt PDF" : "Invoice PDF"}
                    </a>
                  </div>

                  {canSubmit && !isOpen && (
                    <button
                      type="button"
                      onClick={() => setSelectedId(inst._id)}
                      className="btn-accent btn-sm w-full"
                    >
                      <Upload size={14} /> Upload Payment Proof
                    </button>
                  )}

                  {canSubmit && isOpen && (
                    <form onSubmit={(e) => submitProof(e, inst._id)} className="space-y-2.5">
                      <select
                        className="input text-xs"
                        value={method}
                        onChange={(e) => setMethod(e.target.value as any)}
                      >
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Bank Transfer">Bank Transfer (IBAN)</option>
                      </select>
                      <input
                        required
                        className="input text-xs"
                        placeholder="Transaction ID / TID (e.g. JC-8829104)"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                      />
                      <label className="block rounded-xl border border-dashed border-slate-300 p-2.5 text-center text-xs text-slate-600 cursor-pointer hover:border-emerald-500">
                        {file ? (
                          <span className="font-bold text-[#063F38]">{file.name}</span>
                        ) : (
                          "Select receipt screenshot (PNG/JPG/PDF)"
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept=".png,.jpg,.jpeg,.webp,.pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button disabled={busy} type="submit" className="btn-primary btn-sm flex-1 text-xs">
                          {busy ? "Uploading…" : "Submit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          className="btn-ghost btn-sm text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
