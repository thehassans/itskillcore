/* Live HTML preview mirroring the ultra-minimalist Swiss executive PDF layout (A4 landscape, 297x210). */
import { QrCode, ShieldCheck } from "lucide-react";
import GoldenSeal from "./GoldenSeal";

export type PreviewProps = {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateId: string;
  platformName: string;
  logoUrl?: string;
  signatureText: string;
  note?: string;
  attendancePct?: number;
  homeworkAvg?: number;
  qrDataUrl?: string;
};

export default function CertificatePreview(p: PreviewProps) {
  const logoSrc = p.logoUrl || "/images/it-skillcore-mark.svg";

  return (
    <div className="aspect-[297/210] w-full overflow-hidden rounded-2xl bg-white p-[2.4%] shadow-[0_12px_36px_-14px_rgba(6,63,56,0.12)] ring-1 ring-[#063F38]/12 [container-type:inline-size]">
      {/* Architectural Outer Frame with Left Pine & Lime Spine */}
      <div className="relative flex h-full w-full overflow-hidden rounded-xl border border-[#DCE6E3] bg-white">
        {/* Precision Left Spine Echoing IT SkillCore Brand Identity */}
        <div className="flex h-full w-[1%] shrink-0 flex-col">
          <div className="h-[78%] w-full bg-[#063F38]" />
          <div className="h-[22%] w-full bg-[#C9FA52]" />
        </div>

        {/* Main Gallery Sheet — clean white, zero background overlap */}
        <div className="relative flex flex-1 flex-col justify-between px-[5.4%] py-[3.8%]">
          {/* Subtle Corner Hairline Ticks */}
          <i className="pointer-events-none absolute right-[2.4%] top-[3%] h-[2cqw] w-[2cqw] border-r border-t border-[#063F38]/25" />
          <i className="pointer-events-none absolute bottom-[3%] right-[2.4%] h-[2cqw] w-[2cqw] border-b border-r border-[#063F38]/25" />

          {/* Top Bar: Logo Mark + Official Registry Pill */}
          <header className="relative flex items-center justify-between border-b border-[#E7EFED] pb-[1.8cqw]">
            <div className="flex items-center gap-[1.3cqw]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={p.platformName || "IT SkillCore"}
                className="object-contain"
                style={{ height: "4cqw", width: "4cqw" }}
              />
              <div>
                <p
                  className="font-bold tracking-[0.22em] text-[#063F38]"
                  style={{ fontSize: "1.35cqw" }}
                >
                  {(p.platformName || "IT SkillCore").toUpperCase()}
                </p>
                <p
                  className="font-semibold tracking-[0.16em] text-[#526460]"
                  style={{ fontSize: "0.84cqw" }}
                >
                  ACCREDITED COHORT CREDENTIAL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[0.8cqw] rounded-full border border-[#063F38]/18 bg-[#F4FFE2] px-[1.5cqw] py-[0.45cqw]">
              <span
                className="inline-block rounded-full bg-[#063F38]"
                style={{ width: "0.6cqw", height: "0.6cqw" }}
              />
              <span
                className="font-mono font-bold tracking-[0.12em] text-[#063F38]"
                style={{ fontSize: "0.9cqw" }}
              >
                OFFICIAL REGISTRY
              </span>
            </div>
          </header>

          {/* Centerpiece Editorial Achievement */}
          <section className="relative my-auto flex flex-col items-start py-[1.4cqw] text-left">
            <div className="flex items-center gap-[1cqw]">
              <span
                className="inline-block rounded-full bg-[#C9FA52]"
                style={{ width: "3cqw", height: "0.35cqw" }}
              />
              <span
                className="font-bold uppercase tracking-[0.24em] text-[#063F38]"
                style={{ fontSize: "1.02cqw" }}
              >
                Certificate of Completion
              </span>
            </div>

            <p
              className="mt-[1.6cqw] font-medium text-[#64748B]"
              style={{ fontSize: "1.22cqw" }}
            >
              This credential certifies that
            </p>

            <h3
              className="mt-[0.35cqw] font-bold tracking-tight text-[#042B26]"
              style={{ fontSize: "4.4cqw", lineHeight: 1.08 }}
            >
              {p.studentName || "Student Name"}
            </h3>

            {/* Minimal constrained accent hairline directly under student name */}
            <div
              className="mt-[1cqw] flex items-center"
              style={{ width: "36%", height: "1.5px", backgroundColor: "#E5EEEC" }}
            >
              <div className="h-full w-[38%] bg-[#063F38]" />
            </div>

            <p
              className="mt-[1.3cqw] max-w-[85%] leading-relaxed text-[#526460]"
              style={{ fontSize: "1.3cqw" }}
            >
              has fulfilled all live cohort sessions, capstone deliverables, and technical evaluations for
            </p>

            <p
              className="mt-[0.45cqw] font-bold tracking-tight text-[#063F38]"
              style={{ fontSize: "2.4cqw", lineHeight: 1.2 }}
            >
              {p.courseTitle || "Course Title"}
            </p>

            {(p.attendancePct != null || p.homeworkAvg != null || p.note) && (
              <div className="mt-[1.2cqw] flex flex-wrap items-center gap-[1cqw]">
                {(p.attendancePct != null || p.homeworkAvg != null) && (
                  <div
                    className="inline-flex items-center gap-[1.1cqw] rounded-lg border border-[#063F38]/15 bg-[#F4FFE2]/75 px-[1.4cqw] py-[0.45cqw] font-semibold text-[#063F38]"
                    style={{ fontSize: "1cqw" }}
                  >
                    <ShieldCheck
                      style={{ width: "1.2cqw", height: "1.2cqw" }}
                      className="text-[#063F38]"
                    />
                    <span>Verified Merit</span>
                    {p.attendancePct != null && (
                      <span className="font-mono">· {p.attendancePct}% Attendance</span>
                    )}
                    {p.homeworkAvg != null && (
                      <span className="font-mono">· {p.homeworkAvg}% Capstone</span>
                    )}
                  </div>
                )}

                {p.note && (
                  <span
                    className="rounded-lg border border-[#DCE6E3] bg-[#FAFCFB] px-[1.3cqw] py-[0.45cqw] font-medium text-[#526460]"
                    style={{ fontSize: "1cqw" }}
                  >
                    {p.note}
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Footer: Signature, Architectural Seal, QR Registry */}
          <footer className="relative flex items-end justify-between gap-[2cqw] border-t border-[#E7EFED] pt-[1.8cqw]">
            {/* Left: Authorised Signature & Issue Date */}
            <div className="w-[31%] text-left">
              <p
                className="font-serif italic font-semibold text-[#042B26]"
                style={{ fontSize: "1.9cqw" }}
              >
                {p.signatureText || "Director of Academics"}
              </p>
              <div className="my-[0.55cqw] h-[1px] w-[85%] bg-[#063F38]/28" />
              <p
                className="font-bold uppercase tracking-[0.14em] text-[#526460]"
                style={{ fontSize: "0.88cqw" }}
              >
                Authorised Signature
              </p>
              <p
                className="mt-[0.3cqw] font-medium text-[#063F38]"
                style={{ fontSize: "1cqw" }}
              >
                Issued {p.issuedAt}
              </p>
            </div>

            {/* Center: IT SkillCore Architectural Seal */}
            <div className="flex w-[22%] justify-center">
              <div style={{ width: "10cqw", height: "10cqw" }}>
                <GoldenSeal className="h-full w-full" />
              </div>
            </div>

            {/* Right: QR Code & Registry Identifier */}
            <div className="flex w-[33%] items-center justify-end gap-[1.3cqw] text-right">
              <div className="min-w-0">
                <p
                  className="font-bold uppercase tracking-[0.14em] text-[#64748B]"
                  style={{ fontSize: "0.84cqw" }}
                >
                  Registry Verification
                </p>
                <p
                  className="mt-[0.25cqw] font-mono font-bold text-[#042B26]"
                  style={{ fontSize: "1.15cqw" }}
                >
                  {p.certificateId}
                </p>
                <p
                  className="mt-[0.2cqw] truncate font-mono text-[#063F38]"
                  style={{ fontSize: "0.84cqw" }}
                >
                  /verify/{p.certificateId}
                </p>
              </div>
              {p.qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.qrDataUrl}
                  alt="Verification QR"
                  style={{ width: "5.2cqw", height: "5.2cqw" }}
                  className="shrink-0 rounded-lg border border-[#DCE6E3] bg-white p-[0.35cqw]"
                />
              ) : (
                <div
                  className="grid shrink-0 place-items-center rounded-lg border border-[#DCE6E3] bg-white p-[0.4cqw]"
                  style={{ width: "5.2cqw", height: "5.2cqw" }}
                >
                  <QrCode className="h-full w-full text-[#063F38]" />
                </div>
              )}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
