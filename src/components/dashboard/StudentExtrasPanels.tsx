"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  Radio,
  Calendar,
  ExternalLink,
  Clock,
  CheckSquare,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  PlayCircle,
  KeyRound,
  CalendarOff,
  Download,
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** 5-Day-a-Week Live Timetable, Live PIN Verification & Leave Credit Panel */
export function LiveSchedulePanel({
  enrollments,
  onJoinLive,
  leaves: initialLeaves = [],
}: {
  enrollments: any[];
  onJoinLive: (courseId: string, courseTitle: string) => void;
  leaves?: any[];
}) {
  const active = enrollments.filter((e) => e.status === "APPROVED" && e.course);
  const [pinByCourse, setPinByCourse] = useState<Record<string, string>>({});
  const [verifyingCourse, setVerifyingCourse] = useState<string | null>(null);
  const [verifiedToday, setVerifiedToday] = useState<Record<string, boolean>>({});

  const [leaves, setLeaves] = useState<any[]>(initialLeaves);
  const [leaveCourseId, setLeaveCourseId] = useState<string>(active[0]?.course?._id || "");
  const [leaveDate, setLeaveDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  async function verifyPin(courseId: string) {
    const code = (pinByCourse[courseId] || "").trim().toUpperCase();
    if (!code) {
      toast.error("Enter the 6-character class Check-In PIN shared by your instructor.");
      return;
    }
    setVerifyingCourse(courseId);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, code }),
    });
    const d = await res.json();
    setVerifyingCourse(null);
    if (!res.ok) {
      toast.error(d.error || "Invalid or expired Check-In PIN");
      return;
    }
    setVerifiedToday((prev) => ({ ...prev, [courseId]: true }));
    setPinByCourse((prev) => ({ ...prev, [courseId]: "" }));
    toast.success("Instructor-verified attendance logged for today!");
  }

  async function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveCourseId || !leaveDate || !leaveReason.trim()) {
      toast.error("Select a cohort, date, and brief reason for leave.");
      return;
    }
    setSubmittingLeave(true);
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: leaveCourseId, dateKey: leaveDate, reason: leaveReason.trim() }),
    });
    const d = await res.json();
    setSubmittingLeave(false);
    if (!res.ok) {
      toast.error(d.error || "Could not submit leave request");
      return;
    }
    const courseObj = active.find((a) => a.course._id === leaveCourseId)?.course;
    setLeaves((prev) => [{ ...d.leave, course: courseObj || d.leave.course }, ...prev]);
    setLeaveReason("");
    toast.success("Leave & make-up recording request submitted!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="h-display text-2xl font-bold text-slate-900">
          5-Day Live Class Schedule (Mon–Fri)
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Download your recurring Mon–Fri calendar invite, verify live session attendance with your instructor&apos;s Check-In PIN, or request make-up credit.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-sm text-slate-500">
          No active live cohorts yet. Enroll in a course to unlock your weekly Mon–Fri live class schedule.
        </div>
      ) : (
        <div className="space-y-6">
          {active.map((e) => (
            <div
              key={e._id}
              className="card border-slate-200 bg-white p-6 space-y-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold uppercase tracking-wider">
                    {e.course.batchCode || "Batch 01"} · {e.course.category || "Live Cohort"} · {e.course.cohortSchedule?.durationMonths || 3} Months
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg mt-1">{e.course.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock size={13} className="text-[#063F38]" />
                    {e.course.cohortSchedule?.timing || "Monday to Friday · 8:00 PM – 9:30 PM PKT"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/courses/${e.course._id}/calendar`}
                    download
                    className="btn-outline btn-sm"
                  >
                    <Download size={13} /> Calendar (.ics)
                  </a>
                  {e.course.cohortSchedule?.liveClassLink && !e.accessLocked && (
                    <a
                      href={e.course.cohortSchedule.liveClassLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onJoinLive(e.course._id, e.course.title)}
                      className="btn-accent btn-sm"
                    >
                      <Radio size={14} /> Join Today&apos;s Live Meet <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-5">
                {DAYS.map((day, idx) => {
                  const week1Lesson = e.course.curriculum?.[0]?.lessons?.[idx];
                  return (
                    <div
                      key={day}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#063F38]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#063F38]" /> {day}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                        {week1Lesson?.title ||
                          (idx === 4 ? "Weekly Quiz & Workshop Review" : "Live Interactive Lecture")}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {idx === 4 ? "Assessment + Lab" : "Lecture + Slides + Q&A"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Live Attendance Check-In PIN Bar */}
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-[#f8faf9] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#063F38]">
                    <KeyRound size={14} /> Live Session Attendance Check-In PIN
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Enter the live 6-character PIN announced by your instructor to verify today&apos;s presence.
                  </p>
                </div>
                {verifiedToday[e.course._id] ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9FA52]/50 px-3 py-2 text-xs font-bold text-[#063F38]">
                    <CheckCircle2 size={14} /> Today Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. SC4829"
                      className="input !py-1.5 !w-36 font-mono text-xs uppercase tracking-wider"
                      value={pinByCourse[e.course._id] || ""}
                      onChange={(ev) =>
                        setPinByCourse((prev) => ({ ...prev, [e.course._id]: ev.target.value.toUpperCase() }))
                      }
                    />
                    <button
                      type="button"
                      disabled={verifyingCourse === e.course._id}
                      onClick={() => verifyPin(e.course._id)}
                      className="btn-primary btn-sm shrink-0"
                    >
                      {verifyingCourse === e.course._id ? "Verifying…" : "Verify PIN"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Leave Request & Make-Up Recording Credit */}
          <div className="card border-slate-200 bg-white p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <CalendarOff size={17} className="text-[#063F38]" /> Request Leave / Make-Up Recording Credit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unable to attend live? Submit an excuse request. When approved by your instructor, you earn verified make-up attendance credit.
              </p>
            </div>

            <form onSubmit={submitLeave} className="grid gap-3 sm:grid-cols-[1fr_160px_1.5fr_auto] items-end">
              <div>
                <label className="label text-xs">Cohort</label>
                <select
                  className="input text-xs"
                  value={leaveCourseId}
                  onChange={(e) => setLeaveCourseId(e.target.value)}
                >
                  {active.map((a) => (
                    <option key={a.course._id} value={a.course._id}>
                      {a.course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Session Date</label>
                <input
                  type="date"
                  className="input text-xs"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label text-xs">Reason</label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Brief reason (medical, exam, power outage)..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={submittingLeave} className="btn-primary btn-sm">
                <Send size={13} /> {submittingLeave ? "Sending…" : "Submit Leave"}
              </button>
            </form>

            {leaves.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Submitted Leave Requests
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {leaves.map((lv: any) => (
                    <div
                      key={lv._id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-[#f8faf9] p-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {lv.course?.title || "Course"} · <span className="font-mono">{lv.dateKey}</span>
                        </p>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{lv.reason}</p>
                        {(lv.reviewNote || lv.reviewerNote) && (
                          <p className="text-[11px] text-[#063F38] mt-1">
                            Note: {lv.reviewNote || lv.reviewerNote}
                          </p>
                        )}
                      </div>
                      <span
                        className={`badge text-[10px] font-bold shrink-0 ${
                          lv.status === "APPROVED"
                            ? "bg-[#C9FA52]/50 text-[#063F38]"
                            : lv.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {lv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Student Portal Quizzes & Score History Panel */
export function StudentQuizzesPanel({
  quizzes,
  quizSubmissions,
}: {
  quizzes: any[];
  quizSubmissions: any[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="h-display text-2xl font-bold text-slate-900">
          Cohort Quizzes &amp; Evaluation Scores
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Track milestone quiz results required for your 75%+ Attendance &amp; Capstone Certificate Gate, or launch open quizzes directly in your classroom.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-sm text-slate-500">
          No quizzes have been published for your enrolled courses yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((q) => {
            const sub = quizSubmissions.find((s) => String(s.quiz) === String(q._id));
            return (
              <div
                key={q._id}
                className="card p-5 border-slate-200 bg-white flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold">
                      Week {q.weekNumber} · {q.course?.title || "Cohort Quiz"}
                    </span>
                    {sub ? (
                      <span
                        className={`badge text-xs font-bold ${
                          sub.passed
                            ? "bg-[#C9FA52]/40 text-[#063F38]"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {sub.passed ? (
                          <CheckCircle2 size={12} className="mr-1" />
                        ) : (
                          <XCircle size={12} className="mr-1" />
                        )}
                        {sub.score}% ({sub.passed ? "Passed" : "Retry"})
                      </span>
                    ) : (
                      <span className="badge bg-[#C9FA52]/45 text-[#063F38] text-xs font-bold">
                        Pending Attempt
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{q.title}</h3>
                  <p className="text-xs text-slate-500">
                    {q.questions?.length || 0} multiple-choice questions · Passing threshold:{" "}
                    <b>{q.passingScore || 70}%</b>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {sub
                      ? `Last attempt: ${new Date(sub.submittedAt).toLocaleDateString("en-GB")}`
                      : "Complete inside classroom player"}
                  </span>
                  {q.course?.slug && (
                    <Link href={`/learn/${q.course.slug}`} className="btn-primary btn-sm text-xs">
                      <CheckSquare size={13} /> {sub ? "Retake / Review" : "Start Quiz"}
                    </Link>
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

/** Student Lesson Q&A Discussions Panel */
export function StudentQAPanel({
  initialQuestions,
}: {
  initialQuestions: any[];
}) {
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  async function sendFollowUp(qid: string) {
    const msg = replyDrafts[qid]?.trim();
    if (!msg) return;
    const r = await fetch(`/api/qa/${qid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await r.json();
    if (!r.ok) return toast.error(data.error || "Could not post reply");
    setQuestions((prev) => prev.map((q) => (q._id === qid ? data : q)));
    setReplyDrafts((prev) => ({ ...prev, [qid]: "" }));
    toast.success("Follow-up posted to lesson thread!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="h-display text-2xl font-bold text-slate-900">
          Lesson Q&amp;A &amp; Instructor Answers
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Track instructor responses to questions from your cohorts, or jump straight into any lesson thread inside the classroom player.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="card p-12 text-center border-slate-200 text-sm text-slate-500">
          <MessageSquare className="mx-auto mb-2 text-slate-300" size={40} />
          No Q&amp;A questions posted in your cohorts yet. Open any class and click &quot;Ask Instructor&quot; to start a thread.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="card p-5 border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-[10px] font-bold mr-2">
                    {q.course?.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{q.lessonTitle}</span>
                </div>
                <span
                  className={`badge text-[10px] font-bold uppercase ${
                    q.isResolved
                      ? "bg-[#C9FA52]/40 text-[#063F38]"
                      : "bg-[#C9FA52]/45 text-[#063F38]"
                  }`}
                >
                  {q.isResolved ? "Answered" : "Awaiting Reply"}
                </span>
              </div>

              <p className="text-sm text-slate-800 font-medium">{q.question}</p>

              {q.replies?.length > 0 && (
                <div className="space-y-2 border-l-2 border-[#063F38]/20 pl-4">
                  {q.replies.map((rep: any, rIdx: number) => (
                    <div
                      key={rep._id || rIdx}
                      className={`rounded-xl p-3 text-xs ${
                        rep.authorRole === "ADMIN"
                          ? "bg-[#F4FFE2] border border-[#063F38]/20 text-emerald-950"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <b>{rep.authorName}</b>{" "}
                      {rep.authorRole === "ADMIN" && (
                        <span className="ml-1 rounded bg-[#063F38] px-1.5 py-0.5 text-[9px] font-bold text-white">
                          INSTRUCTOR
                        </span>
                      )}
                      <p className="mt-1">{rep.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  className="input text-xs flex-1 min-w-[200px]"
                  value={replyDrafts[q._id] || ""}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Write a follow-up question…"
                />
                <button
                  type="button"
                  onClick={() => sendFollowUp(q._id)}
                  className="btn-outline btn-sm text-xs"
                >
                  <Send size={13} /> Reply
                </button>
                {q.course?.slug && (
                  <Link href={`/learn/${q.course.slug}`} className="btn-ghost btn-sm text-xs text-[#063F38]">
                    <PlayCircle size={13} /> Open Lesson
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
