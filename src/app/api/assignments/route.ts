import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Enrollment from "@/models/Enrollment";
import { getSession, requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId");

  if (session.role === "ADMIN" || session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    const filter: any = {};
    if (scope !== null) filter.course = { $in: scope };
    if (courseId) {
      if (scope !== null && !scope.includes(courseId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      filter.course = courseId;
    }
    const assignments = await Assignment.find(filter)
      .sort({ dueDate: 1 })
      .populate("course", "title")
      .lean();

    // Attach submission counts
    const withCounts = await Promise.all(
      assignments.map(async (a: any) => {
        const subCount = await Submission.countDocuments({ assignment: a._id });
        const gradedCount = await Submission.countDocuments({
          assignment: a._id,
          status: "GRADED",
        });
        return { ...a, submissionCount: subCount, gradedCount };
      })
    );
    return NextResponse.json(withCounts);
  }

  // Student: find their approved courses
  const enrollments = await Enrollment.find({
    student: session.id,
    status: "APPROVED",
  })
    .select("course")
    .lean();
  const allowedCourseIds = enrollments.map((e: any) => e.course);

  const filter: any = { course: { $in: allowedCourseIds } };
  if (courseId && allowedCourseIds.map(String).includes(courseId)) {
    filter.course = courseId;
  }

  const assignments = await Assignment.find(filter)
    .sort({ dueDate: 1 })
    .populate("course", "title")
    .lean();

  // Attach student's own submission status if submitted
  const withMySubmissions = await Promise.all(
    assignments.map(async (a: any) => {
      const mySubmission = await Submission.findOne({
        assignment: a._id,
        student: session.id,
      }).lean();
      return { ...a, mySubmission };
    })
  );

  return NextResponse.json(withMySubmissions);
}

export async function POST(req: NextRequest) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(body.courseId))) {
    return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
  }

  if (!body.title || !body.description || !body.courseId || !body.dueDate) {
    return NextResponse.json(
      { error: "Title, description, course, and due date are required" },
      { status: 400 }
    );
  }

  const assignment = await Assignment.create({
    course: body.courseId,
    lessonTitle: body.lessonTitle || "",
    title: body.title.trim(),
    description: body.description.trim(),
    weekNumber: Number(body.weekNumber) || 1,
    dueDate: new Date(body.dueDate),
    maxScore: Number(body.maxScore) || 100,
    attachments: body.attachments || [],
  });

  return NextResponse.json(assignment, { status: 201 });
}
