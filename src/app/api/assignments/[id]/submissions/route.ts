import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const assignment: any = await Assignment.findById(id).lean();
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 });

  const body = await req.json();
  if (!body.fileUrl) {
    return NextResponse.json({ error: "File upload is required for assignment submission" }, { status: 400 });
  }

  // Upsert submission (if already submitted, update with new file & timestamp)
  const existing = await Submission.findOne({
    assignment: id,
    student: session.id,
  });

  if (existing) {
    existing.fileUrl = body.fileUrl;
    existing.fileName = body.fileName || "Submitted_Work";
    existing.fileType = body.fileType || "document";
    existing.studentComment = body.studentComment || "";
    existing.status = "SUBMITTED";
    existing.submittedAt = new Date();
    await existing.save();
    return NextResponse.json(existing, { status: 200 });
  }

  const submission = await Submission.create({
    assignment: id,
    student: session.id,
    course: assignment.course,
    fileUrl: body.fileUrl,
    fileName: body.fileName || "Submitted_Work",
    fileType: body.fileType || "document",
    studentComment: body.studentComment || "",
    status: "SUBMITTED",
  });

  return NextResponse.json(submission, { status: 201 });
}
