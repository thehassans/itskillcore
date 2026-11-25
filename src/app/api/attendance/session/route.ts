import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { connectDB } from "@/lib/db";
import { getSession, requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import AttendanceSession from "@/models/AttendanceSession";
import Attendance from "@/models/Attendance";
import "@/models/User";
import "@/models/Course";

const pinCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const courseId = new URL(req.url).searchParams.get("courseId");
  const dateKey = new URL(req.url).searchParams.get("dateKey") || new Date().toISOString().slice(0, 10);

  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  const activeSession: any = await AttendanceSession.findOne({ course: courseId, dateKey }).lean();

  if (session.role === "ADMIN" || session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    if (scope !== null && !scope.includes(courseId)) {
      return NextResponse.json({ error: "Course not assigned to instructor" }, { status: 403 });
    }
    const checkIns = await Attendance.find({ course: courseId, dateKey })
      .populate("student", "name email")
      .sort({ joinedAt: -1 })
      .lean();
    return NextResponse.json({ session: activeSession, checkIns });
  }

  const myRecord: any = await Attendance.findOne({
    student: session.id,
    course: courseId,
    dateKey,
  }).lean();

  return NextResponse.json({
    activeSessionAvailable: Boolean(activeSession && new Date(activeSession.expiresAt) > new Date()),
    checkedIn: Boolean(myRecord),
    verifiedByInstructor: Boolean(myRecord?.verifiedByInstructor),
    verificationMethod: myRecord?.verificationMethod || null,
  });
}

export async function POST(req: NextRequest) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const { courseId, lessonTitle = "Live Cohort Class", hoursValid = 3 } = body;
  if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });

  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(courseId))) {
    return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
  }

  const dateKey = new Date().toISOString().slice(0, 10);
  const code = pinCode();
  const expiresAt = new Date(Date.now() + Number(hoursValid) * 3600000);

  const doc = await AttendanceSession.findOneAndUpdate(
    { course: courseId, dateKey },
    {
      $set: {
        instructor: teacher.id,
        lessonTitle,
        code,
        expiresAt,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return NextResponse.json(doc, { status: 201 });
}
