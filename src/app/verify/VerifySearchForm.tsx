"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export default function VerifySearchForm({
  className = "",
  defaultValue = "",
}: {
  className?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [certId, setCertId] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certId.trim();
    if (!trimmed) return;
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="certId" className="label">
        Certificate ID
      </label>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="certId"
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="e.g. CERT-2025-A1B2"
          className="input w-full pl-10 pr-28"
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
        >
          Verify
        </button>
      </div>
    </form>
  );
}
