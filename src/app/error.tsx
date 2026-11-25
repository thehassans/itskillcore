"use client";

import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-[#fbfdfb]">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#F4FFE2] text-[#063F38] mb-6">
        <AlertTriangle size={36} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-head)]">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-slate-500">
        We hit an unexpected error. You can try again or head back to the homepage.
      </p>
      {error.message && (
        <p className="mt-3 rounded-xl bg-[#F4FFE2] px-4 py-2 text-sm text-[#063F38] font-mono max-w-lg">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          <RefreshCw size={16} /> Try Again
        </button>
        <Link href="/" className="btn-outline">
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </main>
  );
}
