"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Check,
  Award,
  FileText,
  Presentation,
  FileCheck,
  Download,
  Upload,
  ExternalLink,
  Radio,
  CheckSquare,
  AlertCircle,
  FileCode,
  Bookmark,
  Clock,
  MessageSquare,
  Send,
  Paperclip,
} from "lucide-react";

function parseTimeToSeconds(t: string): number {
  const parts = t.split(":").map((n) => parseInt(n, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

export default function Player({
  course,
  enrollmentId,
  initialDone,
  assignments = [],
  initialSubmissions = [],
  quizzes = [],
  initialQuestions = [],
  currentUserRole = "STUDENT",
}: {
  course: any;
  enrollmentId: string | null;
  initialDone: string[];
  assignments?: any[];
  initialSubmissions?: any[];
  quizzes?: any[];
  initialQuestions?: any[];
  currentUserRole?: string;
}) {
  const lessons = course.curriculum.flatMap((m: any) =>
    m.lessons.map((l: any) => ({ ...l, moduleTitle: m.moduleTitle, weekNumber: m.weekNumber }))
  );

  const [done, setDone] = useState<string[]>(initialDone);
  const [cur, setCur] = useState<any>(
    lessons.find((l: any) => !initialDone.includes(l._id)) ?? lessons[0]
  );
  const [closed, setClosed] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"notes" | "slides" | "assignment" | "quiz" | "qa">("notes");
  const [videoStartSec, setVideoStartSec] = useState<number>(0);

  // Ask Instructor Q&A state
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [qaText, setQaText] = useState("");
  const [qaFile, setQaFile] = useState<File | null>(null);
  const [postingQa, setPostingQa] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [showAllCourseQa, setShowAllCourseQa] = useState(false);

  // Homework submission state
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [studentComment, setStudentComment] = useState("");

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<any | null>(quizzes[0] || null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const isDone = cur && done.includes(cur._id);
  const pct = Math.round((done.length / (lessons.length || 1)) * 100);
  const idx = lessons.findIndex((l: any) => l._id === cur?._id);

  // Find relevant assignment: explicitly picked, or matching current week, or first available
  const currentWeekNumber = cur?.weekNumber || 1;
  const currentAssignment =
    (selectedAssignmentId && assignments.find((a) => a._id === selectedAssignmentId)) ||
    assignments.find((a) => a.weekNumber === currentWeekNumber) ||
    assignments[0];
  const currentSubmission = currentAssignment
    ? submissions.find((s) => s.assignment === currentAssignment._id)
    : null;

  async function toggle() {
    if (!enrollmentId) return toast.info("Admin preview: progress isn't saved");
    const next = !isDone,
      prev = done;
    setDone((d) => (next ? [...d, cur._id] : d.filter((x) => x !== cur._id)));
    const res = await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: cur._id, done: next }),
    });
    if (!res.ok) {
      toast.error("Progress not saved");
      setDone(prev);
      return;
    }
    if (next) {
      toast.success("Lesson completed");
      if (done.length + 1 === lessons.length)
        toast.success("Course complete! Your certificate will be issued by an admin.");
      if (lessons[idx + 1]) setCur(lessons[idx + 1]);
    }
  }

  async function handleAssignmentUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!assignmentFile || !currentAssignment) {
      return toast.error("Please choose a file to upload");
    }

    setSubmittingAssignment(true);
    try {
      // 1. Upload file to /api/upload
      const fd = new FormData();
      fd.append("file", assignmentFile);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "File upload failed");

      // 2. Submit assignment
      const subRes = await fetch(`/api/assignments/${currentAssignment._id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: upData.url,
          fileName: upData.name || assignmentFile.name,
          fileType: assignmentFile.type,
          studentComment,
        }),
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error(subData.error || "Submission failed");

      toast.success("Homework assignment submitted successfully!");
      setSubmissions((prev) => {
        const filtered = prev.filter((s) => s.assignment !== currentAssignment._id);
        return [...filtered, subData];
      });
      setAssignmentFile(null);
      setStudentComment("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingAssignment(false);
    }
  }

  async function handleQuizSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeQuiz) return;

    const answerArray = activeQuiz.questions.map((_: any, i: number) =>
      quizAnswers[i] !== undefined ? quizAnswers[i] : -1
    );

    setSubmittingQuiz(true);
    try {
      const res = await fetch(`/api/quizzes/${activeQuiz._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Quiz submission failed");

      setQuizResult(data);
      if (data.passed) {
        toast.success(`Passed with ${data.score}%! Great job!`);
      } else {
        toast.error(`Scored ${data.score}%. Minimum passing score is ${data.passingScore}%.`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  }

  // Fallback recording chapters when lesson doesn't specify custom timestamps yet
  const bookmarks: Array<{ time: string; label: string }> =
    cur?.timestamps?.length > 0
      ? cur.timestamps
      : [
          { time: "00:00", label: "Cohort Recap & Daily Objectives" },
          { time: "14:20", label: "Core Concept Walkthrough" },
          { time: "38:45", label: "Live Coding & Architecture Demo" },
          { time: "01:12:00", label: "Q&A & Weekend Task Briefing" },
        ];

  const lessonQuestions = showAllCourseQa
    ? questions
    : questions.filter((q) => String(q.lessonId) === String(cur?._id));

  function jumpToTimestamp(timeStr: string, label: string) {
    const secs = parseTimeToSeconds(timeStr);
    setVideoStartSec(secs);
    toast.success(`Jumped recording to ${timeStr} — ${label}`);
  }

  async function postQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!qaText.trim() || !cur?._id) return;
    setPostingQa(true);
    try {
      let attachmentUrl = "";
      if (qaFile) {
        const fd = new FormData();
        fd.append("file", qaFile);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upd = await up.json();
        if (!up.ok) throw new Error(upd.error || "Screenshot upload failed");
        attachmentUrl = upd.url;
      }
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          lessonId: cur._id,
          lessonTitle: cur.title,
          question: qaText.trim(),
          attachmentUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not post question");
      setQuestions((prev) => [data, ...prev]);
      setQaText("");
      setQaFile(null);
      toast.success("Question posted for Instructor & batch Q&A!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPostingQa(false);
    }
  }

  async function postReply(qid: string) {
    const msg = replyDrafts[qid]?.trim();
    if (!msg) return;
    const res = await fetch(`/api/qa/${qid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Could not reply");
    setQuestions((prev) => prev.map((q) => (q._id === qid ? data : q)));
    setReplyDrafts((prev) => ({ ...prev, [qid]: "" }));
    toast.success("Reply added to thread");
  }

  const resolvedVideoUrl = cur?.videoUrl
    ? cur.videoUrl.includes("youtube.com") || cur.videoUrl.includes("youtu.be")
      ? `${cur.videoUrl}${cur.videoUrl.includes("?") ? "&" : "?"}start=${videoStartSec}`
      : cur.videoUrl
    : "";

  return (
    <div className="grid min-h-screen bg-[#fbfdfb] lg:grid-cols-[1fr_380px]">
      <main className="p-4 lg:p-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#063F38] transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-xs font-semibold">
              3 Months · 5 Days a Week
            </span>
          </div>
        </div>

        {/* Live Online Class Announcement Banner */}
        {course.cohortSchedule?.liveClassLink && (
          <div className="card border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C9FA52]/45 text-[#063F38] animate-pulse">
                <Radio size={20} />
              </span>
              <div>
                <b className="block text-slate-900 text-sm">
                  Live Interactive Online Lecture · Today&apos;s Class
                </b>
                <span className="text-xs text-slate-500 font-medium">
                  {course.cohortSchedule.timing || "Monday to Friday · 8:00 PM – 9:30 PM PKT"}
                </span>
              </div>
            </div>
            <a
              href={cur?.liveMeetingUrl || course.cohortSchedule.liveClassLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (enrollmentId) {
                  fetch("/api/attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      courseId: course._id,
                      lessonTitle: cur?.title || "Live Class",
                    }),
                  }).then(() => {
                    toast.success("Today's live attendance marked!");
                  }).catch(() => {});
                }
              }}
              className="btn-accent btn-sm text-xs !py-2.5 !px-5 flex items-center gap-1.5 shrink-0"
            >
              Join Google Meet Live <ExternalLink size={14} />
            </a>
          </div>
        )}

        {/* Current Lesson Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#063F38]">
            <span>{cur?.moduleTitle || "Curriculum"}</span>
            {cur?.day && <span>· {cur.day}</span>}
          </div>
          <h1 className="h-display mt-1 text-2xl text-slate-900 sm:text-3xl font-extrabold">
            {cur?.title}
          </h1>
        </div>

        {/* Video Player / Live Stream Frame */}
        <div className="overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-emerald-950/10">
          {resolvedVideoUrl ? (
            <iframe
              key={`${cur._id}-${videoStartSec}`}
              src={resolvedVideoUrl}
              title={cur.title}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="grid aspect-video place-items-center text-slate-400 bg-slate-900 p-6 text-center">
              <div>
                <Radio size={40} className="mx-auto mb-2 text-emerald-500 animate-pulse" />
                <p className="font-bold text-white text-base">Live Interactive Session</p>
                <p className="text-xs text-slate-400 mt-1">
                  This class is conducted live on Google Meet. Click &quot;Join Google Meet Live&quot; above.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recording Timestamp Bookmarks Bar */}
        <div className="card p-4 border-slate-200 bg-white space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#063F38]">
              <Bookmark size={14} className="text-[#063F38]" /> Recording Timestamp Bookmarks
            </span>
            <span className="text-[11px] text-slate-400">
              Click a moment to jump straight to that topic
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {bookmarks.map((bm, bIdx) => {
              const sec = parseTimeToSeconds(bm.time);
              const isSelected = videoStartSec === sec && sec > 0;
              return (
                <button
                  key={`${bm.time}-${bIdx}`}
                  type="button"
                  onClick={() => jumpToTimestamp(bm.time, bm.label)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "border-[#063F38]/40 bg-[#F4FFE2] text-[#063F38] shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-[#F4FFE2] hover:text-[#063F38]"
                  }`}
                >
                  <Clock size={12} className="text-[#063F38]" />
                  <span className="font-mono font-bold">{bm.time}</span>
                  <span className="text-slate-400">·</span>
                  <span>{bm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Lesson Completion Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={
                isDone
                  ? "btn-outline border-emerald-300 text-[#063F38] bg-[#F4FFE2] shadow-sm"
                  : "btn-primary"
              }
            >
              {isDone ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" /> Lesson Completed (Undo)
                </>
              ) : (
                <>
                  <Check size={16} /> Mark as Complete
                </>
              )}
            </button>
            {lessons[idx + 1] && (
              <button onClick={() => setCur(lessons[idx + 1])} className="btn-ghost">
                Next lesson <ChevronRight size={16} />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">Duration: {cur?.duration || "1.5h"}</span>
        </div>

        {/* Tabs for Notes, Presentations/Slides, Homework, and Quiz */}
        <div className="pt-4">
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "notes"
                  ? "border-emerald-700 text-[#063F38] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText size={16} /> Lecture Notes
            </button>
            <button
              onClick={() => setActiveTab("slides")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "slides"
                  ? "border-emerald-700 text-[#063F38] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Presentation size={16} /> Presentation Slides
            </button>
            <button
              onClick={() => setActiveTab("assignment")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "assignment"
                  ? "border-emerald-700 text-[#063F38] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileCheck size={16} /> Homework & Uploads
              {currentAssignment && (
                <span className="rounded-full bg-[#C9FA52]/45 text-[#063F38] px-1.5 py-0.2 text-[10px] font-bold">
                  {currentSubmission ? "Submitted" : "Assigned"}
                </span>
              )}
            </button>
            {quizzes.length > 0 && (
              <button
                onClick={() => setActiveTab("quiz")}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === "quiz"
                    ? "border-emerald-700 text-[#063F38] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <CheckSquare size={16} /> Weekly Quiz ({quizzes.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab("qa")}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "qa"
                  ? "border-emerald-700 text-[#063F38] font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare size={16} /> Ask Instructor ({lessonQuestions.length})
            </button>
          </div>

          <div className="pt-6">
            {/* 1. LECTURE NOTES TAB */}
            {activeTab === "notes" && (
              <div className="card p-6 shadow-sm border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FileText size={18} className="text-[#063F38]" />
                  Detailed Lecture Notes & References
                </h3>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-sm space-y-3 font-[family-name:var(--font-body)]">
                  {cur?.content || "Detailed lecture notes and architecture diagrams for this live class."}
                </div>
              </div>
            )}

            {/* 2. PRESENTATION SLIDES TAB */}
            {activeTab === "slides" && (
              <div className="card p-6 shadow-sm border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Presentation size={18} className="text-[#063F38]" />
                      Class Presentation Deck (PDF / PPT)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Download the official lecture slides used by the instructor during today&apos;s live class.
                    </p>
                  </div>
                  {cur?.presentationUrl ? (
                    <a
                      href={cur.presentationUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-sm flex items-center gap-1.5"
                    >
                      <Download size={14} /> Download Slides
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toast.info("Slides for this lecture will be attached by your instructor right after the live session.")}
                      className="btn-outline btn-sm flex items-center gap-1.5"
                    >
                      <Download size={14} /> Slides Pending Upload
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#C9FA52]/40 text-[#063F38]">
                      <FileCode size={24} />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {cur?.presentationName || `${cur?.title} - Presentation Slides.pdf`}
                      </p>
                      <p className="text-xs text-slate-400">
                        Official Curriculum Slides · PDF Document · Complete Visual Architecture
                      </p>
                    </div>
                  </div>
                  <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-xs">
                    Verified Instructor Resource
                  </span>
                </div>
              </div>
            )}

            {/* 3. HOMEWORK & ASSIGNMENTS TAB (FILE UPLOAD: IMAGES, WORD DOCS, PDF, ZIP) */}
            {activeTab === "assignment" && (
              <div className="card p-6 shadow-sm border-slate-200 space-y-6">
                {assignments.length > 1 && (
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                    {assignments.map((a) => {
                      const active = currentAssignment?._id === a._id;
                      return (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => setSelectedAssignmentId(a._id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            active
                              ? "bg-[#063F38] text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-[#F4FFE2] hover:text-[#063F38]"
                          }`}
                        >
                          Week {a.weekNumber}: {a.title.replace(/^Week \d+:\s*/i, "")}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!currentAssignment ? (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No homework assignments have been posted for this course yet.
                  </div>
                ) : (
                  <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="badge bg-[#C9FA52]/45 text-[#063F38] text-xs font-bold uppercase tracking-wider">
                      Week {currentAssignment?.weekNumber || 1} Homework Assignment
                    </span>
                    <h3 className="font-bold text-slate-900 text-xl mt-1">
                      {currentAssignment?.title || "Practical Homework Assignment"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Due by:{" "}
                      {currentAssignment?.dueDate
                        ? new Date(currentAssignment.dueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "End of Week"}
                    </p>
                  </div>

                  {currentSubmission && (
                    <span
                      className={`badge ${
                        currentSubmission.status === "GRADED"
                          ? "bg-[#C9FA52]/40 text-[#063F38]"
                          : "bg-[#C9FA52]/45 text-[#063F38]"
                      } text-xs font-bold`}
                    >
                      {currentSubmission.status === "GRADED"
                        ? `Score: ${currentSubmission.score} / ${currentAssignment?.maxScore || 100}`
                        : "Submitted (Under Review)"}
                    </span>
                  )}
                </div>

                {/* Assignment brief */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentAssignment?.description ||
                    "Complete the project according to the lecture requirements and upload your Word file (.docx), PDF report, or screenshot images."}
                </div>

                {/* Previous submission review card if submitted */}
                {currentSubmission && (
                  <div className="rounded-2xl border border-[#063F38]/20 bg-[#F4FFE2]/40 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#063F38] text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#063F38]" /> Your Submitted Work
                      </h4>
                      <span className="text-xs text-slate-400">
                        Submitted on{" "}
                        {new Date(currentSubmission.submittedAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white rounded-xl border border-[#063F38]/15 p-3">
                      <span className="text-xs font-mono font-bold text-slate-800 truncate max-w-sm">
                        {currentSubmission.fileName}
                      </span>
                      <a
                        href={currentSubmission.fileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline btn-sm text-xs flex items-center gap-1"
                      >
                        <Download size={13} /> Download My File
                      </a>
                    </div>

                    {currentSubmission.studentComment && (
                      <p className="text-xs text-slate-600">
                        <b>Your Note:</b> {currentSubmission.studentComment}
                      </p>
                    )}

                    {currentSubmission.feedback && (
                      <div className="rounded-xl bg-white border border-[#063F38]/20 p-3 text-xs text-slate-800">
                        <p className="font-bold text-[#063F38] uppercase tracking-wider text-[11px] mb-1">
                          Teacher Feedback
                        </p>
                        <p>{currentSubmission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Form (Word, PDF, Images, Zip) */}
                <form
                  onSubmit={handleAssignmentUpload}
                  className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-white"
                >
                  <h4 className="font-bold text-slate-900 text-sm">
                    {currentSubmission ? "Re-upload / Update Submission" : "Submit Your Homework"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Upload your Word file (.docx, .doc), PDF document, code ZIP, or project screenshots (.png, .jpg). Max size: 25MB.
                  </p>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500 transition">
                    <input
                      type="file"
                      id="hw-file"
                      required={!currentSubmission}
                      onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                      className="hidden"
                      accept=".docx,.doc,.pdf,.png,.jpg,.jpeg,.zip,.ppt,.pptx"
                    />
                    <label htmlFor="hw-file" className="cursor-pointer space-y-2 block">
                      <Upload className="mx-auto text-[#063F38]" size={32} />
                      <p className="text-sm font-semibold text-slate-800">
                        {assignmentFile ? (
                          <span className="text-[#063F38] font-bold">{assignmentFile.name}</span>
                        ) : (
                          "Click to browse Word (.docx), PDF, or Image files"
                        )}
                      </p>
                      <p className="text-xs text-slate-400">
                        Supported: Word, PDF, JPG, PNG, WebP, ZIP
                      </p>
                    </label>
                  </div>

                  <div>
                    <label className="label">Comments / GitHub URL (Optional)</label>
                    <textarea
                      rows={2}
                      className="input text-xs"
                      value={studentComment}
                      onChange={(e) => setStudentComment(e.target.value)}
                      placeholder="e.g. Completed all responsive breakpoints. Added custom animations..."
                    />
                  </div>

                  <button
                    disabled={submittingAssignment || !assignmentFile}
                    type="submit"
                    className="btn-primary w-full"
                  >
                    <Upload size={16} />{" "}
                    {submittingAssignment
                      ? "Uploading & Submitting Work…"
                      : currentSubmission
                      ? "Update Submission"
                      : "Submit Assignment for Grading"}
                  </button>
                </form>
                  </>
                )}
              </div>
            )}

            {/* 4. INTERACTIVE QUIZZES TAB */}
            {activeTab === "quiz" && (
              <div className="card p-6 shadow-sm border-slate-200 space-y-6">
                {quizzes.length > 1 && (
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                    {quizzes.map((q) => {
                      const active = activeQuiz?._id === q._id;
                      return (
                        <button
                          key={q._id}
                          type="button"
                          onClick={() => {
                            setActiveQuiz(q);
                            setQuizAnswers({});
                            setQuizResult(null);
                          }}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            active
                              ? "bg-[#063F38] text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-[#F4FFE2] hover:text-[#063F38]"
                          }`}
                        >
                          Week {q.weekNumber}: {q.title.replace(/^Week \d+ Milestone Quiz:\s*/i, "")}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!activeQuiz ? (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No quizzes have been published for this course yet.
                  </div>
                ) : (
                  <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="badge bg-[#C9FA52]/40 text-[#063F38] text-xs font-bold uppercase tracking-wider">
                      Week {activeQuiz.weekNumber} Assessment
                    </span>
                    <h3 className="font-bold text-slate-900 text-xl mt-1">{activeQuiz.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Passing Score: {activeQuiz.passingScore}% · {activeQuiz.questions.length} Questions
                    </p>
                  </div>
                </div>

                {quizResult && (
                  <div
                    className={`rounded-2xl p-5 border ${
                      quizResult.passed
                        ? "bg-[#F4FFE2] border-[#063F38]/20 text-emerald-950"
                        : "bg-[#F4FFE2] border-[#063F38]/20 text-[#063F38]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-12 w-12 place-items-center rounded-xl font-bold text-lg text-white ${
                          quizResult.passed ? "bg-[#063F38]" : "bg-[#063F38]"
                        }`}
                      >
                        {quizResult.score}%
                      </span>
                      <div>
                        <h4 className="font-bold text-base">
                          {quizResult.passed ? "🎉 Congratulations! You Passed!" : "Needs Improvement"}
                        </h4>
                        <p className="text-xs opacity-80">
                          {quizResult.correctCount} of {quizResult.total} questions correct.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleQuizSubmit} className="space-y-6">
                  {activeQuiz.questions.map((q: any, i: number) => {
                    const review = quizResult?.review?.[i];
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border ${
                          review
                            ? review.isCorrect
                              ? "border-[#063F38]/20 bg-[#F4FFE2]/40"
                              : "border-rose-200 bg-rose-50/40"
                            : "border-slate-100 bg-slate-50/50"
                        } space-y-3`}
                      >
                        <p className="font-semibold text-slate-900 text-sm">
                          {i + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt: string, optIdx: number) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-3 rounded-lg border p-3 text-xs font-medium cursor-pointer transition ${
                                quizAnswers[i] === optIdx
                                  ? "border-emerald-600 bg-white shadow-sm text-emerald-950"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${i}`}
                                checked={quizAnswers[i] === optIdx}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [i]: optIdx })}
                                className="accent-emerald-700"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>

                        {review && (
                          <div className="text-xs pt-2">
                            {review.isCorrect ? (
                              <span className="text-[#063F38] font-bold">✓ Correct!</span>
                            ) : (
                              <span className="text-rose-600 font-bold">
                                ✗ Incorrect. Correct: {q.options[q.correctIndex]}
                              </span>
                            )}
                            {q.explanation && (
                              <p className="text-slate-500 mt-1">
                                <b>Explanation:</b> {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    disabled={submittingQuiz}
                    type="submit"
                    className="btn-primary w-full !py-3"
                  >
                    {submittingQuiz ? "Calculating Score…" : "Submit Quiz for Evaluation"}
                  </button>
                </form>
                  </>
                )}
              </div>
            )}

            {/* 5. ASK INSTRUCTOR Q&A THREAD TAB */}
            {activeTab === "qa" && (
              <div className="space-y-5">
                <form
                  onSubmit={postQuestion}
                  className="card p-5 border-slate-200 bg-white space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                      <MessageSquare size={18} className="text-[#063F38]" />
                      Ask Instructor · Lesson Q&amp;A Thread
                    </h3>
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAllCourseQa}
                        onChange={(e) => setShowAllCourseQa(e.target.checked)}
                      />
                      Show all lessons Q&amp;A ({questions.length})
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    Stuck on code, design, or a concept from <b>{cur?.title}</b>? Post your question with an optional screenshot so instructors and TAs answer for the entire cohort.
                  </p>
                  <textarea
                    required
                    rows={3}
                    className="input text-sm"
                    value={qaText}
                    onChange={(e) => setQaText(e.target.value)}
                    placeholder="Describe your question or paste an error snippet..."
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:border-emerald-400">
                      <Paperclip size={14} className="text-[#063F38]" />
                      <span>{qaFile ? qaFile.name : "Attach code/error screenshot (optional)"}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.webp,.pdf"
                        onChange={(e) => setQaFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <button disabled={postingQa} type="submit" className="btn-primary btn-sm">
                      <Send size={14} /> {postingQa ? "Posting…" : "Post Question to Cohort"}
                    </button>
                  </div>
                </form>

                {lessonQuestions.length === 0 ? (
                  <div className="card p-10 text-center border-slate-200 text-sm text-slate-500">
                    No questions asked on this lesson yet. Ask the first question above!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessonQuestions.map((q: any) => (
                      <div
                        key={q._id}
                        className="card p-5 border-slate-200 bg-white space-y-3 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#C9FA52]/40 text-xs font-bold text-[#063F38]">
                              {(q.student?.name || "S").charAt(0)}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {q.student?.name || "Cohort Student"}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {q.lessonTitle} ·{" "}
                                {new Date(q.createdAt).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`badge text-[10px] font-bold uppercase ${
                              q.isResolved
                                ? "bg-[#C9FA52]/40 text-[#063F38]"
                                : "bg-[#C9FA52]/45 text-[#063F38]"
                            }`}
                          >
                            {q.isResolved ? "Answered by Instructor" : "Open Question"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {q.question}
                        </p>

                        {q.attachmentUrl && (
                          <a
                            href={q.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block overflow-hidden rounded-xl border border-slate-200"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={q.attachmentUrl}
                              alt="Question attachment"
                              className="max-h-48 w-auto object-contain bg-slate-50"
                            />
                          </a>
                        )}

                        {q.replies?.length > 0 && (
                          <div className="space-y-2 border-l-2 border-[#063F38]/20 pl-4 pt-1">
                            {q.replies.map((rep: any, rIdx: number) => (
                              <div
                                key={rep._id || rIdx}
                                className={`rounded-xl p-3 text-xs ${
                                  rep.authorRole === "ADMIN"
                                    ? "bg-[#F4FFE2] border border-[#063F38]/20 text-emerald-950"
                                    : "bg-slate-50 border border-slate-100 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold">{rep.authorName}</span>
                                  {rep.authorRole === "ADMIN" && (
                                    <span className="rounded bg-[#063F38] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                      INSTRUCTOR
                                    </span>
                                  )}
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{rep.message}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 pt-1">
                          <input
                            className="input text-xs flex-1"
                            value={replyDrafts[q._id] || ""}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [q._id]: e.target.value }))
                            }
                            placeholder={
                              currentUserRole === "ADMIN"
                                ? "Write official instructor answer…"
                                : "Add a follow-up or help a classmate…"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => postReply(q._id)}
                            className="btn-outline btn-sm text-xs shrink-0"
                          >
                            <Send size={13} /> Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right Sidebar: 3-Month 5-Day Curriculum Checklist */}
      <aside className="border-l border-slate-200 bg-white lg:h-screen lg:overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <b>Bootcamp Progress</b>
            <span className="font-semibold text-[#063F38]">{pct}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#F4FFE2]">
            <div
              className="h-2 rounded-full bg-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {done.length} of {lessons.length} lessons complete{" "}
            {pct === 100 && (
              <span className="ml-1 inline-flex items-center gap-1 font-semibold text-[#063F38]">
                <Award size={12} /> Certificate eligible
              </span>
            )}
          </p>
        </div>

        <div className="p-3">
          {course.curriculum.map((m: any, i: number) => (
            <div key={i} className="mb-2">
              <button
                onClick={() => setClosed({ ...closed, [i]: !closed[i] })}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#F4FFE2]/60 hover:text-[#063F38]"
              >
                <div>
                  <span className="block font-bold">{m.moduleTitle}</span>
                  <span className="text-[11px] text-slate-400 font-normal">5 Classes · Mon to Fri</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition ${closed[i] ? "-rotate-90" : ""}`}
                />
              </button>
              {!closed[i] &&
                m.lessons.map((l: any) => (
                  <button
                    key={l._id}
                    onClick={() => {
                      setCur(l);
                      setVideoStartSec(0);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      cur?._id === l._id
                        ? "bg-[#F4FFE2] text-[#063F38] font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {done.includes(l._id) ? (
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle size={17} className="mt-0.5 shrink-0 text-slate-300" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {l.day && (
                          <span className="text-[10px] font-bold text-[#063F38] uppercase">
                            {l.day}
                          </span>
                        )}
                        <span className="truncate">{l.title}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{l.duration}</span>
                  </button>
                ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
