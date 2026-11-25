import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import AttendanceSession from "@/models/AttendanceSession";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const courseId = new URL(req.url).searchParams.get("courseId");
  const filter: any = {};

  if (session.role === "ADMIN") {
    if (courseId) filter.course = courseId;
  } else if (session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    filter.course = courseId && scope?.includes(courseId) ? courseId : { $in: scope || [] };
  } else {
    filter.student = session.id;
    if (courseId) filter.course = courseId;
  }

  const records = await Attendance.find(filter)
    .populate("course", "title batchCode")
    .populate("student", "name email")
    .sort({ joinedAt: -1 })
    .lean();

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (!body.courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  // Admin/Instructor direct student roll-call marking
  if ((session.role === "ADMIN" || session.role === "INSTRUCTOR") && body.studentId) {
    const scope = await getTeacherCourseIds(session);
    if (scope !== null && !scope.includes(String(body.courseId))) {
      return NextResponse.json({ error: "Course not assigned to instructor" }, { status: 403 });
    }
    const dateKey = body.dateKey || new Date().toISOString().slice(0, 10);
    await Attendance.updateOne(
      { student: body.studentId, course: body.courseId, dateKey },
      {
        $set: {
          lessonTitle: body.lessonTitle || "Instructor Roll-Call",
          verificationMethod: "INSTRUCTOR_MARKED",
          verifiedByInstructor: true,
          joinedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true, verifiedByInstructor: true });
  }

  const dateKey = new Date().toISOString().split("T")[0];
  const submittedCode = String(body.code || "").trim().toUpperCase();

  let verificationMethod: "LINK_CLICK" | "LIVE_PIN" = "LINK_CLICK";
  let verifiedByInstructor = false;

  if (submittedCode) {
    const liveSession: any = await AttendanceSession.findOne({
      course: body.courseId,
      dateKey,
    }).lean();

    if (!liveSession) {
      return NextResponse.json(
        { error: "No active live class check-in PIN exists for today yet." },
        { status: 404 }
      );
    }
    if (new Date(liveSession.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Today's live check-in PIN has expired." },
        { status: 400 }
      );
    }
    if (liveSession.code !== submittedCode) {
      return NextResponse.json(
        { error: "Invalid Live Class PIN. Please check the PIN shared by your instructor." },
        { status: 400 }
      );
    }

    verificationMethod = "LIVE_PIN";
    verifiedByInstructor = true;
  }

  // Upsert: if student enters a valid LIVE_PIN after clicking join earlier, upgrade verificationMethod!
  if (verifiedByInstructor) {
    await Attendance.updateOne(
      { student: session.id, course: body.courseId, dateKey },
      {
        $set: {
          lessonTitle: body.lessonTitle || "Live Cohort Class",
          verificationMethod,
          verifiedByInstructor: true,
          checkInCode: submittedCode,
        },
        $setOnInsert: {
          joinedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } else {
    await Attendance.updateOne(
      { student: session.id, course: body.courseId, dateKey },
      {
        $setOnInsert: {
          student: session.id,
          course: body.courseId,
          lessonTitle: body.lessonTitle || "Live Cohort Class",
          dateKey,
          verificationMethod: "LINK_CLICK",
          verifiedByInstructor: false,
          joinedAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const [totalAttended, courseAttended] = await Promise.all([
    Attendance.countDocuments({ student: session.id }),
    Attendance.countDocuments({ student: session.id, course: body.courseId }),
  ]);

  return NextResponse.json({
    ok: true,
    totalAttended,
    courseAttended,
    verificationMethod,
    verifiedByInstructor,
  });
}
