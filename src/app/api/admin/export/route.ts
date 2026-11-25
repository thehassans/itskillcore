import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import Certificate from "@/models/Certificate";
import FeeInstallment from "@/models/FeeInstallment";
import { evaluateEligibility } from "@/lib/academic";
import { plain } from "@/lib/utils";

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]) {
  return [headers.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\r\n");
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "INSTRUCTOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const type = new URL(req.url).searchParams.get("type") || "students";
  await connectDB();

  // Financial & enrollment exports are Admin-only
  if ((type === "fees" || type === "enrollments") && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required for financial exports" }, { status: 403 });
  }

  if (type === "fees") {
    const list: any[] = plain(
      await FeeInstallment.find()
        .populate("student", "name email")
        .populate("course", "title batchCode")
        .sort({ createdAt: -1 })
        .lean()
    );
    const csv = toCsv(
      ["Student", "Email", "Course", "Batch", "Month", "Amount (PKR)", "Method", "TID", "Status", "Due Date", "Verified At"],
      list.map((i) => [
        i.student?.name,
        i.student?.email,
        i.course?.title,
        i.course?.batchCode || "Batch 01",
        i.monthLabel,
        i.amount,
        i.paymentMethod,
        i.transactionId,
        i.status,
        i.dueDate ? new Date(i.dueDate).toISOString().slice(0, 10) : "",
        i.verifiedAt ? new Date(i.verifiedAt).toISOString().slice(0, 10) : "",
      ])
    );
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="itskillcore-fee-ledger.csv"',
      },
    });
  }

  if (type === "enrollments") {
    const list: any[] = plain(
      await Enrollment.find()
        .populate("student", "name email")
        .populate("course", "title batchCode")
        .sort({ enrolledAt: -1 })
        .lean()
    );
    const csv = toCsv(
      ["Student", "Email", "Course", "Status", "Access Locked", "Payment Reference", "Enrolled At"],
      list.map((e) => [
        e.student?.name,
        e.student?.email,
        e.course?.title,
        e.status,
        e.accessLocked ? "YES" : "NO",
        e.paymentReference,
        e.enrolledAt ? new Date(e.enrolledAt).toISOString().slice(0, 10) : "",
      ])
    );
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="itskillcore-enrollments.csv"',
      },
    });
  }

  // Students / Gradebook Export (scoped automatically if INSTRUCTOR)
  const scope = await getTeacherCourseIds(session);
  const courseFilter = scope !== null ? { course: { $in: scope } } : {};

  const [enr, attendances, assignments, submissions, quizzes, quizSubs, certs]: any[] =
    await Promise.all([
      Enrollment.find({ status: "APPROVED", ...courseFilter })
        .populate("student", "name email")
        .populate("course", "title batchCode curriculum")
        .lean(),
      Attendance.find(courseFilter).select("student course verifiedByInstructor").lean(),
      Assignment.find(courseFilter).select("_id course maxScore").lean(),
      Submission.find(courseFilter).lean(),
      Quiz.find(courseFilter).select("_id course").lean(),
      QuizSubmission.find(courseFilter).lean(),
      Certificate.find(courseFilter).select("student course certificateId isRevoked").lean(),
    ]).then(plain);

  const rows = enr
    .filter((e: any) => e.student && e.course)
    .map((e: any) => {
      const sid = String(e.student._id);
      const cid = String(e.course._id);
      const myAtt = attendances.filter(
        (a: any) => String(a.student) === sid && String(a.course) === cid
      );
      const verifiedAttCount = myAtt.filter((a: any) => a.verifiedByInstructor).length;
      const elig = evaluateEligibility({
        course: e.course,
        attendedCount: myAtt.length,
        assignments,
        submissions: submissions.filter((s: any) => String(s.student) === sid),
        quizzes,
        quizSubmissions: quizSubs.filter((q: any) => String(q.student) === sid),
      });
      const totalLessons =
        e.course.curriculum?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 1;
      const progressPct = Math.min(100, Math.round(((e.progress?.length || 0) / totalLessons) * 100));
      const cert = certs.find(
        (c: any) => String(c.student) === sid && String(c.course) === cid && !c.isRevoked
      );

      return [
        e.student.name,
        e.student.email,
        e.course.title,
        e.course.batchCode || "Batch 01",
        `${progressPct}%`,
        `${elig.attendedCount}/${elig.totalSessions} (${elig.attendancePct}%)`,
        verifiedAttCount,
        elig.homeworkAvg != null ? `${elig.homeworkAvg}%` : "N/A",
        `${elig.passedQuizCount}/${elig.quizzesTotal}`,
        elig.eligible ? "ELIGIBLE" : "IN PROGRESS",
        cert?.certificateId || "",
      ];
    });

  const csv = toCsv(
    [
      "Student",
      "Email",
      "Course",
      "Batch",
      "Lesson Progress",
      "Attendance",
      "Instructor-Verified Sessions",
      "Homework Avg",
      "Quizzes Passed",
      "Certificate Gate",
      "Certificate ID",
    ],
    rows
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="itskillcore-gradebook.csv"',
    },
  });
}
