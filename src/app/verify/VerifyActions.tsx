"use client";
import { useState } from "react";
import { Copy, Check, Printer } from "lucide-react";

export default function VerifyActions({ certId }: { certId: string }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={copyUrl}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-[#063F38]"
      >
        {copied ? (
          <>
            <Check size={14} className="text-[#063F38]" /> Copied Link
          </>
        ) : (
          <>
            <Copy size={14} /> Copy Verify Link
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-[#063F38]"
      >
        <Printer size={14} /> Print
      </button>
    </div>
  );
}
