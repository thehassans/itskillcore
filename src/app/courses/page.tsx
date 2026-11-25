import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX } from "lucide-react";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import CourseCard from "@/components/landing/CourseCard";
import { escapeRegex, plain } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Courses",
  description: "Browse our expert-led courses. Filter by category, level, and price to find the perfect learning path for your career.",
};
type SP = Promise<{ q?: string; category?: string; level?: string; price?: string }>;

export default async function Courses({ searchParams }: { searchParams: SP }) {
  const { q, category, level, price } = await searchParams;
  await connectDB();
  const filter: Record<string, unknown> = { isPublished: true };
  if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (price === "free") filter.$or = [{ price: 0 }, { discountPrice: 0 }];
  if (price === "paid") { filter.price = { $gt: 0 }; filter.$nor = [{ discountPrice: 0 }]; }
  const [courses, categories] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).lean(),
    Course.distinct("category", { isPublished: true }),
  ]).then(plain);

  const cur: Record<string, string | undefined> = { q, category, level, price };
  const href = (k: string, v?: string) => {
    const p = new URLSearchParams();
    Object.entries({ ...cur, [k]: v }).forEach(([a, b]) => b && p.set(a, b));
    return `/courses?${p}`;
  };
  const pill = (on: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      on
        ? "bg-[#063F38] text-white shadow-sm"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-emerald-400 hover:text-[#063F38]"
    }`;

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#fbfdfb] py-14">
        <div className="pointer-events-none absolute inset-0 bg-dot-subtle opacity-60" />
        <div className="container-x relative">
          <span className="eyebrow mb-3">Live Cohort Catalog</span>
          <h1 className="section-title text-slate-900">Explore our 3-month bootcamps</h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-600">
            Hands-on Mon–Fri live Google Meet classes taught by working industry engineers &amp; designers.
          </p>
          <form className="relative mt-6 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#063F38]/60" />
            <input name="q" defaultValue={q} placeholder="Search cohorts (e.g. Next.js, UI/UX, Data)…" className="input !rounded-2xl !py-3.5 !pl-11 shadow-sm border-slate-200 focus:border-emerald-600" />
            {category && <input type="hidden" name="category" value={category} />}
            {level && <input type="hidden" name="level" value={level} />}
            {price && <input type="hidden" name="price" value={price} />}
          </form>
        </div>
      </section>
      <main className="container-x py-10">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link href={href("category")} className={pill(!category)}>All</Link>
            {categories.map((c: string) => <Link key={c} href={href("category", c)} className={pill(category === c)}>{c}</Link>)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Level:</span>
            {["Beginner", "Intermediate", "Advanced"].map((l) => <Link key={l} href={href("level", level === l ? undefined : l)} className={pill(level === l)}>{l}</Link>)}
            <span className="ml-3 text-slate-400 font-medium">Price:</span>
            {[["free", "Free"], ["paid", "Paid"]].map(([v, l]) => <Link key={v} href={href("price", price === v ? undefined : v)} className={pill(price === v)}>{l}</Link>)}
          </div>
        </div>
        {courses.length === 0 ? (
          <div className="card mx-auto mt-14 max-w-md p-10 text-center border-slate-200">
            <SearchX className="mx-auto text-emerald-300" size={48} />
            <h3 className="mt-4 font-bold text-slate-900">No courses found</h3>
            <p className="mt-1 text-sm text-slate-500">Try clearing a filter or searching for something else.</p>
            <Link href="/courses" className="btn-primary mt-5">Clear filters</Link>
          </div>
        ) : <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map((c: any) => <CourseCard key={c._id} c={c} />)}</div>}
      </main>
      <Footer />
    </>
  );
}
