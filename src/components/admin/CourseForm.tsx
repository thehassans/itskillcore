"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Radio, Presentation, FileCheck, Sparkles, Wand2, Upload } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { slugify } from "@/lib/utils";
import { ALL_COURSE_PRESETS } from "@/lib/coursePresets";

const blankLesson = () => ({
  title: "",
  day: "Day 1 (Mon)",
  videoUrl: "",
  duration: "1.5h",
  content: "",
  presentationUrl: "",
  presentationName: "",
  assignmentPrompt: "",
  isFreePreview: false,
});

const blank = {
  title: "",
  slug: "",
  category: "",
  level: "Beginner",
  duration: "3 Months (60 Sessions)",
  batchCode: "Batch 01",
  batchStartDate: "",
  maxSeats: 40,
  cohortSchedule: {
    durationMonths: 3,
    daysPerWeek: 5,
    timing: "Monday to Friday · 8:00 PM – 9:30 PM PKT",
    mode: "Live Interactive Online via Google Meet",
    liveClassLink: "https://meet.google.com/itskillcore-live",
  },
  shortDescription: "",
  fullDescription: "",
  thumbnail: "",
  price: 0,
  discountPrice: "" as number | "",
  isPublished: true,
  outcomes: [""] as string[],
  instructor: { name: "", title: "", avatar: "", bio: "" },
  curriculum: [{ moduleTitle: "Week 1: Core Fundamentals", weekNumber: 1, lessons: [blankLesson()] }] as any[],
};

export default function CourseForm({ course }: { course?: any }) {
  const router = useRouter();
  const [f, setF] = useState<any>(
    course
      ? {
          ...blank,
          ...course,
          batchCode: course.batchCode || "Batch 01",
          batchStartDate: course.batchStartDate
            ? new Date(course.batchStartDate).toISOString().slice(0, 10)
            : "",
          maxSeats: course.maxSeats ?? 40,
          cohortSchedule: { ...blank.cohortSchedule, ...(course.cohortSchedule || {}) },
          discountPrice: course.discountPrice ?? "",
          outcomes: course.outcomes?.length ? course.outcomes : [""],
          instructor: { ...blank.instructor, ...course.instructor },
        }
      : blank
  );
  const [slugTouched, setSlugTouched] = useState(!!course);
  const [free, setFree] = useState(course ? course.price === 0 : false);
  const [busy, setBusy] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("fullstack-web-dev");

  const applyPreset = (presetId: string, fullCourse = false) => {
    if (!presetId) return;
    if (presetId === "blank-10weeks") {
      const days = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)"];
      const newCurr = Array.from({ length: 10 }, (_, wIdx) => ({
        moduleTitle: `Week ${wIdx + 1}: Chapter Topic & Practical Lab`,
        weekNumber: wIdx + 1,
        lessons: days.map((day, dIdx) => ({
          day,
          title: dIdx === 0 ? "Introduction & Architecture" : dIdx === 4 ? "Code Review & Weekend Assignment" : `Live Interactive Lecture ${dIdx + 1}`,
          duration: "1.5h",
          content: `In-depth notes, resources, and code walkthrough guide for Week ${wIdx + 1} ${day}.`,
          presentationUrl: "/uploads/Week1_Web_Architecture_Slides.pdf",
          presentationName: `Week${wIdx + 1}_Slides.pdf`,
          assignmentPrompt: dIdx === 4 ? `Week ${wIdx + 1} Homework Assignment brief` : "",
          isFreePreview: wIdx === 0 && dIdx === 0,
        })),
      }));
      set("curriculum", newCurr);
      toast.success("Applied 10-Week / 5-Days Schedule Skeleton");
      return;
    }

    const preset = ALL_COURSE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (fullCourse) {
      setF((p: any) => ({
        ...p,
        title: preset.title,
        slug: slugify(preset.title),
        category: preset.category,
        level: preset.level,
        duration: preset.duration,
        cohortSchedule: { ...preset.cohortSchedule },
        shortDescription: preset.shortDescription,
        fullDescription: preset.fullDescription,
        thumbnail: preset.thumbnail || p.thumbnail,
        price: preset.price,
        discountPrice: preset.discountPrice ?? "",
        outcomes: preset.outcomes,
        curriculum: preset.curriculum,
      }));
      setSlugTouched(true);
      toast.success(`Loaded full course preset: ${preset.name}`);
    } else {
      set("curriculum", preset.curriculum);
      set("cohortSchedule", { ...preset.cohortSchedule });
      set("duration", preset.duration);
      toast.success(`Applied 3-Month Curriculum: ${preset.name}`);
    }
  };

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const setSched = (k: string, v: any) =>
    setF((p: any) => ({ ...p, cohortSchedule: { ...p.cohortSchedule, [k]: v } }));
  const setMod = (i: number, patch: any) =>
    set(
      "curriculum",
      f.curriculum.map((m: any, x: number) => (x === i ? { ...m, ...patch } : m))
    );
  const setLesson = (i: number, j: number, patch: any) =>
    setMod(i, {
      lessons: f.curriculum[i].lessons.map((l: any, x: number) => (x === j ? { ...l, ...patch } : l)),
    });

  async function uploadSlides(i: number, j: number, file?: File) {
    if (!file) return;
    const toastId = toast.loading(`Uploading ${file.name}...`);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) {
      toast.error(d.error || "Upload failed", { id: toastId });
      return;
    }
    setLesson(i, j, {
      presentationUrl: d.url,
      presentationName: file.name,
    });
    toast.success("Presentation slides attached!", { id: toastId });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.thumbnail) return toast.error("Please add a course thumbnail");
    setBusy(true);
    const body = {
      ...f,
      batchCode: f.batchCode || "Batch 01",
      batchStartDate: f.batchStartDate ? new Date(f.batchStartDate) : undefined,
      maxSeats: Number(f.maxSeats) || 40,
      price: free ? 0 : Number(f.price),
      discountPrice: free || f.discountPrice === "" ? undefined : Number(f.discountPrice),
      outcomes: f.outcomes.filter(Boolean),
      curriculum: f.curriculum
        .filter((m: any) => m.moduleTitle)
        .map((m: any, idx: number) => ({
          moduleTitle: m.moduleTitle,
          weekNumber: m.weekNumber || idx + 1,
          lessons: m.lessons.filter((l: any) => l.title),
        })),
    };
    if (!course) delete body._id;
    const r = await fetch(course ? `/api/courses/${course._id}` : "/api/courses", {
      method: course ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return toast.error(d.error ?? "Could not save course");
    toast.success(course ? "Course updated" : "Course created");
    router.push("/admin/courses");
    router.refresh();
  }

  const sec = "card space-y-4 p-6 border-slate-200";
  return (
    <form onSubmit={save} className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="h-display text-2xl text-slate-900">{course ? "Edit course" : "Add new course"}</h1>
        <button disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save course"}
        </button>
      </div>

      {/* 3-Month Live Cohort Preset Quick-Loader */}
      <section className="card p-6 border-2 border-dashed border-emerald-600/30 bg-[#F4FFE2]/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#063F38]" />
              <h2 className="font-bold text-slate-900">3-Month Online Classes Preset Templates (5 Days/Week)</h2>
            </div>
            <p className="text-xs text-slate-600">
              Instantly scaffold a complete 10–12 chapter curriculum with 5 classes a week (Mon–Fri), timetables, lecture notes, slide downloads, and homework prompts.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <select
            className="input !bg-white text-sm"
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
          >
            {ALL_COURSE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="blank-10weeks">⚡ Blank 10-Week / 5-Days Schedule Skeleton</option>
          </select>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="btn-primary text-xs"
              onClick={() => applyPreset(selectedPreset, true)}
            >
              <Wand2 size={14} /> Load Full Preset
            </button>
            <button
              type="button"
              className="btn-outline text-xs"
              onClick={() => applyPreset(selectedPreset, false)}
            >
              Apply Curriculum Only
            </button>
          </div>
        </div>
      </section>

      {/* Basics */}
      <section className={sec}>
        <h2 className="font-bold text-slate-900">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input
              required
              className="input"
              value={f.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              required
              className="input"
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              required
              className="input"
              value={f.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Full-Stack Development"
            />
          </div>
          <div>
            <label className="label">Level</label>
            <select
              className="input"
              value={f.level}
              onChange={(e) => set("level", e.target.value)}
            >
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Overall Duration</label>
            <input
              className="input"
              value={f.duration}
              onChange={(e) => set("duration", e.target.value)}
              placeholder="3 Months (60 Sessions)"
            />
          </div>
          <div>
            <label className="label">Batch / Cohort Code</label>
            <input
              className="input"
              value={f.batchCode}
              onChange={(e) => set("batchCode", e.target.value)}
              placeholder="e.g. Batch 01"
            />
          </div>
          <div>
            <label className="label">Batch Start Date</label>
            <input
              type="date"
              className="input"
              value={f.batchStartDate || ""}
              onChange={(e) => set("batchStartDate", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Max Cohort Seats</label>
            <input
              type="number"
              min={1}
              className="input"
              value={f.maxSeats ?? 40}
              onChange={(e) => set("maxSeats", Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <input
              required
              className="input"
              value={f.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Full description</label>
            <textarea
              required
              rows={4}
              className="input"
              value={f.fullDescription}
              onChange={(e) => set("fullDescription", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Online Live Classes Cohort Schedule */}
      <section className={`${sec} `}>
        <div className="flex items-center gap-2">
          <Radio size={20} className="text-[#063F38]" />
          <h2 className="font-bold text-slate-900 text-base">Live Online Classes & Cohort Schedule</h2>
        </div>
        <p className="text-xs text-slate-500">
          Configure the 3-month live class timetable, weekly schedule, and default live meeting link.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Class Timetable (Days & Hours)</label>
            <input
              className="input"
              value={f.cohortSchedule.timing}
              onChange={(e) => setSched("timing", e.target.value)}
              placeholder="Monday to Friday · 8:00 PM – 9:30 PM PKT"
            />
          </div>
          <div>
            <label className="label">Live Class Platform & Mode</label>
            <input
              className="input"
              value={f.cohortSchedule.mode}
              onChange={(e) => setSched("mode", e.target.value)}
              placeholder="Live Interactive Online via Google Meet"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Live Class Meeting URL (Google Meet / Zoom)</label>
            <input
              type="url"
              className="input font-mono text-xs"
              value={f.cohortSchedule.liveClassLink}
              onChange={(e) => setSched("liveClassLink", e.target.value)}
              placeholder="https://meet.google.com/itskillcore-live"
            />
          </div>
        </div>
      </section>

      {/* Thumbnail */}
      <section className={sec}>
        <h2 className="font-bold text-slate-900">Thumbnail</h2>
        <ImageUploader label="Course thumbnail" value={f.thumbnail} onChange={(u) => set("thumbnail", u)} />
      </section>

      {/* Pricing */}
      <section className={sec}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Pricing</h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={free}
              onChange={(e) => setFree(e.target.checked)}
              className="h-4 w-4 accent-emerald-600 rounded"
            />
            Free course
          </label>
        </div>
        {!free && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Regular price (USD)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={f.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Discount price (optional)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={f.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* Instructor */}
      <section className={sec}>
        <h2 className="font-bold text-slate-900">Instructor</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={f.instructor.name}
              onChange={(e) => set("instructor", { ...f.instructor, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={f.instructor.title}
              onChange={(e) => set("instructor", { ...f.instructor, title: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bio</label>
            <textarea
              rows={2}
              className="input"
              value={f.instructor.bio}
              onChange={(e) => set("instructor", { ...f.instructor, bio: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 sm:max-w-[200px]">
            <ImageUploader
              label="Avatar"
              aspect="aspect-square"
              value={f.instructor.avatar}
              onChange={(u) => set("instructor", { ...f.instructor, avatar: u })}
            />
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className={sec}>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">What you&apos;ll learn</h2>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => set("outcomes", [...f.outcomes, ""])}
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {f.outcomes.map((o: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="input"
              value={o}
              onChange={(e) =>
                set(
                  "outcomes",
                  f.outcomes.map((x: string, j: number) => (j === i ? e.target.value : x))
                )
              }
            />
            <button
              type="button"
              className="btn-danger btn-sm"
              onClick={() => set("outcomes", f.outcomes.filter((_: any, j: number) => j !== i))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </section>

      {/* Curriculum Builder with Presentations & Homework notes */}
      <section className={sec}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Curriculum Builder (3 Months / 5 Days a Week)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add weekly modules, live classes, attach presentation slides (PDF/PPT), and assign homework tasks.
            </p>
          </div>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() =>
              set("curriculum", [
                ...f.curriculum,
                {
                  moduleTitle: `Week ${f.curriculum.length + 1}: Chapter Topic`,
                  weekNumber: f.curriculum.length + 1,
                  lessons: [blankLesson()],
                },
              ])
            }
          >
            <Plus size={14} /> Add Week Module
          </button>
        </div>

        {f.curriculum.map((m: any, i: number) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-[#F4FFE2]/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-slate-300" />
              <input
                className="input !bg-white font-bold text-slate-900"
                placeholder="Module title (e.g. Week 1: Foundations)"
                value={m.moduleTitle}
                onChange={(e) => setMod(i, { moduleTitle: e.target.value })}
              />
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => set("curriculum", f.curriculum.filter((_: any, x: number) => x !== i))}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-3 pl-2">
              {m.lessons.map((l: any, j: number) => (
                <div key={j} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-2 sm:grid-cols-[100px_1.5fr_1fr_90px]">
                    <input
                      className="input text-xs font-bold uppercase text-[#063F38]"
                      placeholder="Day 1 (Mon)"
                      value={l.day || ""}
                      onChange={(e) => setLesson(i, j, { day: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder="Class / Lecture Title"
                      value={l.title}
                      onChange={(e) => setLesson(i, j, { title: e.target.value })}
                    />
                    <input
                      className="input text-xs font-mono"
                      placeholder="Video / Live URL"
                      value={l.videoUrl || ""}
                      onChange={(e) => setLesson(i, j, { videoUrl: e.target.value })}
                    />
                    <input
                      className="input text-xs"
                      placeholder="1.5h"
                      value={l.duration || "1.5h"}
                      onChange={(e) => setLesson(i, j, { duration: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="label text-[10px]">Presentation Slide Deck (PDF / PPT / Upload)</label>
                      <div className="flex gap-1.5">
                        <input
                          className="input text-xs font-mono"
                          placeholder="/uploads/slides.pdf or https://..."
                          value={l.presentationUrl || ""}
                          onChange={(e) => setLesson(i, j, { presentationUrl: e.target.value })}
                        />
                        <label className="btn-outline btn-sm text-[11px] cursor-pointer shrink-0 !px-2.5 flex items-center gap-1" title="Upload PDF/PPT slides">
                          <Upload size={13} /> Upload
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                            onChange={(e) => {
                              uploadSlides(i, j, e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="label text-[10px]">Homework / Assignment Brief</label>
                      <input
                        className="input text-xs"
                        placeholder="Optional task brief for this day"
                        value={l.assignmentPrompt || ""}
                        onChange={(e) => setLesson(i, j, { assignmentPrompt: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label text-[10px]">Lecture Notes & Curriculum Guide</label>
                    <textarea
                      className="input text-xs"
                      rows={2}
                      placeholder="Detailed notes for the student..."
                      value={l.content || ""}
                      onChange={(e) => setLesson(i, j, { content: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-600 rounded"
                        checked={l.isFreePreview}
                        onChange={(e) => setLesson(i, j, { isFreePreview: e.target.checked })}
                      />
                      Free preview
                    </label>
                    <button
                      type="button"
                      className="btn-danger btn-sm text-xs"
                      onClick={() =>
                        setMod(i, {
                          lessons: m.lessons.filter((_: any, x: number) => x !== j),
                        })
                      }
                    >
                      <Trash2 size={13} /> Remove Class
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn-outline btn-sm text-xs"
                onClick={() => setMod(i, { lessons: [...m.lessons, blankLesson()] })}
              >
                <Plus size={14} /> Add Day Class
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Save bar */}
      <section className={`${sec} flex items-center justify-between`}>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-600 rounded"
            checked={f.isPublished}
            onChange={(e) => set("isPublished", e.target.checked)}
          />
          Published (visible to students)
        </label>
        <button disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save course"}
        </button>
      </section>
    </form>
  );
}
