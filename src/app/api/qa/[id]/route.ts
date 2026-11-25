import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import LessonQuestion from "@/models/LessonQuestion";
import "@/models/User";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const q: any = await LessonQuestion.findById(id);
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const isTeacher = session.role === "ADMIN" || session.role === "INSTRUCTOR";
  if (session.role === "INSTRUCTOR") {
    const scope = await getTeacherCourseIds(session);
    if (scope !== null && !scope.includes(String(q.course))) {
      return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
    }
  }

  if (body.message?.trim()) {
    q.replies.push({
      author: session.id,
      authorName: session.name,
      authorRole: isTeacher ? "ADMIN" : "STUDENT",
      message: body.message.trim(),
      attachmentUrl: body.attachmentUrl || "",
      createdAt: new Date(),
    });
    if (isTeacher && body.isResolved === undefined) {
      q.isResolved = true;
    }
  }

  if (typeof body.isResolved === "boolean") {
    if (isTeacher || String(q.student) === session.id) {
      q.isResolved = body.isResolved;
    }
  }

  await q.save();
  const populated = await LessonQuestion.findById(q._id)
    .populate("student", "name email avatar")
    .lean();

  return NextResponse.json(populated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  await LessonQuestion.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
