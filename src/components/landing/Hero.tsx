"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight, ShieldCheck, Radio, Clock } from "lucide-react";

const avatars = [
  "/images/pk-bilal.jpg",
  "/images/pk-ayesha.jpg",
  "/images/pk-hamza.jpg",
  "/images/pk-fatima.jpg",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-[#fbfdfb]">
      {/* Subtle architectural dot background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-subtle opacity-55" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[600px] rounded-full bg-[#F4FFE2]/80 blur-3xl" />

      <div className="container-x relative grid items-center gap-12 py-14 lg:grid-cols-[1.06fr_0.94fr] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-[#063F38]" />
            Admissions Open · 3-Month Live Cohorts
          </span>

          <h1 className="h-display mt-5 text-4xl leading-[1.05] text-slate-900 sm:text-5xl lg:text-[3.5rem]">
            Master job-ready tech skills{" "}
            <span className="text-[#063F38]">
              live with <span className="text-[#063F38]">industry mentors.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Join structured 5-day-a-week live Google Meet classes, submit weekly projects for instructor review, and earn employer-verifiable Golden-Seal credentials.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link href="/courses" className="btn-primary !px-7 !py-3.5 text-sm">
              Explore Live Cohorts <ArrowRight size={16} />
            </Link>
            <Link href="/verify/CERT-ITSKILLCORE-2025" className="btn-outline !px-6 !py-3.5 text-sm">
              <ShieldCheck size={17} className="text-[#063F38]" /> Verify Credential
            </Link>
          </div>

          {/* Authentic Pakistani Learners Trust Bar */}
          <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-slate-200/70 pt-6">
            <div className="flex -space-x-3">
              {avatars.map((a) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={a}
                  src={a}
                  alt="IT SkillCore graduate"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover object-top shadow-sm"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="ml-2 text-sm font-extrabold text-slate-900">4.9/5</span>
              </div>
              <p className="text-xs font-medium text-slate-500">
                Trusted by <b className="text-slate-800">8,500+ learners</b> across Pakistan
              </p>
            </div>
          </div>
        </motion.div>

        {/* Clean Uncluttered Editorial Studio Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="card overflow-hidden border-slate-200/90 bg-white p-3 shadow-[0_20px_50px_-15px_rgba(10,41,18,0.12)]">
            <div className="overflow-hidden rounded-xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero.jpg"
                alt="Software engineer in live studio session"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="mt-3 space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#063F38]">
                    <Radio size={12} className="text-[#063F38]" />
                    <span>Live Cohort · Week 12 Capstone</span>
                  </div>
                  <h2 className="mt-1 font-[family-name:var(--font-head)] text-base font-bold text-slate-900 sm:text-lg">
                    Full-Stack Web with Next.js &amp; MERN
                  </h2>
                </div>
                <span className="shrink-0 rounded-lg border border-[#063F38]/20 bg-white px-2.5 py-1 font-mono text-xs font-extrabold text-[#063F38]">
                  92% Att.
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full w-[92%] rounded-full bg-[#063F38]" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Clock size={13} className="text-[#063F38]" /> Mon–Fri · 8:00 PM PKT (60 Live Sessions)
                </span>
                <span className="font-semibold text-[#063F38]">Golden-Seal Eligible</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
