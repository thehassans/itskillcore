import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, Clock, BarChart3, PlayCircle, Lock, Award, Infinity as Inf, Radio, Presentation, FileCheck, CheckSquare, Calendar } from "lucide-react";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import EnrollButton from "@/components/landing/EnrollButton";
import CourseCard from "@/components/landing/CourseCard";
import { finalPrice, plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const c: any = await Course.findOne({ slug, isPublished: true }).select("title shortDescription thumbnail").lean();
  if (!c) return { title: "Course Not Found" };
  return {
    title: `${c.title} | IT SkillCore`,
    description: c.shortDescription,
    openGraph: {
      title: `${c.title} | IT SkillCore`,
      description: c.shortDescription,
      images: c.thumbnail ? [{ url: c.thumbnail }] : [],
    },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const c: any = plain(await Course.findOne({ slug, isPublished: true }).lean());
  if (!c) notFound();
  const s = await getSession();
  const enr: any = s ? plain(await Enrollment.findOne({ student: s.id, course: c._id }).lean()) : null;
  const price = finalPrice(c);
  const lessons = c.curriculum.reduce((n: number, m: any) => n + m.lessons.length, 0);
  const outcomes: string[] = c.outcomes?.length ? c.outcomes : ["Build real-world projects from scratch", "Apply industry best practices", "Earn a verifiable certificate", "Get feedback from expert instructors"];

  // Related courses in the same category or other published courses
  const relatedCourses: any = plain(
    await Course.find({ _id: { $ne: c._id }, isPublished: true, category: c.category })
      .limit(3)
      .lean()
  );
  const displayRelated = relatedCourses.length > 0 ? relatedCourses : plain(
    await Course.find({ _id: { $ne: c._id }, isPublished: true })
      .limit(3)
      .lean()
  );

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#fbfdfb]">
        <div className="pointer-events-none absolute inset-0 bg-dot-subtle opacity-60" />
        <div className="container-x relative py-12">
          <span className="eyebrow">{c.category}</span>
          <h1 className="h-display mt-3 max-w-3xl text-3xl leading-tight text-slate-900 sm:text-4xl md:text-5xl">{c.title}</h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">{c.shortDescription}</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><BarChart3 size={16} className="text-[#063F38]" />{c.level}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} className="text-[#063F38]" />{c.duration}</span>
            <span className="flex items-center gap-1.5"><PlayCircle size={16} className="text-[#063F38]" />{lessons} live sessions</span>
          </div>
        </div>
      </section>
      <main className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Live Online Classes & Cohort Schedule Box */}
          <section className="card p-6 border-slate-200 bg-white space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge bg-[#F4FFE2] text-[#063F38] border border-[#063F38]/20 font-bold text-xs">
                  <Radio size={12} className="text-[#063F38] animate-pulse" /> {c.batchCode || "Batch 01"} · Live Cohort
                </span>
                <span className="text-xs font-semibold text-[#063F38] bg-[#F4FFE2] px-2.5 py-1 rounded-full border border-[#063F38]/20">
                  {c.cohortSchedule?.durationMonths || 3} Months · {c.cohortSchedule?.daysPerWeek || 5} Days/Wk · {c.maxSeats || 40} Seats
                </span>
              </div>
              <a
                href={`/api/courses/${c._id}/calendar`}
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-[#063F38]/25 bg-white px-3 py-1 text-xs font-bold text-[#063F38] transition hover:bg-[#F4FFE2]"
              >
                <Calendar size={12} /> Add Mon–Fri Schedule (.ics)
              </a>
            </div>
            <h2 className="font-[family-name:var(--font-head)] text-xl font-bold text-slate-900">
              Live Classes &amp; Weekly Schedule
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Class Timetable</span>
                <p className="font-semibold text-slate-800">{c.cohortSchedule?.timing || "Monday to Friday · 8:00 PM – 9:30 PM PKT"}</p>
                <p className="text-xs text-slate-500">Live instruction + real-time Q&amp;A</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Class Format</span>
                <p className="font-semibold text-slate-800">{c.cohortSchedule?.mode || "Live via Google Meet"}</p>
                <p className="text-xs text-slate-500">Interactive screen share &amp; live coding</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-center gap-1.5 p-2.5 bg-[#F4FFE2]/80 border border-[#063F38]/15 rounded-xl text-[#063F38] font-semibold">
                <Presentation size={14} /> Lecture Notes &amp; Slides
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2.5 bg-[#F4FFE2] border border-[#063F38]/15 rounded-xl text-[#063F38] font-semibold">
                <FileCheck size={14} /> Homework &amp; Uploads
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2.5 bg-[#F4FFE2]/80 border border-[#063F38]/15 rounded-xl text-[#063F38] font-semibold">
                <CheckSquare size={14} /> Chapter Quizzes &amp; Gate
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-[family-name:var(--font-head)] text-2xl font-bold text-slate-900">About this course</h2>
            <p className="leading-relaxed text-slate-600">{c.fullDescription}</p>
          </section>
          <section className="card p-6 border-slate-200">
            <h2 className="mb-4 font-[family-name:var(--font-head)] text-xl font-bold text-slate-900">What you&apos;ll learn</h2>
            <ul className="grid gap-3 sm:grid-cols-2">{outcomes.map((o) => <li key={o} className="flex gap-2 text-sm text-slate-700 font-medium"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />{o}</li>)}</ul>
          </section>
          <section>
            <h2 className="mb-3 font-[family-name:var(--font-head)] text-2xl font-bold text-slate-900">Curriculum</h2>
            <div className="space-y-3">
              {c.curriculum.map((m: any, i: number) => (
                <details key={i} open={i === 0} className="card group overflow-hidden border-slate-200">
                  <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden hover:bg-[#F4FFE2]/40">
                    <span>{m.moduleTitle}</span><span className="text-xs font-normal text-slate-400">{m.lessons.length} lessons</span>
                  </summary>
                  <ul className="divide-y divide-slate-100 border-t border-slate-100">
                    {m.lessons.map((l: any, j: number) => (
                      <li key={j} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                        <span className="flex flex-wrap items-center gap-2 text-slate-700">
                          {l.isFreePreview ? <PlayCircle size={16} className="text-emerald-600 shrink-0" /> : <Lock size={15} className="text-slate-300 shrink-0" />}
                          {l.day && (
                            <span className="rounded bg-[#F4FFE2] px-2 py-0.5 text-[11px] font-bold text-[#063F38] border border-[#063F38]/15">
                              {l.day}
                            </span>
                          )}
                          <span className="font-medium">{l.title}</span>
                          {l.isFreePreview && <span className="badge bg-[#C9FA52]/40 text-[#063F38] border border-[#063F38]/20">Free preview</span>}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {l.presentationUrl && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Slides</span>
                          )}
                          {l.assignmentPrompt && (
                            <span className="rounded bg-amber-50 px-2 py-0.5 font-medium text-amber-800">Homework</span>
                          )}
                          <span className="text-slate-400 font-medium">{l.duration}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>
          <section className="card flex items-center gap-4 p-6 border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {c.instructor?.avatar && <img src={c.instructor.avatar} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-emerald-200" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#063F38]">Your instructor</p>
              <h3 className="text-lg font-bold text-slate-900">{c.instructor?.name}</h3>
              <p className="text-sm text-slate-500">{c.instructor?.title}</p>
              {c.instructor?.bio && <p className="mt-2 text-sm text-slate-600">{c.instructor.bio}</p>}
            </div>
          </section>
        </div>
        <aside className="card h-fit space-y-4 p-5 shadow-xl shadow-emerald-950/5 border-slate-200 lg:sticky lg:top-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.thumbnail} alt="" className="aspect-video w-full rounded-xl object-cover" />
          <p className="text-4xl font-extrabold text-slate-900">{price === 0 ? <span className="text-[#063F38]">Free</span> : `$${price}`}
            {price < c.price && <span className="ml-2 text-lg font-normal text-slate-400 line-through">${c.price}</span>}</p>
          {enr?.status === "APPROVED" ? <Link href={`/learn/${c.slug}`} className="btn-success w-full !py-3">Continue learning</Link>
            : enr?.status === "PENDING" ? <p className="rounded-xl bg-[#F4FFE2] p-4 text-sm text-[#063F38] border border-[#063F38]/20">Your enrollment request is pending admin approval.</p>
            : enr?.status === "REJECTED" ? <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200">Your previous request was rejected. Please contact support.</p>
            : <EnrollButton courseId={c._id} slug={c.slug} free={price === 0} basePrice={price} />}
          <ul className="space-y-2 pt-2 text-sm text-slate-600 font-medium">
            <li className="flex items-center gap-2"><Inf size={16} className="text-[#063F38]" />Lifetime access</li>
            <li className="flex items-center gap-2"><Award size={16} className="text-[#063F38]" />Verified certificate of completion</li>
            <li className="flex items-center gap-2"><Clock size={16} className="text-[#063F38]" />{c.duration} of content</li>
          </ul>
        </aside>
      </main>

      {/* Related Courses Section */}
      {displayRelated.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50/50 py-16">
          <div className="container-x">
            <h2 className="section-title text-2xl text-slate-900 mb-8">Related Courses You Might Like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayRelated.map((rel: any) => (
                <CourseCard key={rel._id} c={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
