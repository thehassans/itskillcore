import { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  GraduationCap,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import "@/models/User";
import "@/models/Course";
import { plain } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CertificatePreview from "@/components/certificate/CertificatePreview";
import VerifySearchForm from "../VerifySearchForm";
import VerifyActions from "../VerifyActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certId: string }>;
}): Promise<Metadata> {
  const { certId } = await params;
  return {
    title: `Verify ${certId} | IT SkillCore`,
    description: `Official credential verification for certificate ${certId} from IT SkillCore.`,
  };
}

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  await connectDB();

  const lookupIds =
    certId === "CERT-SKILLZONE-2025" || certId === "CERT-ITSKILLCORE-2025"
      ? ["CERT-ITSKILLCORE-2025", "CERT-SKILLZONE-2025"]
      : [certId];

  const cert: any = plain(
    await Certificate.findOne({ certificateId: { $in: lookupIds } })
      .populate("student", "name email")
      .populate(
        "course",
        "title slug thumbnail duration level category shortDescription outcomes instructor cohortSchedule"
      )
      .lean()
  );

  const qrDataUrl = cert
    ? await QRCode.toDataURL(`https://itskillcore.pk/verify/${cert.certificateId}`, {
        margin: 1,
        width: 180,
      }).catch(() => undefined)
    : undefined;

  const formattedDate = cert
    ? new Date(cert.issuedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <>
      <Navbar />
      <main className="min-h-[82vh] bg-[#fcfdfc] py-10 sm:py-12">
        <div className="container-x max-w-6xl">
          {/* Ultra-Minimal Top Navigation Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 print:hidden">
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#063F38]"
            >
              <ArrowLeft size={15} /> Verify another credential
            </Link>

            {cert && !cert.isRevoked && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#063F38]/20 bg-[#F4FFE2]/70 px-3 py-1 text-xs font-semibold text-[#063F38]">
                  <ShieldCheck size={14} className="text-[#063F38]" /> Verified Registry Record
                </span>
                <VerifyActions certId={cert.certificateId} />
              </div>
            )}
          </div>

          {cert && cert.isRevoked ? (
            <div className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-white p-10 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                <ShieldAlert size={28} />
              </div>
              <span className="inline-block rounded-md border border-rose-200 bg-rose-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-700">
                Credential Revoked
              </span>
              <h1 className="h-display mt-3 text-2xl font-bold text-slate-900">
                Certificate Invalidated
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Credential <span className="font-mono font-bold text-slate-800">{cert.certificateId}</span> has been revoked by IT SkillCore Academic Administration.
                {cert.revokedReason && ` Reason: ${cert.revokedReason}`}
              </p>
            </div>
          ) : cert ? (
            /* Asymmetric 2-Column Split: Left = Certificate, Right = Course & Credential Details */
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] items-start">
              {/* LEFT SIDE: Certificate Canvas */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-sm">
                  <CertificatePreview
                    studentName={cert.student?.name || "Student"}
                    courseTitle={cert.course?.title || "Accredited Course"}
                    issuedAt={formattedDate}
                    certificateId={cert.certificateId}
                    platformName="IT SkillCore"
                    logoUrl="/images/it-skillcore-mark.svg"
                    signatureText="Director of Academics"
                    note={cert.customNote}
                    attendancePct={cert.attendancePct}
                    homeworkAvg={cert.homeworkAvg}
                    qrDataUrl={qrDataUrl}
                  />
                </div>

                {/* Minimalist Footer Strip Below Certificate */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-5 py-3.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/it-skillcore-mark.svg"
                      alt="IT SkillCore"
                      className="h-6 w-6 object-contain"
                    />
                    <span>
                      Issued by <b className="text-slate-800">IT SkillCore Academy</b>
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-[#063F38]">
                    ID: {cert.certificateId}
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE: Ultra-Minimalist Light Course & Recipient Details */}
              <aside className="space-y-5">
                {/* Recipient & Verification Summary */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        Awarded To
                      </p>
                      <h1 className="mt-1 font-[family-name:var(--font-head)] text-xl font-bold text-slate-900">
                        {cert.student?.name || "Graduate"}
                      </h1>
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#063F38]/20 bg-[#F4FFE2] text-sm font-bold text-[#063F38]">
                      {(cert.student?.name || "S").charAt(0)}
                    </span>
                  </div>

                  {/* Date & Academic Merit Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar size={12} /> Issue Date
                      </span>
                      <p className="mt-1 font-semibold text-slate-900">{formattedDate}</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <ShieldCheck size={12} className="text-[#063F38]" /> Status
                      </span>
                      <p className="mt-1 font-semibold text-[#063F38]">Official &amp; Active</p>
                    </div>
                    {cert.attendancePct != null && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                        <span className="text-[11px] text-slate-400 block">Live Attendance</span>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                          {cert.attendancePct}%
                        </p>
                      </div>
                    )}
                    {cert.homeworkAvg != null && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                        <span className="text-[11px] text-slate-400 block">Capstone Average</span>
                        <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                          {cert.homeworkAvg}%
                        </p>
                      </div>
                    )}
                  </div>

                  {cert.customNote && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Honors / Remarks
                      </span>
                      {cert.customNote}
                    </div>
                  )}
                </div>

                {/* Course Details Card */}
                {cert.course && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                        <BookOpen size={13} className="text-[#063F38]" /> Course Details
                      </span>
                      {cert.course.category && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                          {cert.course.category}
                        </span>
                      )}
                    </div>

                    {cert.course.thumbnail && (
                      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cert.course.thumbnail}
                          alt={cert.course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <h2 className="font-[family-name:var(--font-head)] text-lg font-bold text-slate-900 leading-snug">
                        {cert.course.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {cert.course.level && (
                          <span className="inline-flex items-center gap-1">
                            <GraduationCap size={13} className="text-[#063F38]" />
                            {cert.course.level}
                          </span>
                        )}
                        {cert.course.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={13} className="text-[#063F38]" />
                            {cert.course.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {cert.course.shortDescription && (
                      <p className="text-xs leading-relaxed text-slate-600">
                        {cert.course.shortDescription}
                      </p>
                    )}

                    {cert.course.outcomes?.length > 0 && (
                      <div className="border-t border-slate-100 pt-3.5 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Skills Verified
                        </p>
                        <ul className="space-y-1.5">
                          {cert.course.outcomes.slice(0, 4).map((o: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-slate-600"
                            >
                              <CheckCircle2
                                size={13}
                                className="mt-0.5 shrink-0 text-emerald-600"
                              />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {cert.course.instructor?.name && (
                      <div className="border-t border-slate-100 pt-3.5 text-xs text-slate-500">
                        Lead Instructor:{" "}
                        <b className="text-slate-800">{cert.course.instructor.name}</b>
                      </div>
                    )}

                    {cert.course.slug && (
                      <Link
                        href={`/courses/${cert.course.slug}`}
                        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-[#F4FFE2] hover:text-[#063F38]"
                      >
                        Explore Full Course Syllabus <ExternalLink size={13} />
                      </Link>
                    )}
                  </div>
                )}
              </aside>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-[#063F38]/20 bg-[#F4FFE2] text-[#063F38]">
                <ShieldAlert size={28} />
              </div>
              <span className="inline-block rounded-full border border-[#063F38]/20 bg-[#F4FFE2] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#063F38]">
                Verification Failed
              </span>
              <h1 className="h-display mt-3 text-2xl font-bold text-slate-900">
                Certificate Not Found
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                No credential matched identifier{" "}
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {certId}
                </span>
                . Double-check the ID and try again.
              </p>

              <div className="mx-auto mt-8 max-w-md">
                <VerifySearchForm defaultValue={certId} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
