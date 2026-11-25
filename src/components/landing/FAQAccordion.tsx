"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Plus,
  Minus,
  ArrowRight,
  MessageSquare,
  Phone,
  ChevronsUpDown,
} from "lucide-react";

export type FAQItem = {
  _id: string;
  question: string;
  answer: string;
  category?: string;
};

function RichAnswer({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-600">
      {blocks.map((block, idx) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const isBulletList = lines.length > 0 && lines.every((l) => l.startsWith("- "));
        if (isBulletList) {
          return (
            <ul key={idx} className="space-y-2 pt-0.5">
              {lines.map((line, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#063F38]" />
                  <span>{line.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={idx}>{block}</p>;
      })}
    </div>
  );
}

export default function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean) as string[]));
    return ["All", ...unique];
  }, [faqs]);

  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(() => (faqs[0] ? [faqs[0]._id] : []));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const catMatch = cat === "All" || f.category === cat;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        (f.category || "").toLowerCase().includes(q)
      );
    });
  }, [faqs, cat, query]);

  const countFor = (c: string) =>
    c === "All" ? faqs.length : faqs.filter((f) => f.category === c).length;

  const toggle = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allExpanded = filtered.length > 0 && filtered.every((f) => openIds.includes(f._id));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setOpenIds([]);
    } else {
      setOpenIds(filtered.map((f) => f._id));
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[330px_1fr] lg:gap-14 items-start">
      {/* Left Sticky Navigation & Search Column */}
      <aside className="space-y-5 lg:sticky lg:top-24">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schedules, fees, PIN, PDF…"
            className="input !pl-9 !pr-9 !py-2.5 text-sm bg-white"
            aria-label="Search FAQs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Index */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-2 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Browse by Topic
          </p>
          {categories.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
                  active
                    ? "bg-[#063F38] text-white"
                    : "text-slate-600 hover:bg-[#F4FFE2]/70 hover:text-[#063F38]"
                }`}
              >
                <span className="truncate">{c === "All" ? "All Topics" : c}</span>
                <span
                  className={`ml-2 shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
                    active ? "bg-[#C9FA52] text-[#063F38]" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {countFor(c)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Direct Advisor Card */}
        <div className="rounded-2xl bg-[#063F38] p-6 text-white space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C9FA52]">
            <MessageSquare size={11} /> Direct Admissions Support
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-head)] text-base font-bold text-white">
              Still have a specific question?
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/80">
              Speak directly with a cohort advisor for custom fee plans, batch start dates, or employer verification.
            </p>
          </div>
          <div className="space-y-2 border-t border-white/10 pt-3.5 text-xs">
            <a
              href="tel:+923001234567"
              className="flex items-center gap-2 font-mono text-emerald-100 hover:text-[#C9FA52] transition"
            >
              <Phone size={12} /> +92 300 123 4567
            </a>
            <a
              href="#contact"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9FA52] px-4 py-2.5 text-xs font-bold text-[#063F38] transition hover:bg-[#d8fc7b]"
            >
              Message Admissions Desk <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </aside>

      {/* Right Detailed Accordion Column */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            Showing <b className="text-slate-900">{filtered.length}</b> of {faqs.length} answers
            {cat !== "All" ? ` in ${cat}` : ""}
          </p>
          {filtered.length > 1 && (
            <button
              type="button"
              onClick={toggleExpandAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#063F38]/40 hover:text-[#063F38] transition"
            >
              <ChevronsUpDown size={13} />
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <p className="text-sm font-medium text-slate-600">
              No questions matched &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCat("All");
              }}
              className="btn-outline btn-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f, idx) => {
              const isOpen = openIds.includes(f._id);
              const num = String(idx + 1).padStart(2, "0");
              return (
                <div
                  key={f._id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "border-[#063F38]/30 bg-white shadow-[0_10px_30px_-15px_rgba(6,63,56,0.12)]"
                      : "border-slate-200/90 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(f._id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-4 p-5 sm:p-6 text-left transition"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span
                        className={`mt-0.5 shrink-0 font-mono text-xs font-bold tabular-nums ${
                          isOpen ? "text-[#063F38]" : "text-slate-400"
                        }`}
                      >
                        {num}
                      </span>
                      <div className="space-y-1 min-w-0">
                        {f.category && (
                          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#063F38]/75">
                            {f.category}
                          </span>
                        )}
                        <h3 className="font-[family-name:var(--font-head)] text-[15px] sm:text-base font-bold text-slate-900 leading-snug">
                          {f.question}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
                        isOpen
                          ? "border-[#063F38] bg-[#063F38] text-[#C9FA52]"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 bg-[#FAFCFB] px-5 pb-6 pt-4 sm:pl-16 sm:pr-6">
                          <RichAnswer text={f.answer} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
