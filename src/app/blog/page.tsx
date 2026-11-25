import Link from "next/link";
import type { Metadata } from "next";
import { Search, SearchX, Tag } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Blog } from "@/models/Content";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { escapeRegex, plain, readTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Insights | IT SkillCore",
  description: "Articles on web development, software engineering, career growth, and industry best practices.",
};

type SP = Promise<{ q?: string; tag?: string }>;

export default async function BlogIndex({ searchParams }: { searchParams: SP }) {
  const { q, tag } = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }];
  }
  if (tag) {
    filter.tags = tag;
  }

  const [posts, allTags]: any[] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1 }).lean(),
    Blog.distinct("tags"),
  ]).then(plain);

  return (
    <>
      <Navbar />
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#fbfdfb] py-14">
        <div className="pointer-events-none absolute inset-0 bg-dot-subtle opacity-60" />
        <div className="container-x relative">
          <span className="eyebrow mb-3">IT SkillCore Journal</span>
          <h1 className="section-title text-slate-900">Learning, careers &amp; craft</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            In-depth guides, practical engineering tips, and career perspectives from working software architects and educators.
          </p>

          <form className="relative mt-6 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#063F38]/60" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search articles…"
              className="input !rounded-2xl !py-3.5 !pl-11 shadow-sm border-slate-200 focus:border-emerald-600"
            />
            {tag && <input type="hidden" name="tag" value={tag} />}
          </form>
        </div>
      </section>

      <main className="container-x py-10">
        {/* Tags bar */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                !tag
                  ? "bg-[#063F38] text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-emerald-400 hover:text-[#063F38]"
              }`}
            >
              All Topics
            </Link>
            {allTags.map((t: string) => (
              <Link
                key={t}
                href={`/blog?tag=${encodeURIComponent(t)}`}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  tag === t
                    ? "bg-[#063F38] text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-emerald-400 hover:text-[#063F38]"
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="card mx-auto mt-12 max-w-md p-10 text-center border-slate-200">
            <SearchX className="mx-auto text-emerald-300" size={48} />
            <h3 className="mt-4 font-bold text-slate-900">No articles found</h3>
            <p className="mt-1 text-sm text-slate-500">
              We couldn&apos;t find any articles matching your search criteria.
            </p>
            <Link href="/blog" className="btn-primary mt-5">
              Reset search
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p: any) => (
              <Link
                key={p._id}
                href={`/blog/${p.slug}`}
                className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:border-[#063F38]/20 border-slate-200 flex flex-col"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.coverImage}
                  alt=""
                  className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                      <span>{new Date(p.publishedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</span>
                      <span>{readTime(p.content)} min read</span>
                    </div>
                    <h2 className="font-[family-name:var(--font-head)] text-lg font-bold text-slate-900 group-hover:text-[#063F38] transition leading-snug">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{p.excerpt}</p>
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                      {p.tags.slice(0, 3).map((t: string) => (
                        <span key={t} className="badge bg-[#F4FFE2] text-[#063F38] text-[10px] font-semibold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
