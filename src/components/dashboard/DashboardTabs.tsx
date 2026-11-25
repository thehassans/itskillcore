"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  UserCog,
  Download,
  PlayCircle,
  Clock,
  XCircle,
  CheckCircle2,
  LogOut,
  Bell,
  Radio,
  ExternalLink,
  Copy,
  Check,
  FileCheck,
  CreditCard,
  Trophy,
  Flame,
  ShieldCheck,
  Lock,
  Calendar,
  CheckSquare,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  Menu,
  Upload,
} from "lucide-react";
import FeeInstallmentsPanel from "@/components/dashboard/FeeInstallmentsPanel";
import LeaderboardPanel from "@/components/dashboard/LeaderboardPanel";
import {
  LiveSchedulePanel,
  StudentQuizzesPanel,
  StudentQAPanel,
} from "@/components/dashboard/StudentExtrasPanels";
import GoldenSeal from "@/components/certificate/GoldenSeal";

type TabKey =
  | "overview"
  | "courses"
  | "schedule"
  | "assignments"
  | "quizzes"
  | "qa"
  | "inbox"
  | "fees"
  | "leaderboard"
  | "certs"
  | "profile";

export default function DashboardTabs({
  studentId = "",
  name,
  email,
  avatar,
  enrollments,
  certificates,
  broadcasts = [],
  assignments = [],
  submissions = [],
  quizzes = [],
  quizSubmissions = [],
  questions = [],
  leaves = [],
  attendanceCount = 0,
  installments = [],
  eligibilityList = [],
  leaderboard = [],
  meStats = null,
}: {
  studentId?: string;
  name: string;
  email: string;
  avatar: string;
  enrollments: any[];
  certificates: any[];
  broadcasts?: any[];
  assignments?: any[];
  submissions?: any[];
  quizzes?: any[];
  quizSubmissions?: any[];
  questions?: any[];
  leaves?: any[];
  attendanceCount?: number;
  installments?: any[];
  eligibilityList?: any[];
  leaderboard?: any[];
  meStats?: any | null;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveAttendance, setLiveAttendance] = useState(attendanceCount);
  const [claimingCourseId, setClaimingCourseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isValidAvatar = (u?: string) => Boolean(u && /^(\/|https?:\/\/)/.test(u.trim()));
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const [p, setP] = useState({
    name,
    avatar: isValidAvatar(avatar) ? avatar : "",
    currentPassword: "",
    newPassword: "",
  });
  const [busy, setBusy] = useState(false);

  async function logLiveJoin(courseId: string, courseTitle: string) {
    try {
      const r = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonTitle: `${courseTitle} · Live Cohort Session`,
        }),
      });
      const data = await r.json();
      if (r.ok) {
        if (typeof data.totalAttended === "number") setLiveAttendance(data.totalAttended);
        toast.success("Live class attendance marked!");
      }
    } catch {
      // non-blocking
    }
  }

  async function claimCertificate(courseId: string) {
    setClaimingCourseId(courseId);
    try {
      const r = await fetch("/api/certificates/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Could not claim certificate");
      toast.success(`Certificate ${data.certificateId} unlocked with IT SkillCore Golden Seal!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setClaimingCourseId(null);
    }
  }

  async function uploadAvatarFile(file?: File) {
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setUploadingAvatar(false);
    if (r.ok && d.url) {
      setAvatarFailed(false);
      setP((prev) => ({ ...prev, avatar: d.url }));
      toast.success("Photo ready — click Save changes to apply");
    } else {
      toast.error(d.error || "Upload failed");
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const safeAvatar = isValidAvatar(p.avatar) ? p.avatar.trim() : "";
    const body: any = { name: p.name.trim(), avatar: safeAvatar };
    if (p.newPassword) {
      body.currentPassword = p.currentPassword;
      body.newPassword = p.newPassword;
    }
    const r = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(d.error ?? "Could not update profile");
    toast.success("Profile updated");
    setP({ ...p, avatar: safeAvatar, currentPassword: "", newPassword: "" });
    router.refresh();
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Broadcast link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingFeeCount = installments.filter((i: any) =>
    ["UNPAID", "OVERDUE", "REJECTED"].includes(i.status)
  ).length;
  const overdueLockedCount = enrollments.filter((e: any) => e.accessLocked).length;
  const pendingHwCount = assignments.filter(
    (a: any) => !submissions.some((s: any) => s.assignment === a._id)
  ).length;
  const openQaCount = questions.filter((q: any) => !q.isResolved).length;
  const activeEnrollments = enrollments.filter((e) => e.status === "APPROVED");

  const navItems: Array<[TabKey, any, string, number]> = [
    ["overview", LayoutDashboard, "Overview", 0],
    ["courses", BookOpen, "My Courses", enrollments.length],
    ["schedule", Calendar, "Live Timetable", activeEnrollments.length],
    ["assignments", FileCheck, "Homework & Files", pendingHwCount || assignments.length],
    ["quizzes", CheckSquare, "Quizzes & Scores", quizzes.length],
    ["qa", MessageSquare, "Lesson Q&A", openQaCount],
    ["inbox", Bell, "Broadcast Inbox", broadcasts.length],
    ["fees", CreditCard, "Fee Installments", pendingFeeCount],
    ["leaderboard", Trophy, "Streak & Rank", meStats?.currentStreak || 0],
    ["certs", Award, "Certificates", certificates.length],
    ["profile", UserCog, "Profile Settings", 0],
  ];

  const selectTab = (k: TabKey) => {
    setTab(k);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (isMobile = false) => (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {!isMobile && collapsed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/images/it-skillcore-mark.svg" alt="IT SkillCore" className="h-8 w-8 shrink-0 object-contain" />
          ) : (
            <div className="min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/it-skillcore.svg" alt="IT SkillCore" className="h-7 w-auto object-contain" />
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {navItems.map(([k, Icon, label, count]) => {
          const on = tab === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => selectTab(k)}
              title={label}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                on
                  ? "bg-[#063F38] text-white"
                  : "text-slate-600 hover:bg-[#F4FFE2]/70 hover:text-[#063F38]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon size={17} className={`shrink-0 ${on ? "text-[#C9FA52]" : "text-slate-400"}`} />
                {(isMobile || !collapsed) && <span className="truncate">{label}</span>}
              </span>
              {(isMobile || !collapsed) && count > 0 && (
                <span
                  className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    k === "fees" && overdueLockedCount > 0
                      ? "bg-rose-100 text-rose-700"
                      : on
                      ? "bg-[#C9FA52] text-[#063F38]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-slate-200 p-2.5 text-[13px]">
        {studentId && (
          <Link
            href={`/portfolio/${studentId}`}
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#063F38] bg-[#F4FFE2]/70 hover:bg-[#C9FA52]/40 font-semibold"
          >
            <Award size={17} className="shrink-0" />
            {(isMobile || !collapsed) && "Graduate Portfolio"}
          </Link>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-700 font-medium"
        >
          <LogOut size={17} className="shrink-0" />
          {(isMobile || !collapsed) && "Sign out"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      {/* Desktop Sticky Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex sticky top-0 z-30 h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-white shadow-2xl">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content Area + Top Navbar */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn-ghost !px-2 text-slate-600 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:inline-flex btn-ghost !px-2.5 text-slate-600 hover:text-[#063F38]"
              aria-label="Toggle sidebar"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            {/* Quick Top Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Link href="/" className="rounded-lg px-2.5 py-1.5 hover:bg-[#F4FFE2] hover:text-[#063F38]">
                Home
              </Link>
              <Link href="/courses" className="rounded-lg px-2.5 py-1.5 hover:bg-[#F4FFE2] hover:text-[#063F38]">
                Catalog
              </Link>
              <Link href="/verify" className="rounded-lg px-2.5 py-1.5 hover:bg-[#F4FFE2] hover:text-[#063F38]">
                Verify
              </Link>
              <Link href="/blog" className="rounded-lg px-2.5 py-1.5 hover:bg-[#F4FFE2] hover:text-[#063F38]">
                Blog
              </Link>
              <Link href="/#contact" className="rounded-lg px-2.5 py-1.5 hover:bg-[#F4FFE2] hover:text-[#063F38]">
                Help &amp; Support
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {meStats && (
              <button
                type="button"
                onClick={() => setTab("leaderboard")}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#063F38]/20 bg-[#F4FFE2] px-3 py-1 text-xs font-bold text-[#063F38] hover:bg-[#C9FA52]/40 transition"
              >
                <Flame size={13} /> {meStats.currentStreak}d Streak · Rank #{meStats.rank}
              </button>
            )}
            <div className="flex items-center gap-2.5">
              {isValidAvatar(p.avatar) && !avatarFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.avatar}
                  alt=""
                  onError={() => setAvatarFailed(true)}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-[#063F38]/20"
                />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#063F38] text-xs font-bold text-white">
                  {(name || "S").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-bold text-slate-900">{name}</p>
                <p className="text-[11px] text-slate-500">Student</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* OVERVIEW TAB */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="h-display text-2xl text-slate-900">
                    Welcome back, {name.split(" ")[0]}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {email} · 3-Month Live Cohort Student Workspace
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setTab("schedule")} className="btn-accent btn-sm">
                    <Radio size={15} /> Today&apos;s Live Class
                  </button>
                  <button onClick={() => setTab("assignments")} className="btn-primary btn-sm">
                    <FileCheck size={15} /> Homework ({pendingHwCount} due)
                  </button>
                  <button onClick={() => setTab("fees")} className="btn-outline btn-sm">
                    <CreditCard size={15} /> Fee Installments
                  </button>
                </div>
              </div>

              {/* Action Alerts */}
              <div className="grid gap-3 md:grid-cols-2">
                {overdueLockedCount > 0 && (
                  <button
                    onClick={() => setTab("fees")}
                    className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-sm text-rose-900 hover:bg-rose-100 transition"
                  >
                    <span>
                      <b>{overdueLockedCount}</b> course classroom paused due to overdue installment.
                    </span>
                    <span className="flex items-center gap-1 font-bold text-rose-700">
                      Upload Proof <ArrowRight size={14} />
                    </span>
                  </button>
                )}
                {pendingHwCount > 0 && (
                  <button
                    onClick={() => setTab("assignments")}
                    className="flex items-center justify-between rounded-2xl border border-[#063F38]/20 bg-[#F4FFE2] p-4 text-left text-sm text-[#063F38] hover:bg-[#C9FA52]/40 transition"
                  >
                    <span>
                      <b>{pendingHwCount}</b> homework assignment{pendingHwCount > 1 ? "s" : ""} waiting for your submission.
                    </span>
                    <span className="flex items-center gap-1 font-bold text-[#063F38]">
                      Upload now <ArrowRight size={14} />
                    </span>
                  </button>
                )}
              </div>

              {/* Architectural KPI Summary Strip */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white grid grid-cols-2 divide-y divide-slate-200 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
                <div className="p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Cohorts</p>
                    <BookOpen size={16} className="text-[#063F38]/60" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">{activeEnrollments.length}</p>
                </div>
                <div className="p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Sessions</p>
                    <Radio size={16} className="text-[#063F38]/60" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">{liveAttendance}</p>
                </div>
                <div className="p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Streak &amp; Rank</p>
                    <Flame size={16} className="text-[#063F38]/60" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {meStats?.currentStreak || 0}d <span className="text-sm font-semibold text-[#063F38]">#{meStats?.rank || "-"}</span>
                  </p>
                </div>
                <div className="p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Certificates</p>
                    <Award size={16} className="text-[#063F38]/60" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">{certificates.length}</p>
                </div>
                <div className="p-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Broadcasts</p>
                    <Bell size={16} className="text-[#063F38]/60" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">{broadcasts.length}</p>
                </div>
              </div>

              {/* Active Cohorts + Recent Broadcasts Grid */}
              <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                <div className="card overflow-hidden border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <h2 className="font-bold text-slate-900">Your Active Live Cohorts</h2>
                    <button
                      onClick={() => setTab("courses")}
                      className="text-xs font-semibold text-[#063F38] hover:text-[#063F38]"
                    >
                      View all ({enrollments.length})
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {enrollments.slice(0, 4).map((e) => {
                      const total =
                        e.course.curriculum.reduce((n: number, m: any) => n + m.lessons.length, 0) || 1;
                      const doneLen = Array.isArray(e.progress) ? e.progress.length : 0;
                      const pct = Math.min(100, Math.round((doneLen / total) * 100));
                      return (
                        <div
                          key={e._id}
                          className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-[#F4FFE2]/20"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 text-sm truncate">{e.course.title}</p>
                            <p className="text-xs text-slate-500">
                              {e.status} · {doneLen}/{total} lessons ({pct}%)
                            </p>
                          </div>
                          {e.status === "APPROVED" ? (
                            e.accessLocked ? (
                              <button onClick={() => setTab("fees")} className="btn-accent btn-sm text-xs">
                                <Lock size={13} /> Locked
                              </button>
                            ) : (
                              <Link href={`/learn/${e.course.slug}`} className="btn-primary btn-sm text-xs">
                                <PlayCircle size={13} /> Classroom
                              </Link>
                            )
                          ) : (
                            <span className="badge bg-[#F4FFE2] text-[#063F38] text-xs">{e.status}</span>
                          )}
                        </div>
                      );
                    })}
                    {enrollments.length === 0 && (
                      <div className="p-8 text-center text-sm text-slate-500">
                        You haven&apos;t enrolled yet.{" "}
                        <Link href="/courses" className="text-[#063F38] font-semibold underline">
                          Explore courses →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card overflow-hidden border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <h2 className="font-bold text-slate-900">Latest Broadcast Links</h2>
                    <button
                      onClick={() => setTab("inbox")}
                      className="text-xs font-semibold text-[#063F38] hover:text-[#063F38]"
                    >
                      Open Inbox
                    </button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {broadcasts.slice(0, 3).map((b: any) => (
                      <div key={b._id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="badge bg-[#C9FA52]/45 text-[#063F38] text-[10px] font-bold">
                            {b.target === "ALL" ? "All Students" : b.course?.title || "Cohort"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(b.createdAt).toLocaleDateString("en-GB")}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{b.title}</p>
                        <a
                          href={b.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#063F38] hover:underline"
                        >
                          {b.linkLabel || "Open Broadcast Link"} <ExternalLink size={12} />
                        </a>
                      </div>
                    ))}
                    {broadcasts.length === 0 && (
                      <p className="p-8 text-center text-sm text-slate-400">No broadcasts yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY COURSES */}
          {tab === "courses" &&
            (enrollments.length === 0 ? (
              <div className="card p-12 text-center border-[#063F38]/15">
                <BookOpen className="mx-auto text-emerald-300" size={48} />
                <h3 className="mt-4 font-bold text-slate-900">No courses yet</h3>
                <p className="mt-1 text-sm text-slate-500">Browse the catalog and request enrollment.</p>
                <Link href="/courses" className="btn-primary mt-5">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((e) => {
                  const total =
                    e.course.curriculum.reduce((n: number, m: any) => n + m.lessons.length, 0) || 1;
                  const completedCount = Array.isArray(e.progress) ? e.progress.length : 0;
                  const pct = Math.min(100, Math.round((completedCount / total) * 100));
                  const [badgeCls, BIcon, badgeLabel] =
                    e.status === "APPROVED"
                      ? (["bg-[#C9FA52]/40 text-[#063F38]", CheckCircle2, "ACTIVE LIVE COHORT"] as const)
                      : e.status === "REJECTED"
                      ? (["bg-rose-100 text-rose-700", XCircle, "REJECTED"] as const)
                      : (["bg-[#C9FA52]/45 text-[#063F38]", Clock, "PENDING APPROVAL"] as const);
                  return (
                    <div
                      key={e._id}
                      className="card flex flex-col overflow-hidden border-slate-200/80 shadow-sm"
                    >
                      <div className="aspect-[16/9] bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.course.thumbnail}
                          alt={e.course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <span className={`badge w-fit text-[10px] font-bold ${badgeCls}`}>
                          <BIcon size={12} />
                          {badgeLabel}
                        </span>
                        <h3 className="font-[family-name:var(--font-head)] text-lg font-bold text-slate-900 leading-snug">
                          {e.course.title}
                        </h3>

                        {e.status === "APPROVED" ? (
                          <>
                            <div className="rounded-xl bg-[#F4FFE2]/80 border border-[#063F38]/15 p-2.5 text-xs text-slate-600">
                              <span className="font-bold text-[#063F38] block">
                                Live Schedule (5 Days/Week):
                              </span>
                              <span>
                                {e.course.cohortSchedule?.timing || "Mon–Fri · 8:00 PM – 9:30 PM PKT"}
                              </span>
                            </div>
                            <div>
                              <div className="h-2 rounded-full bg-[#F4FFE2]">
                                <div
                                  className="h-2 rounded-full bg-emerald-600 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <p className="mt-1.5 text-xs text-slate-500">
                                {completedCount} of {total} classes · <b>{pct}%</b> completed
                              </p>
                            </div>
                            <div className="mt-auto grid grid-cols-1 gap-2 pt-1">
                              {e.accessLocked ? (
                                <button
                                  type="button"
                                  onClick={() => setTab("fees")}
                                  className="btn-accent w-full text-xs"
                                >
                                  <Lock size={15} /> Overdue Fee — Upload Receipt to Unlock
                                </button>
                              ) : (
                                <Link href={`/learn/${e.course.slug}`} className="btn-primary w-full">
                                  <PlayCircle size={16} />
                                  Open Classroom &amp; Notes
                                </Link>
                              )}
                              {e.course.cohortSchedule?.liveClassLink && !e.accessLocked && (
                                <a
                                  href={e.course.cohortSchedule.liveClassLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={() => logLiveJoin(e.course._id, e.course.title)}
                                  className="btn-outline btn-sm w-full text-xs !border-[#063F38]/25 !text-[#063F38] hover:!bg-[#F4FFE2]"
                                >
                                  <Radio size={13} className="text-[#063F38]" /> Join Live Google Meet
                                </a>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="mt-auto text-sm text-slate-500">
                            {e.status === "PENDING"
                              ? "Our admin team is reviewing your request."
                              : "Please contact support for details."}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* TAB: LIVE SCHEDULE */}
          {tab === "schedule" && (
            <LiveSchedulePanel enrollments={enrollments} onJoinLive={logLiveJoin} leaves={leaves} />
          )}

          {/* TAB: QUIZZES & SCORES */}
          {tab === "quizzes" && (
            <StudentQuizzesPanel quizzes={quizzes} quizSubmissions={quizSubmissions} />
          )}

          {/* TAB: LESSON Q&A */}
          {tab === "qa" && <StudentQAPanel initialQuestions={questions} />}

          {/* TAB: BROADCAST INBOX */}
          {tab === "inbox" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Broadcast Links &amp; Announcements</h2>
                <p className="text-xs text-slate-500">
                  Live lecture links, workshop streams, and official announcements broadcast to you by administrators.
                </p>
              </div>
              {broadcasts.length === 0 ? (
                <div className="card p-12 text-center border-[#063F38]/15">
                  <Radio className="mx-auto text-emerald-300 mb-3" size={48} />
                  <h3 className="font-bold text-slate-900">No broadcasts yet</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                    Live session links and important updates from administrators appear right here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {broadcasts.map((b) => (
                    <div
                      key={b._id}
                      className="card flex flex-col justify-between p-6 border-slate-200 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="badge bg-[#C9FA52]/45 text-[#063F38] text-[10px] font-bold uppercase tracking-wider">
                            {b.target === "ALL" ? "General Announcement" : b.course?.title || "Course Broadcast"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(b.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <h3 className="font-[family-name:var(--font-head)] font-bold text-slate-900 text-lg">
                          {b.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">From: {b.senderName}</p>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">
                          {b.message}
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => copyLink(b._id, b.linkUrl)}
                          className="btn-outline btn-sm text-xs"
                        >
                          {copiedId === b._id ? (
                            <>
                              <Check size={13} className="text-[#063F38]" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy Link
                            </>
                          )}
                        </button>
                        <a
                          href={b.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary btn-sm text-xs !px-4"
                        >
                          {b.linkLabel || "Open Link"} <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ASSIGNMENTS & HOMEWORK */}
          {tab === "assignments" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Homework &amp; Assignments</h2>
                <p className="text-xs text-slate-500">
                  Track assigned homework tasks, due dates, file submissions (Word, PDF, Images), and instructor grades.
                </p>
              </div>
              {assignments.length === 0 ? (
                <div className="card p-12 text-center border-slate-200">
                  <FileCheck className="mx-auto text-emerald-300 mb-3" size={48} />
                  <h3 className="font-bold text-slate-900">No assignments assigned yet</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                    Your instructors will post weekly homework assignments here as your 3-month bootcamp progresses.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {assignments.map((a: any) => {
                    const sub = submissions.find((s: any) => s.assignment === a._id);
                    return (
                      <div
                        key={a._id}
                        className="card p-5 border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold">
                              Week {a.weekNumber} · {a.course?.title}
                            </span>
                            <span
                              className={`badge ${
                                sub?.status === "GRADED"
                                  ? "bg-[#C9FA52]/40 text-[#063F38]"
                                  : sub
                                  ? "bg-[#C9FA52]/45 text-[#063F38]"
                                  : "bg-slate-100 text-slate-600"
                              } text-xs font-bold`}
                            >
                              {sub?.status === "GRADED"
                                ? `Graded: ${sub.score} / ${a.maxScore}`
                                : sub
                                ? "Submitted"
                                : "Pending Submission"}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {a.description}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Due Date:{" "}
                            {new Date(a.dueDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                          {sub?.feedback && (
                            <div className="rounded-lg bg-[#F4FFE2] border border-[#063F38]/15 p-2.5 text-xs text-emerald-950">
                              <b>Instructor Feedback:</b> {sub.feedback}
                            </div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                          {sub ? (
                            <a
                              href={sub.fileUrl}
                              download={sub.fileName}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-outline btn-sm text-xs flex items-center gap-1.5"
                            >
                              <Download size={13} /> View My Submission
                            </a>
                          ) : (
                            <span className="text-xs text-[#063F38] font-semibold">Not submitted yet</span>
                          )}
                          {a.course?.slug && (
                            <Link href={`/learn/${a.course.slug}`} className="btn-primary btn-sm text-xs">
                              Go to Class / Submit
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: FEE INSTALLMENTS */}
          {tab === "fees" && <FeeInstallmentsPanel initialInstallments={installments} />}

          {/* TAB: LEADERBOARD & STREAKS */}
          {tab === "leaderboard" && <LeaderboardPanel leaderboard={leaderboard} me={meStats} />}

          {/* TAB: CERTIFICATES & GATE */}
          {tab === "certs" && (
            <div className="space-y-6">
              {studentId && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#063F38]/15 bg-[#F4FFE2]/60 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-[#063F38]">Public Graduate Portfolio</p>
                    <p className="text-xs text-slate-600">
                      Share your verified credentials, cohorts, and capstone grades with employers via one link.
                    </p>
                  </div>
                  <Link
                    href={`/portfolio/${studentId}`}
                    target="_blank"
                    className="btn-primary btn-sm shrink-0"
                  >
                    Open Public Portfolio <ExternalLink size={13} />
                  </Link>
                </div>
              )}
              {eligibilityList.length > 0 && (
                <div className="card p-6 border-slate-200 bg-white space-y-4">
                  <div>
                    <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <ShieldCheck size={19} className="text-[#063F38]" />
                      Certificate Eligibility Gate (75%+ Attendance &amp; Capstone)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Meet 75%+ live class attendance, graded homework average (60%+), and cohort quiz pass criteria to automatically unlock your IT SkillCore Golden-Seal Certificate.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {eligibilityList.map((el: any) => (
                      <div
                        key={el.courseId}
                        className={`rounded-2xl border p-4 space-y-3 ${
                          el.eligible
                            ? "border-[#063F38]/20 bg-[#F4FFE2]/60"
                            : "border-slate-200 bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{el.courseTitle}</h3>
                          <span
                            className={`badge text-[10px] font-bold uppercase shrink-0 ${
                              el.certificateId
                                ? "bg-[#063F38] text-white"
                                : el.eligible
                                ? "bg-[#C9FA52]/40 text-[#063F38]"
                                : "bg-[#C9FA52]/45 text-[#063F38]"
                            }`}
                          >
                            {el.certificateId ? "Issued" : el.eligible ? "Gate Unlocked" : "In Progress"}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-600">
                              Live Attendance ({el.attendedCount}/{el.totalSessions} classes · need{" "}
                              {el.requiredSessions})
                            </span>
                            <span className={el.attendanceMet ? "text-[#063F38]" : "text-[#063F38]"}>
                              {el.attendancePct}% / 75%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white ring-1 ring-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                el.attendanceMet ? "bg-emerald-600" : "bg-[#F4FFE2]0"
                              }`}
                              style={{ width: `${el.attendancePct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                          <span
                            className={`rounded-lg px-2 py-1 ${
                              el.homeworkMet
                                ? "bg-[#C9FA52]/40 text-[#063F38]"
                                : "bg-white text-slate-600 ring-1 ring-slate-200"
                            }`}
                          >
                            Capstone / HW: {el.homeworkAvg != null ? `${el.homeworkAvg}%` : "Pending"}
                          </span>
                          <span
                            className={`rounded-lg px-2 py-1 ${
                              el.quizMet
                                ? "bg-[#C9FA52]/40 text-[#063F38]"
                                : "bg-white text-slate-600 ring-1 ring-slate-200"
                            }`}
                          >
                            Quizzes Passed: {el.passedQuizCount}/{el.quizzesTotal}
                          </span>
                        </div>
                        {el.eligible && !el.certificateId && (
                          <button
                            type="button"
                            disabled={claimingCourseId === el.courseId}
                            onClick={() => claimCertificate(el.courseId)}
                            className="btn-primary btn-sm w-full"
                          >
                            <Award size={15} />
                            {claimingCourseId === el.courseId
                              ? "Minting Certificate…"
                              : "Claim Verified Golden-Seal Certificate"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certificates.length === 0 ? (
                <div className="card p-12 text-center border-[#063F38]/15">
                  <Award className="mx-auto text-[#C9FA52]" size={48} />
                  <h3 className="mt-4 font-bold text-slate-900">No certificates issued yet</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Complete the 75% Attendance &amp; Capstone Gate above to claim your certificate automatically.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {certificates.map((c) => (
                    <div
                      key={c._id}
                      className="card flex items-center gap-4 border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="h-16 w-14 shrink-0">
                        <GoldenSeal className="h-full w-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-slate-900">{c.course.title}</h3>
                        <p className="text-xs text-slate-500">
                          Issued{" "}
                          {new Date(c.issuedAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
                        </p>
                        <p className="font-mono text-xs font-semibold text-[#063F38]">
                          {c.certificateId}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Link href={`/verify/${c.certificateId}`} className="btn-outline btn-sm">
                          Verify
                        </Link>
                        <a
                          href={`/api/certificates/pdf?certId=${c.certificateId}`}
                          className="btn-primary btn-sm"
                        >
                          <Download size={14} /> PDF
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE SETTINGS */}
          {tab === "profile" && (
            <form
              onSubmit={saveProfile}
              autoComplete="off"
              className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white divide-y divide-slate-100"
            >
              <div className="px-6 py-5">
                <h2 className="text-base font-bold text-slate-900">Profile Settings</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Manage your student display identity, profile photo, and account password.
                </p>
              </div>

              {/* Clean Horizontal Avatar Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-4">
                  {isValidAvatar(p.avatar) && !avatarFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.avatar}
                      alt=""
                      onError={() => setAvatarFailed(true)}
                      className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-[#063F38]/15 bg-[#F4FFE2] text-lg font-bold text-[#063F38]">
                      {(p.name || name || "S").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                    <p className="text-xs text-slate-400">JPG or PNG, shown on Q&amp;A and portfolio</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadAvatarFile(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => avatarFileRef.current?.click()}
                    className="btn-outline btn-sm text-xs"
                  >
                    <Upload size={13} /> {uploadingAvatar ? "Uploading…" : "Upload Photo"}
                  </button>
                  {isValidAvatar(p.avatar) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFailed(false);
                        setP((prev) => ({ ...prev, avatar: "" }));
                      }}
                      className="btn-ghost btn-sm text-xs text-slate-500 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Identity */}
              <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                <div>
                  <label className="label text-xs">Full Name</label>
                  <input
                    required
                    name="display_name"
                    autoComplete="name"
                    className="input text-sm"
                    value={p.name}
                    onChange={(e) => setP({ ...p, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs">Account Email</label>
                  <input
                    readOnly
                    disabled
                    className="input text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    value={email}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Security · Change Password
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label text-xs">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      autoComplete="current-password"
                      className="input text-sm"
                      value={p.currentPassword}
                      onChange={(e) => setP({ ...p, currentPassword: e.target.value })}
                      placeholder="Required only if changing"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      autoComplete="new-password"
                      minLength={8}
                      className="input text-sm"
                      value={p.newPassword}
                      onChange={(e) => setP({ ...p, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-6 py-4 bg-slate-50/50 rounded-b-xl">
                <button disabled={busy} className="btn-primary btn-sm px-5 py-2.5">
                  {busy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
