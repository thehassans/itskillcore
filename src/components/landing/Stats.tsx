"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1400, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats({ students, courses }: { students: number; courses: number }) {
  const items = [
    [Math.max(students, 8500), "+", "Active Pakistani Learners", "Across 35+ cities"],
    [94, "%", "Cohort Completion Rate", "Via 75% attendance tracking"],
    [Math.max(courses, 4), "", "3-Month Intensive Cohorts", "Mon–Fri live instruction"],
    [4.9, "/5", "Graduate Satisfaction", "Employer-verified outcomes"],
  ] as const;

  return (
    <div className="grid grid-cols-2 divide-y divide-[#0c594f] md:grid-cols-4 md:divide-x md:divide-y-0">
      {items.map(([n, s, label, sub]) => (
        <div key={label} className="px-4 py-4 text-center md:py-1">
          <p className="h-display text-3xl text-[#C9FA52] sm:text-4xl">
            {n === 4.9 ? (
              <>
                4.9<span className="text-[#F4FFE2] text-xl">/5</span>
              </>
            ) : (
              <Counter to={n} suffix={s} />
            )}
          </p>
          <p className="mt-1.5 text-sm font-bold text-white">{label}</p>
          <p className="mt-0.5 text-xs text-[#F4FFE2]/75">{sub}</p>
        </div>
      ))}
    </div>
  );
}
