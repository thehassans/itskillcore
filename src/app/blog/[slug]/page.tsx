import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, User, Share2 } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Blog } from "@/models/Content";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { plain, readTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const p: any = await Blog.findOne({ slug }).select("title excerpt coverImage").lean();
  if (!p) return { title: "Article Not Found" };
  return {
    title: `${p.title} | IT SkillCore Journal`,
    description: p.excerpt,
    openGraph: {
      title: `${p.title} | IT SkillCore Journal`,
      description: p.excerpt,
      images: p.coverImage ? [{ url: p.coverImage }] : [],
    },
  };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const p: any = plain(await Blog.findOne({ slug }).lean());
  if (!p) notFound();

  // Get other recommended articles
  const morePosts: any = plain(
    await Blog.find({ _id: { $ne: p._id } })
      .sort({ publishedAt: -1 })
      .limit(2)
      .lean()
  );

  return (
    <>
      <Navbar />
      <article className="container-x max-w-3xl py-12">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#063F38] transition"
        >
          <ArrowLeft size={16} /> All articles
        </Link>

        <div className="mb-4 flex flex-wrap gap-2">
          {p.tags?.map((t: string) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="badge bg-[#F4FFE2] text-[#063F38] border border-[#063F38]/20/80 font-semibold hover:bg-[#C9FA52]/40 transition"
            >
              #{t}
            </Link>
          ))}
        </div>

        <h1 className="h-display text-3xl leading-tight text-slate-900 md:text-5xl font-extrabold">
          {p.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500 border-y border-slate-100 py-3.5">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <User size={15} className="text-[#063F38]" /> {p.author}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={15} className="text-[#063F38]" />
            {new Date(p.publishedAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={15} className="text-[#063F38]" />
            {readTime(p.content)} min read
          </span>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.coverImage}
          alt=""
          className="my-8 aspect-video w-full rounded-3xl object-cover shadow-lg ring-1 ring-emerald-950/10"
        />

        <div className="space-y-6 text-lg leading-relaxed text-slate-700 font-[family-name:var(--font-body)]">
          {String(p.content)
            .split("\n\n")
            .map((para, i) => (
              <p key={i} className="leading-8">
                {para}
              </p>
            ))}
        </div>

        {/* Author bio card */}
        <div className="mt-12 rounded-2xl border border-[#063F38]/15 bg-[#F4FFE2]/60 p-6 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#063F38] text-white font-extrabold text-xl shadow-md">
            {p.author.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#063F38]">Published by</p>
            <h3 className="text-base font-bold text-slate-900">{p.author}</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Educator and Senior Curriculum Specialist at IT SkillCore.
            </p>
          </div>
        </div>

        {/* Recommended more posts */}
        {morePosts.length > 0 && (
          <div className="mt-14 border-t border-slate-200/80 pt-10">
            <h3 className="h-display text-xl font-bold text-slate-900 mb-6">More from the Journal</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {morePosts.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="card p-5 hover:border-[#063F38]/20 hover:shadow-lg transition group"
                >
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}
                  </p>
                  <h4 className="font-bold text-slate-900 group-hover:text-[#063F38] transition mt-1.5 line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
      <Footer />
    </>
  );
}
