import Link from "next/link";
import { ShieldCheck, Radio } from "lucide-react";
import Newsletter from "./Newsletter";

export default function Footer() {
  const col = (title: string, items: [string, string][]) => (
    <div>
      <h4 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm font-medium text-slate-600">
        {items.map(([l, h]) => (
          <li key={l}>
            <Link href={h} className="transition hover:text-[#063F38]">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-x grid gap-10 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center transition hover:opacity-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/it-skillcore.svg" alt="IT SkillCore" className="h-8 w-auto object-contain" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Pakistan&apos;s live-cohort academy. Master software engineering, product design, data, and digital growth 5 days a week with employer-verifiable credentials.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
            <span className="rounded-md border border-[#063F38]/15 bg-[#F4FFE2] px-2.5 py-1 text-[#063F38]">
              JazzCash
            </span>
            <span className="rounded-md border border-[#063F38]/15 bg-[#F4FFE2] px-2.5 py-1 text-[#063F38]">
              EasyPaisa
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              Meezan IBAN
            </span>
          </div>
        </div>

        {col("Programs & Registry", [
          ["Live Cohorts", "/courses"],
          ["Academic Method", "/#how"],
          ["Verify Credential", "/verify"],
          ["Sample Certificate", "/verify/CERT-ITSKILLCORE-2025"],
          ["IT SkillCore Journal", "/blog"],
        ])}

        {col("Student & Legal", [
          ["Student Portal", "/dashboard"],
          ["Admissions Apply", "/register"],
          ["Frequently Asked", "/#faq"],
          ["Privacy Policy", "/privacy"],
          ["Terms of Service", "/terms"],
        ])}

        <div>
          <h4 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Cohort Dispatch
          </h4>
          <p className="mb-3 text-sm text-slate-500">
            Receive upcoming cohort start dates, fee plans, and technical guides.
          </p>
          <Newsletter />
          <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Radio size={12} className="text-[#063F38]" /> Mon–Fri Live Classes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#063F38]" /> QR Verified
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} IT SkillCore. All rights reserved.</span>
          <span>Lahore · Karachi · Islamabad · Live Worldwide</span>
        </div>
      </div>
    </footer>
  );
}
