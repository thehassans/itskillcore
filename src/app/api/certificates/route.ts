import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { connectDB } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import Certificate from "@/models/Certificate";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import { evaluateEligibility } from "@/lib/academic";
import { plain } from "@/lib/utils";

const code = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// Admin: all. Student: own.
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const list = await Certificate.find(s.role === "ADMIN" ? {} : { student: s.id })
    .sort({ issuedAt: -1 })
    .populate("student", "name email")
    .populate("course", "title")
    .lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { studentId, courseId, issuedAt, customNote, overrideGate = false } = await req.json();
    if (!studentId || !courseId) {
      return NextResponse.json({ error: "Student and course are required" }, { status: 400 });
    }
    await connectDB();

    const [course, attCount, assignments, submissions, quizzes, quizSubs]: any[] =
      await Promise.all([
        Course.findById(courseId).select("title curriculum").lean(),
        Attendance.countDocuments({ student: studentId, course: courseId }),
        Assignment.find({ course: courseId }).select("_id course maxScore").lean(),
        Submission.find({ student: studentId, course: courseId }).lean(),
        Quiz.find({ course: courseId }).select("_id course").lean(),
        QuizSubmission.find({ student: studentId, course: courseId }).lean(),
      ]).then((res) => res.map((x: any) => (typeof x === "number" ? x : plain(x))));

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const eligibility = evaluateEligibility({
      course,
      attendedCount: attCount,
      assignments,
      submissions,
      quizzes,
      quizSubmissions: quizSubs,
    });

    if (!eligibility.eligible && !overrideGate) {
      return NextResponse.json(
        {
          error: `75% Attendance & Capstone Gate not met: ${eligibility.missingReasons[0] || "Requirements pending"}. Enable Admin Override to issue anyway.`,
          eligibility,
        },
        { status: 400 }
      );
    }

    const cert = await Certificate.create({
      student: studentId,
      course: courseId,
      customNote,
      issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      certificateId: `CERT-${new Date().getFullYear()}-${code()}`,
      attendancePct: eligibility.attendancePct,
      homeworkAvg: eligibility.homeworkAvg ?? undefined,
      quizScore: eligibility.bestQuizScore ?? undefined,
      overrideGate: Boolean(overrideGate && !eligibility.eligible),
    });

    return NextResponse.json(cert, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
