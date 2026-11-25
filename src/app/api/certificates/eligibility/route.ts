import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Attendance from "@/models/Attendance";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Quiz from "@/models/Quiz";
import QuizSubmission from "@/models/QuizSubmission";
import Certificate from "@/models/Certificate";
import { evaluateEligibility } from "@/lib/academic";
import { plain } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const reqStudentId = searchParams.get("studentId");
  const reqCourseId = searchParams.get("courseId");

  const targetStudentId =
    session.role === "ADMIN" && reqStudentId ? reqStudentId : session.id;

  // Single student + course lookup (used in Admin Certificate Studio & Claim check)
  if (reqCourseId) {
    const [course, attCount, assignments, submissions, quizzes, quizSubs, existingCert]: any[] =
      await Promise.all([
        Course.findById(reqCourseId).select("title curriculum").lean(),
        Attendance.countDocuments({ student: targetStudentId, course: reqCourseId }),
        Assignment.find({ course: reqCourseId }).select("_id course maxScore").lean(),
        Submission.find({ student: targetStudentId, course: reqCourseId }).lean(),
        Quiz.find({ course: reqCourseId }).select("_id course").lean(),
        QuizSubmission.find({ student: targetStudentId, course: reqCourseId }).lean(),
        Certificate.findOne({ student: targetStudentId, course: reqCourseId }).lean(),
      ]).then((res) => res.map((x: any) => (typeof x === "number" ? x : plain(x))));

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    const result = evaluateEligibility({
      course,
      attendedCount: attCount,
      assignments,
      submissions,
      quizzes,
      quizSubmissions: quizSubs,
    });
    return NextResponse.json({ ...result, certificateId: existingCert?.certificateId || null });
  }

  // All approved courses for the target student
  const [enr, attendanceList, assignments, submissions, quizzes, quizSubs, certs]: any[] =
    await Promise.all([
      Enrollment.find({ student: targetStudentId, status: "APPROVED" })
        .populate("course", "title slug curriculum")
        .lean(),
      Attendance.find({ student: targetStudentId }).select("course").lean(),
      Assignment.find().select("_id course maxScore").lean(),
      Submission.find({ student: targetStudentId }).lean(),
      Quiz.find().select("_id course").lean(),
      QuizSubmission.find({ student: targetStudentId }).lean(),
      Certificate.find({ student: targetStudentId }).select("course certificateId").lean(),
    ]).then(plain);

  const list = enr
    .filter((e: any) => e.course)
    .map((e: any) => {
      const cid = String(e.course._id);
      const attendedCount = attendanceList.filter((a: any) => String(a.course) === cid).length;
      const eligibility = evaluateEligibility({
        course: e.course,
        attendedCount,
        assignments,
        submissions,
        quizzes,
        quizSubmissions: quizSubs,
      });
      const existing = certs.find((c: any) => String(c.course) === cid);
      return {
        ...eligibility,
        courseSlug: e.course.slug,
        accessLocked: Boolean(e.accessLocked),
        certificateId: existing?.certificateId || null,
      };
    });

  return NextResponse.json(list);
}
