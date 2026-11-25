import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Certificate from "@/models/Certificate";
import Broadcast from "@/models/Broadcast";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Attendance from "@/models/Attendance";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import FeeInstallment from "@/models/FeeInstallment";
import LessonQuestion from "@/models/LessonQuestion";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { buildDefaultInstallments, computeWeekdayStreak, evaluateEligibility } from "@/lib/academic";
import { finalPrice, plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard");
  await connectDB();

  const [enr, certs, user]: any[] = await Promise.all([
      Enrollment.find({ student: s.id })
        .sort({ enrolledAt: -1 })
        .populate("course", "title slug thumbnail category price discountPrice curriculum cohortSchedule batchCode")
        .lean(),
    Certificate.find({ student: s.id })
      .sort({ issuedAt: -1 })
      .populate("course", "title")
      .lean(),
    User.findById(s.id).lean(),
  ]).then(plain);

  // Ensure every APPROVED enrollment has monthly installments initialized (honoring coupon finalPriceUSD)
  for (const e of enr.filter((x: any) => x.status === "APPROVED" && x.course)) {
    const count = await FeeInstallment.countDocuments({ student: s.id, course: e.course._id });
    if (count === 0) {
      const billed = typeof e.finalPriceUSD === "number" ? e.finalPriceUSD : finalPrice(e.course);
      const docs = buildDefaultInstallments({
        studentId: s.id,
        courseId: e.course._id,
        enrollmentId: e._id,
        totalPricePKR: billed,
        startDate: e.enrolledAt ? new Date(e.enrolledAt) : new Date(),
      });
      if (docs.length > 0) {
        await FeeInstallment.insertMany(docs).catch(() => {});
      }
    }
  }

  const approvedCourseIds = enr
    .filter((e: any) => e.status === "APPROVED" && e.course)
    .map((e: any) => e.course._id);

  const [
    broadcasts,
    assignments,
    submissions,
    quizzes,
    quizSubs,
    myAttendance,
    installments,
    questions,
    allStudents,
    allAttendance,
    allSubmissions,
    allAssignments,
    allQuizSubs,
  ]: any[] = await Promise.all([
    Broadcast.find({
      $or: [{ target: "ALL" }, { course: { $in: approvedCourseIds } }],
    })
      .sort({ createdAt: -1 })
      .populate("course", "title")
      .lean(),
    Assignment.find({ course: { $in: approvedCourseIds } })
      .sort({ dueDate: 1 })
      .populate("course", "title slug")
      .lean(),
    Submission.find({ student: s.id }).lean(),
    Quiz.find({ course: { $in: approvedCourseIds } })
      .populate("course", "title slug")
      .sort({ weekNumber: 1 })
      .lean(),
    QuizSubmission.find({ student: s.id }).lean(),
    Attendance.find({ student: s.id }).select("course dateKey").lean(),
    FeeInstallment.find({ student: s.id })
      .populate("course", "title slug")
      .populate("enrollment", "accessLocked lockReason")
      .sort({ installmentNumber: 1, dueDate: 1 })
      .lean(),
    LessonQuestion.find({ course: { $in: approvedCourseIds } })
      .populate("course", "title slug")
      .populate("student", "name avatar")
      .sort({ isResolved: 1, createdAt: -1 })
      .lean(),
    User.find({ role: "STUDENT" }).select("name avatar").lean(),
    Attendance.find().select("student dateKey").lean(),
    Submission.find().select("student assignment status score submittedAt").lean(),
    Assignment.find().select("_id dueDate").lean(),
    QuizSubmission.find().select("student passed").lean(),
  ]).then(plain);

  // 75%+ Attendance & Capstone Gate per approved course
  const eligibilityList = enr
    .filter((e: any) => e.status === "APPROVED" && e.course)
    .map((e: any) => {
      const cid = String(e.course._id);
      const attendedCount = myAttendance.filter((a: any) => String(a.course) === cid).length;
      const eligibility = evaluateEligibility({
        course: e.course,
        attendedCount,
        assignments,
        submissions,
        quizzes,
        quizSubmissions: quizSubs,
      });
      const issued = certs.find((c: any) => String(c.course?._id || c.course) === cid);
      return {
        ...eligibility,
        accessLocked: Boolean(e.accessLocked),
        certificateId: issued?.certificateId || null,
      };
    });

  // Leaderboard & Weekday Streak Computation
  const dueMap = new Map<string, number>();
  for (const a of allAssignments) {
    if (a.dueDate) dueMap.set(String(a._id), new Date(a.dueDate).getTime());
  }

  const leaderboard = allStudents
    .map((stu: any) => {
      const sid = String(stu._id);
      const stuAtt = allAttendance.filter((a: any) => String(a.student) === sid);
      const { currentStreak, longestStreak } = computeWeekdayStreak(
        stuAtt.map((a: any) => a.dateKey).filter(Boolean)
      );
      const stuSubs = allSubmissions.filter((x: any) => String(x.student) === sid);
      const onTimeHomework = stuSubs.filter((x: any) => {
        const due = dueMap.get(String(x.assignment));
        return due ? new Date(x.submittedAt).getTime() <= due : true;
      }).length;
      const gradedHigh = stuSubs.filter(
        (x: any) => x.status === "GRADED" && (x.score || 0) >= 80
      ).length;
      const quizzesPassed = allQuizSubs.filter(
        (q: any) => String(q.student) === sid && q.passed
      ).length;

      const points =
        stuAtt.length * 20 +
        currentStreak * 15 +
        onTimeHomework * 30 +
        gradedHigh * 20 +
        quizzesPassed * 25;

      const badges: string[] = [];
      if (currentStreak >= 5) badges.push("5-Day Streak");
      else if (currentStreak >= 3) badges.push(`${currentStreak}-Day Streak`);
      if (onTimeHomework >= 1) badges.push("On-Time Pro");
      if (quizzesPassed >= 1) badges.push("Quiz Achiever");
      if (gradedHigh >= 1) badges.push("Top Scorer");

      return {
        studentId: sid,
        name: stu.name,
        attendanceCount: stuAtt.length,
        currentStreak,
        longestStreak,
        onTimeHomework,
        quizzesPassed,
        points,
        badges,
        isMe: sid === s.id,
      };
    })
    .sort((a: any, b: any) => b.points - a.points || b.currentStreak - a.currentStreak)
    .map((r: any, idx: number) => ({ ...r, rank: idx + 1 }));

  const meStats = leaderboard.find((r: any) => r.isMe) || null;

  const leaves = plain(
    await LeaveRequest.find({ student: s.id })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .lean()
  );

  return (
    <DashboardTabs
      studentId={s.id}
      name={(user as any)?.name ?? s.name}
      email={s.email}
      avatar={(user as any)?.avatar ?? ""}
      enrollments={enr.filter((e: any) => e.course)}
      certificates={certs.filter((c: any) => c.course)}
      broadcasts={broadcasts}
      assignments={assignments}
      submissions={submissions}
      quizzes={quizzes}
      quizSubmissions={quizSubs}
      questions={questions}
      leaves={leaves}
      attendanceCount={myAttendance.length}
      installments={installments}
      eligibilityList={eligibilityList}
      leaderboard={leaderboard.slice(0, 10)}
      meStats={meStats}
    />
  );
}
