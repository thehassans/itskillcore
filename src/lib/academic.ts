export const MIN_ATTENDANCE_PCT = 75;
export const MIN_HOMEWORK_AVG = 60;

export interface CourseEligibility {
  courseId: string;
  courseTitle: string;
  attendedCount: number;
  totalSessions: number;
  requiredSessions: number;
  attendancePct: number;
  attendanceMet: boolean;
  assignmentsTotal: number;
  gradedCount: number;
  homeworkAvg: number | null;
  homeworkMet: boolean;
  quizzesTotal: number;
  passedQuizCount: number;
  bestQuizScore: number | null;
  quizMet: boolean;
  eligible: boolean;
  missingReasons: string[];
}

export function evaluateEligibility({
  course,
  attendedCount,
  assignments,
  submissions,
  quizzes,
  quizSubmissions,
}: {
  course: any;
  attendedCount: number;
  assignments: any[];
  submissions: any[];
  quizzes: any[];
  quizSubmissions: any[];
}): CourseEligibility {
  const cid = String(course._id);
  const totalSessions = Math.max(
    1,
    (course.curriculum || []).reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)
  );
  const requiredSessions = Math.ceil((totalSessions * MIN_ATTENDANCE_PCT) / 100);
  const attendancePct = Math.min(100, Math.round((attendedCount / totalSessions) * 100));
  const attendanceMet = attendancePct >= MIN_ATTENDANCE_PCT;

  const courseAssignments = assignments.filter((a: any) => String(a.course?._id || a.course) === cid);
  const courseSubmissions = submissions.filter((s: any) => String(s.course?._id || s.course) === cid);
  const graded = courseSubmissions.filter((s: any) => s.status === "GRADED" && s.score != null);

  let homeworkAvg: number | null = null;
  if (graded.length > 0) {
    const pcts = graded.map((s: any) => {
      const a = courseAssignments.find((x: any) => String(x._id) === String(s.assignment?._id || s.assignment));
      const maxScore = a?.maxScore || 100;
      return Math.min(100, Math.round((Number(s.score) / maxScore) * 100));
    });
    homeworkAvg = Math.round(pcts.reduce((sum: number, v: number) => sum + v, 0) / pcts.length);
  }
  const homeworkMet =
    courseAssignments.length === 0 ? true : homeworkAvg !== null && homeworkAvg >= MIN_HOMEWORK_AVG;

  const courseQuizzes = quizzes.filter((q: any) => String(q.course?._id || q.course) === cid);
  const courseQuizSubs = quizSubmissions.filter((qs: any) => String(qs.course?._id || qs.course) === cid);
  const passedQuizCount = courseQuizSubs.filter((qs: any) => qs.passed).length;
  const bestQuizScore = courseQuizSubs.length
    ? Math.max(...courseQuizSubs.map((qs: any) => Number(qs.score || 0)))
    : null;
  const quizMet = courseQuizzes.length === 0 ? true : passedQuizCount >= 1;

  const missingReasons: string[] = [];
  if (!attendanceMet) {
    missingReasons.push(
      `Attendance ${attendancePct}% (${attendedCount}/${totalSessions} classes — need ${MIN_ATTENDANCE_PCT}% / ${requiredSessions} classes)`
    );
  }
  if (!homeworkMet) {
    missingReasons.push(
      homeworkAvg === null
        ? `Graded capstone/homework score required (min ${MIN_HOMEWORK_AVG}%)`
        : `Homework avg ${homeworkAvg}% (need min ${MIN_HOMEWORK_AVG}%)`
    );
  }
  if (!quizMet) {
    missingReasons.push(`Pass at least 1 cohort quiz`);
  }

  return {
    courseId: cid,
    courseTitle: course.title,
    attendedCount,
    totalSessions,
    requiredSessions,
    attendancePct,
    attendanceMet,
    assignmentsTotal: courseAssignments.length,
    gradedCount: graded.length,
    homeworkAvg,
    homeworkMet,
    quizzesTotal: courseQuizzes.length,
    passedQuizCount,
    bestQuizScore,
    quizMet,
    eligible: attendanceMet && homeworkMet && quizMet,
    missingReasons,
  };
}

/** Counts consecutive Mon-Fri weekday class days from a sorted/unsorted list of YYYY-MM-DD strings. */
export function computeWeekdayStreak(dateKeys: string[]): { currentStreak: number; longestStreak: number } {
  const unique = Array.from(new Set(dateKeys)).sort();
  if (unique.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Helper: advance one weekday (Mon-Fri) forward from YYYY-MM-DD
  const nextWeekday = (key: string) => {
    const d = new Date(`${key}T00:00:00Z`);
    do {
      d.setUTCDate(d.getUTCDate() + 1);
    } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
    return d.toISOString().slice(0, 10);
  };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = unique[i - 1];
    const curr = unique[i];
    // Next calendar day OR next Mon-Fri weekday matches
    const prevPlus1 = new Date(`${prev}T00:00:00Z`);
    prevPlus1.setUTCDate(prevPlus1.getUTCDate() + 1);
    const calNext = prevPlus1.toISOString().slice(0, 10);
    if (curr === calNext || curr === nextWeekday(prev)) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  return { currentStreak: run, longestStreak: longest };
}

/** Compute coupon / scholarship discount cleanly against a base USD course price. */
export function applyCouponDiscount(basePriceUSD: number, coupon: any) {
  const base = Math.max(0, Number(basePriceUSD) || 0);
  if (!coupon || base === 0) return { discountUSD: 0, finalUSD: base };
  const rawDiscount =
    coupon.discountType === "PERCENT"
      ? Math.round((base * Math.min(100, Math.max(0, Number(coupon.discountValue) || 0))) / 100)
      : Math.max(0, Number(coupon.discountValue) || 0);
  const discountUSD = Math.min(base, rawDiscount);
  const finalUSD = Math.max(0, base - discountUSD);
  return { discountUSD, finalUSD };
}

/** Generate default 3-month fee installments when an enrollment is approved or seeded. */
export function buildDefaultInstallments({
  studentId,
  courseId,
  enrollmentId,
  totalPricePKR,
  startDate = new Date(),
}: {
  studentId: any;
  courseId: any;
  enrollmentId: any;
  totalPricePKR: number;
  startDate?: Date;
}) {
  // Convert catalog USD prices (< 1000) into PKR; skip fee schedule for completely free / 100% scholarship cohorts
  if (totalPricePKR <= 0) return [];
  const normalizedPKR =
    totalPricePKR < 1000 ? Math.max(300, Math.round(totalPricePKR * 120)) : totalPricePKR;
  const perMonth = Math.round(normalizedPKR / 3 / 100) * 100;
  return [1, 2, 3].map((num) => {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + (num - 1));
    return {
      student: studentId,
      course: courseId,
      enrollment: enrollmentId,
      installmentNumber: num,
      monthLabel: `Month ${num} Tuition (Weeks ${(num - 1) * 4 + 1}–${num * 4})`,
      amount: num === 3 ? normalizedPKR - perMonth * 2 : perMonth,
      dueDate: due,
      paymentMethod: "JazzCash" as const,
      status: "UNPAID" as const,
    };
  });
}
