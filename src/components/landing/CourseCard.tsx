import Link from "next/link";
import { Clock, BarChart3, ArrowRight } from "lucide-react";
import { finalPrice } from "@/lib/utils";

export default function CourseCard({ c }: { c: any }) {
  const price = finalPrice(c);
  const pctOff =
    price < c.price && c.price > 0
      ? Math.round(((c.price - price) / c.price) * 100)
      : 0;

  return (
    <div className="card group flex flex-col overflow-hidden transition-colors duration-200 hover:border-[#063F38]/40">
      <Link href={`/courses/${c.slug}`} className="relative block overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.thumbnail}
          alt={c.title}
          className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="badge bg-white/95 text-[#063F38] shadow-sm backdrop-blur font-bold text-[11px]">
            {c.category}
          </span>
          <span className="badge bg-[#063F38] text-[#C9FA52] font-bold text-[10px] tracking-wide uppercase">
            5d/Wk Live
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
            <BarChart3 size={13} className="text-[#063F38]" />
            {c.level}
          </span>
          <span className="text-slate-300">/</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <Clock size={13} className="text-[#063F38]" />
            {c.duration}
          </span>
        </div>

        <Link href={`/courses/${c.slug}`}>
          <h3 className="font-[family-name:var(--font-head)] text-[17px] font-bold leading-snug text-slate-900 transition group-hover:text-[#063F38] line-clamp-2">
            {c.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {c.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-extrabold text-[#063F38]">
                {price === 0 ? "Free" : `$${price}`}
              </span>
              {price < c.price && (
                <span className="text-xs font-medium text-slate-400 line-through">
                  ${c.price}
                </span>
              )}
            </div>
            {pctOff > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#063F38]">
                Save {pctOff}% · 3-Mo Plan
              </span>
            )}
          </div>

          <Link href={`/courses/${c.slug}`} className="btn-primary btn-sm">
            Syllabus <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
