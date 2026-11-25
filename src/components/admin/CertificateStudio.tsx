"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  Download,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Upload,
} from "lucide-react";
import CertificatePreview from "@/components/certificate/CertificatePreview";

export default function CertificateStudio({ students, courses }: { students: any[]; courses: any[] }) {
  const router = useRouter();
  const logoInput = useRef<HTMLInputElement>(null);
  const [i, setI] = useState({
    studentId: "",
    courseId: "",
    issuedAt: "",
    customNote: "",
    overrideGate: false,
  });
  const [t, setT] = useState({
    studentName: "Sample Student",
    courseTitle: "Sample Course Title",
    platformName: "IT SkillCore",
    signatureText: "Director of Academics",
    logoUrl: "/images/it-skillcore-mark.png",
    note: "",
  });
  const [showCustomize, setShowCustomize] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [eligibility, setEligibility] = useState<any | null>(null);
  const [checkingGate, setCheckingGate] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!i.studentId || !i.courseId) {
      setEligibility(null);
      return;
    }
    setCheckingGate(true);
    fetch(`/api/certificates/eligibility?studentId=${i.studentId}&courseId=${i.courseId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEligibility(d))
      .catch(() => setEligibility(null))
      .finally(() => setCheckingGate(false));
  }, [i.studentId, i.courseId]);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(i),
    });
    const data = await r.json();
    if (r.ok) {
      toast.success("Certificate issued to registry");
      setI({ ...i, customNote: "", overrideGate: false });
      router.refresh();
    } else {
      toast.error(data.error || "Could not issue certificate");
    }
  }

  async function test() {
    setBusy(true);
    const r = await fetch("/api/certificates/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
    });
    setBusy(false);
    if (!r.ok) return toast.error("Could not generate PDF");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(await r.blob()),
      download: "sample-certificate.pdf",
    });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("Sample PDF downloaded");
  }

  async function uploadLogo(file?: File) {
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setUploadingLogo(false);
    if (r.ok) {
      setT((prev) => ({ ...prev, logoUrl: d.url }));
      toast.success("Logo updated");
    } else {
      toast.error(d.error || "Logo upload failed");
    }
  }

  const pickStudent = students.find((s) => s._id === i.studentId);
  const pickCourse = courses.find((c) => c._id === i.courseId);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr] items-start">
      {/* Left Minimalist Issuance Column */}
      <div className="space-y-4">
        <form onSubmit={issue} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Award size={16} className="text-[#063F38]" /> Issue Credential
            </h2>
            <span className="font-mono text-[11px] text-slate-400">75% Gate</span>
          </div>

          <div>
            <label className="label text-xs">Student</label>
            <select
              required
              className="input text-sm"
              value={i.studentId}
              onChange={(e) => setI({ ...i, studentId: e.target.value })}
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-xs">Cohort Program</label>
            <select
              required
              className="input text-sm"
              value={i.courseId}
              onChange={(e) => setI({ ...i, courseId: e.target.value })}
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {(checkingGate || eligibility) && (
            <div className="rounded-lg border border-[#063F38]/15 bg-[#F4FFE2]/50 p-3 text-xs space-y-2">
              {checkingGate ? (
                <span className="flex items-center gap-2 font-medium text-[#063F38]">
                  <Loader2 size={13} className="animate-spin" /> Checking academic eligibility…
                </span>
              ) : (
                <>
                  <div className="flex items-center justify-between font-semibold text-[#063F38]">
                    <span className="flex items-center gap-1.5">
                      {eligibility.eligible ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                      {eligibility.eligible ? "Eligible" : "Gate Pending"}
                    </span>
                    <span className="font-mono">{eligibility.attendancePct}% Att.</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                    <span>Classes {eligibility.attendedCount}/{eligibility.totalSessions}</span>
                    <span>HW {eligibility.homeworkAvg != null ? `${eligibility.homeworkAvg}%` : "N/A"}</span>
                    <span>Quiz {eligibility.passedQuizCount}/{eligibility.quizzesTotal}</span>
                  </div>
                  {!eligibility.eligible && (
                    <label className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#063F38] cursor-pointer border-t border-[#063F38]/10">
                      <input
                        type="checkbox"
                        checked={i.overrideGate}
                        onChange={(e) => setI({ ...i, overrideGate: e.target.checked })}
                      />
                      Admin override (issue anyway)
                    </label>
                  )}
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Issue Date</label>
              <input
                type="date"
                className="input text-xs"
                value={i.issuedAt}
                onChange={(e) => setI({ ...i, issuedAt: e.target.value })}
              />
            </div>
            <div>
              <label className="label text-xs">Honors Note</label>
              <input
                className="input text-xs"
                value={i.customNote}
                onChange={(e) => setI({ ...i, customNote: e.target.value })}
                placeholder="With distinction"
              />
            </div>
          </div>

          <button
            className="btn-primary w-full btn-sm py-2.5"
            disabled={Boolean(eligibility && !eligibility.eligible && !i.overrideGate)}
          >
            Issue Verified Certificate
          </button>

          {pickStudent && pickCourse && (
            <button
              type="button"
              className="btn-ghost w-full text-xs text-[#063F38]"
              onClick={() =>
                setT({ ...t, studentName: pickStudent.name, courseTitle: pickCourse.title, note: i.customNote })
              }
            >
              Preview selected in studio →
            </button>
          )}
        </form>

        {/* Collapsible Template & Sample Sandbox */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCustomize((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#063F38]" /> Customize Preview &amp; Logo
            </span>
            {showCustomize ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showCustomize && (
            <div className="border-t border-slate-100 p-5 space-y-3.5">
              <div>
                <label className="label text-xs">Preview Student Name</label>
                <input
                  className="input text-sm"
                  value={t.studentName}
                  onChange={(e) => setT({ ...t, studentName: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs">Preview Course Title</label>
                <input
                  className="input text-sm"
                  value={t.courseTitle}
                  onChange={(e) => setT({ ...t, courseTitle: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Institution</label>
                  <input
                    className="input text-xs"
                    value={t.platformName}
                    onChange={(e) => setT({ ...t, platformName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Signatory</label>
                  <input
                    className="input text-xs"
                    value={t.signatureText}
                    onChange={(e) => setT({ ...t, signatureText: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">Preview Note</label>
                <input
                  className="input text-xs"
                  value={t.note}
                  onChange={(e) => setT({ ...t, note: e.target.value })}
                  placeholder="Optional distinction badge"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {t.logoUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={t.logoUrl}
                      alt="Mark"
                      className="h-9 w-9 rounded-md border border-slate-200 bg-white object-contain p-1 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">Credential Mark</p>
                    <p className="truncate font-mono text-[10px] text-slate-400">{t.logoUrl}</p>
                  </div>
                </div>
                <input
                  ref={logoInput}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(e) => uploadLogo(e.target.files?.[0])}
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInput.current?.click()}
                  className="btn-outline btn-sm shrink-0 text-xs"
                >
                  <Upload size={12} /> {uploadingLogo ? "…" : "Replace"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Live Minimalist Preview */}
      <div className="space-y-3 xl:sticky xl:top-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Credential Canvas Preview</h2>
            <p className="text-xs text-slate-500">
              A4 Landscape · Aligned 1:1 with the downloadable verification PDF
            </p>
          </div>
          <button onClick={test} disabled={busy} className="btn-primary btn-sm">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download Sample PDF
          </button>
        </div>

        <CertificatePreview
          {...t}
          issuedAt={new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          certificateId="CERT-TEST-000000"
          attendancePct={eligibility?.attendancePct ?? 92}
          homeworkAvg={eligibility?.homeworkAvg ?? 88}
        />
      </div>
    </div>
  );
}
