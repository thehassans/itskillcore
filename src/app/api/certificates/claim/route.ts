import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import Certificate from "@/models/Certificate";
import { evaluateEligibility } from "@/lib/academic";
import { plain } from "@/lib/utils";

const code = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// Student auto-claims unlocked certificate once 75%+ Attendance & Capstone Gate is met
export async function POST(req: Request) {
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

    await connectDB();

    const enr: any = await Enrollment.findOne({
      student: s.id,
      course: courseId,
      status: "APPROVED",
    }).lean();
    if (!enr) {
      return NextResponse.json({ error: "Active enrollment not found" }, { status: 403 });
    }
    if (enr.accessLocked) {
      return NextResponse.json(
        { error: "Course access is locked due to an overdue fee installment." },
        { status: 403 }
      );
    }

    const existing = await Certificate.findOne({ student: s.id, course: courseId }).lean();
    if (existing) {
      return NextResponse.json(existing);
    }

    const [course, attCount, assignments, submissions, quizzes, quizSubs]: any[] =
      await Promise.all([
        Course.findById(courseId).select("title curriculum").lean(),
        Attendance.countDocuments({ student: s.id, course: courseId }),
        Assignment.find({ course: courseId }).select("_id course maxScore").lean(),
        Submission.find({ student: s.id, course: courseId }).lean(),
        Quiz.find({ course: courseId }).select("_id course").lean(),
        QuizSubmission.find({ student: s.id, course: courseId }).lean(),
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

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: `Certificate locked until requirements are met: ${eligibility.missingReasons.join("; ")}`,
          eligibility,
        },
        { status: 400 }
      );
    }

    const cert = await Certificate.create({
      student: s.id,
      course: courseId,
      issuedAt: new Date(),
      certificateId: `CERT-${new Date().getFullYear()}-${code()}`,
      attendancePct: eligibility.attendancePct,
      homeworkAvg: eligibility.homeworkAvg ?? undefined,
      quizScore: eligibility.bestQuizScore ?? undefined,
      customNote: `Graduated via IT SkillCore Verified Merit Gate · ${eligibility.attendancePct}% Attendance`,
    });

    return NextResponse.json(cert, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
