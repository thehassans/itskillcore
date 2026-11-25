import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
import Submission from "@/models/Submission";
import Assignment from "@/models/Assignment";
import QuizSubmission from "@/models/QuizSubmission";
import { computeWeekdayStreak } from "@/lib/academic";
import { plain } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [students, attendances, submissions, assignments, quizSubs]: any[] = await Promise.all([
    User.find({ role: "STUDENT" }).select("name avatar").lean(),
    Attendance.find().select("student dateKey course").lean(),
    Submission.find().select("student assignment status score submittedAt").lean(),
    Assignment.find().select("_id dueDate").lean(),
    QuizSubmission.find().select("student passed score").lean(),
  ]).then(plain);

  const dueMap = new Map<string, number>();
  for (const a of assignments) {
    if (a.dueDate) dueMap.set(String(a._id), new Date(a.dueDate).getTime());
  }

  const ranked = students
    .map((stu: any) => {
      const sid = String(stu._id);
      const myAtt = attendances.filter((a: any) => String(a.student) === sid);
      const dateKeys = myAtt.map((a: any) => a.dateKey).filter(Boolean);
      const { currentStreak, longestStreak } = computeWeekdayStreak(dateKeys);

      const mySubs = submissions.filter((s: any) => String(s.student) === sid);
      const onTimeHomework = mySubs.filter((s: any) => {
        const due = dueMap.get(String(s.assignment));
        return due ? new Date(s.submittedAt).getTime() <= due : true;
      }).length;
      const gradedHigh = mySubs.filter((s: any) => s.status === "GRADED" && (s.score || 0) >= 80).length;

      const myQuizzes = quizSubs.filter((q: any) => String(q.student) === sid);
      const quizzesPassed = myQuizzes.filter((q: any) => q.passed).length;

      const points =
        myAtt.length * 20 +
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
        avatar: stu.avatar || "",
        attendanceCount: myAtt.length,
        currentStreak,
        longestStreak,
        onTimeHomework,
        quizzesPassed,
        points,
        badges,
        isMe: sid === session.id,
      };
    })
    .sort((a: any, b: any) => b.points - a.points || b.currentStreak - a.currentStreak)
    .map((row: any, i: number) => ({ ...row, rank: i + 1 }));

  const me = ranked.find((r: any) => r.isMe) || null;

  return NextResponse.json({
    leaderboard: ranked.slice(0, 10),
    me,
  });
}
