import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import LeaveRequest from "@/models/LeaveRequest";
import "@/models/User";
import "@/models/Course";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const status = new URL(req.url).searchParams.get("status");
  const filter: any = {};

  if (session.role === "ADMIN") {
    // unrestricted
  } else if (session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    filter.course = { $in: scope || [] };
  } else {
    filter.student = session.id;
  }

  if (status && status !== "ALL") filter.status = status;

  const list = await LeaveRequest.find(filter)
    .populate("student", "name email")
    .populate("course", "title batchCode slug")
    .sort({ status: 1, createdAt: -1 })
    .lean();

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { courseId, dateKey, reason, makeupSummary = "" } = body;

  if (!courseId || !dateKey || !reason?.trim()) {
    return NextResponse.json(
      { error: "courseId, missed dateKey, and reason are required" },
      { status: 400 }
    );
  }

  const doc = await LeaveRequest.findOneAndUpdate(
    { student: session.id, course: courseId, dateKey },
    {
      $set: {
        reason: reason.trim(),
        makeupSummary: makeupSummary.trim(),
        status: "PENDING",
        reviewNote: "",
      },
    },
    { upsert: true, new: true }
  )
    .populate("course", "title")
    .lean();

  return NextResponse.json(doc, { status: 201 });
}
