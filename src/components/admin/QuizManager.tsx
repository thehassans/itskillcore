"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Award,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";

interface CourseItem {
  _id: string;
  title: string;
}

interface QuestionDraft {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

const blankQuestion = (): QuestionDraft => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

export default function QuizManager({ courses }: { courses: CourseItem[] }) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [courseId, setCourseId] = useState(courses[0]?._id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
  const [submitting, setSubmitting] = useState(false);

  // Selected quiz results inspection
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  async function fetchQuizzes() {
    setLoading(true);
    const res = await fetch("/api/quizzes");
    if (res.ok) {
      setQuizzes(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function viewResults(quiz: any) {
    setSelectedQuiz(quiz);
    setLoadingResults(true);
    const res = await fetch(`/api/quizzes/${quiz._id}`);
    if (res.ok) {
      const data = await res.json();
      setQuizSubmissions(data.submissions || []);
    }
    setLoadingResults(false);
  }

  async function deleteQuiz(id: string) {
    if (!confirm("Delete this quiz and all student attempts?")) return;
    const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Quiz deleted");
      if (selectedQuiz?._id === id) setSelectedQuiz(null);
      fetchQuizzes();
    } else {
      toast.error("Failed to delete quiz");
    }
  }

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !title.trim()) {
      return toast.error("Course and title are required");
    }
    const validQuestions = questions.filter(
      (q) => q.question.trim() && q.options.every((opt) => opt.trim())
    );
    if (validQuestions.length === 0) {
      return toast.error("Please complete at least one question with all 4 options");
    }

    setSubmitting(true);
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        title,
        description,
        weekNumber,
        passingScore,
        questions: validQuestions,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const err = await res.json();
      return toast.error(err.error || "Could not create quiz");
    }

    toast.success("Milestone quiz published!");
    setCreating(false);
    setTitle("");
    setDescription("");
    setQuestions([blankQuestion()]);
    fetchQuizzes();
  }

  const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = [...q.options] as [string, string, string, string];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl text-slate-900">
            Course Quizzes & Assessments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create interactive weekly milestone quizzes and monitor student scores across cohorts.
          </p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className={creating ? "btn-outline" : "btn-primary"}
        >
          {creating ? "Cancel" : (
            <>
              <Plus size={16} /> Create New Quiz
            </>
          )}
        </button>
      </div>

      {/* Create Quiz Form */}
      {creating && (
        <form
          onSubmit={handleCreateQuiz}
          className="card p-6 border-emerald-600/20 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ClipboardList size={20} className="text-[#063F38]" /> New Milestone Quiz
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Target Course</label>
              <select
                className="input"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quiz Title</label>
              <input
                className="input"
                placeholder="e.g. Week 4 Milestone Quiz: Tailwind & React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Chapter / Week Number</label>
              <input
                type="number"
                min={1}
                max={24}
                className="input"
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Passing Percentage (%)</label>
              <input
                type="number"
                min={10}
                max={100}
                className="input"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Instructions / Description</label>
              <textarea
                rows={2}
                className="input"
                placeholder="Brief summary of concepts tested in this quiz..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Multiple Choice Questions ({questions.length})
              </h3>
              <button
                type="button"
                className="btn-outline btn-sm text-xs"
                onClick={() => setQuestions([...questions, blankQuestion()])}
              >
                <Plus size={14} /> Add Question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase text-[#063F38]">
                    Question {qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                      onClick={() =>
                        setQuestions(questions.filter((_, i) => i !== qIdx))
                      }
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>

                <input
                  className="input !bg-white font-medium"
                  placeholder="Enter question text..."
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                  required
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2 rounded-xl border p-2 bg-white ${
                        q.correctIndex === optIdx
                          ? "border-emerald-500 ring-1 ring-emerald-500/30"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctIndex === optIdx}
                        onChange={() => updateQuestion(qIdx, { correctIndex: optIdx })}
                        className="accent-emerald-700 h-4 w-4 shrink-0 cursor-pointer"
                        title="Mark as correct option"
                      />
                      <input
                        className="w-full text-xs outline-none bg-transparent text-slate-800"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <input
                  className="input !bg-white text-xs"
                  placeholder="Optional explanation shown after student completes quiz..."
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button disabled={submitting} className="btn-primary">
              {submitting ? "Publishing..." : "Publish Quiz"}
            </button>
          </div>
        </form>
      )}

      {/* Quizzes List & Results View */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className={selectedQuiz ? "lg:col-span-6 space-y-3" : "lg:col-span-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"}>
          {loading ? (
            <div className="card p-8 text-center text-slate-400">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 col-span-full">
              No quizzes published yet. Click &ldquo;Create New Quiz&rdquo; to add one.
            </div>
          ) : (
            quizzes.map((q) => {
              const isSelected = selectedQuiz?._id === q._id;
              return (
                <div
                  key={q._id}
                  className={`card p-5 transition hover:shadow-md flex flex-col justify-between ${
                    isSelected ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="badge bg-[#F4FFE2] text-[#063F38] border border-[#063F38]/20">
                        Week {q.weekNumber}
                      </span>
                      <button
                        onClick={() => deleteQuiz(q._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete quiz"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900">{q.title}</h3>
                    <p className="text-xs font-medium text-[#063F38] mt-1 flex items-center gap-1">
                      <BookOpen size={12} /> {q.course?.title || "Course"}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {q.description || `${q.questions?.length || 0} multiple-choice questions`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-600 font-medium">
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-emerald-600" /> Pass: {q.passingScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-slate-400" /> {q.attemptCount || 0} attempts
                      </span>
                    </div>
                    <button
                      onClick={() => viewResults(q)}
                      className="text-[#063F38] font-bold hover:underline flex items-center gap-0.5"
                    >
                      Results <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Quiz Attempts Panel */}
        {selectedQuiz && (
          <div className="lg:col-span-6">
            <div className="card p-6 sticky top-24 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#063F38]">
                    Student Results & Attempts
                  </span>
                  <h2 className="font-bold text-slate-900 text-lg mt-0.5">
                    {selectedQuiz.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Passing requirement: {selectedQuiz.passingScore}% · Questions: {selectedQuiz.questions?.length}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close
                </button>
              </div>

              {loadingResults ? (
                <p className="text-sm text-slate-400 py-8 text-center">Loading student results...</p>
              ) : quizSubmissions.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No students have attempted this quiz yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {quizSubmissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-white"
                    >
                      <div>
                        <p className="font-bold text-sm text-slate-900">
                          {sub.student?.name || "Student"}
                        </p>
                        <p className="text-xs text-slate-500">{sub.student?.email}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Submitted {new Date(sub.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            sub.passed
                              ? "bg-[#F4FFE2] text-[#063F38]"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {sub.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {sub.score}% ({sub.passed ? "PASSED" : "FAILED"})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
