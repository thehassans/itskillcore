import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import VerifySearchForm from "./VerifySearchForm";

export const metadata: Metadata = {
  title: "Verify Certificate | IT SkillCore",
  description:
    "Verify the authenticity of a IT SkillCore certificate by entering the certificate ID.",
};

export default function VerifyPage() {
  return (
    <>
      <Navbar />
      <main className="container-x flex min-h-[70vh] flex-col items-center justify-center py-20">
        {/* Logo mark */}
        <div className="mb-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/it-skillcore-mark.svg"
            alt="IT SkillCore"
            className="h-14 w-14"
          />
        </div>

        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#063F38]">
          Certificate Verification
        </p>
        <h1 className="section-title text-center text-slate-900">
          Verify a IT SkillCore Certificate
        </h1>
        <p className="mt-3 max-w-lg text-center text-slate-500">
          Enter the certificate ID printed on your IT SkillCore
          certificate to verify its authenticity. The ID starts with{" "}
          <span className="font-semibold text-slate-700">CERT-</span>.
        </p>

        <VerifySearchForm className="mt-10 w-full max-w-md" />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Try sample credential:</span>
          <Link
            href="/verify/CERT-ITSKILLCORE-2025"
            className="rounded-full border border-[#063F38]/20 bg-[#F4FFE2] px-3 py-1 font-mono font-bold text-[#063F38] hover:bg-[#C9FA52]/40 transition"
          >
            CERT-ITSKILLCORE-2025
          </Link>
        </div>

        {/* Decorative dots */}
        <div className="mt-16 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-200" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      </main>
      <Footer />
    </>
  );
}
