import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Broadcast from "@/models/Broadcast";
import Enrollment from "@/models/Enrollment";
import { getSession, requireAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  if (session.role === "ADMIN") {
    const list = await Broadcast.find()
      .sort({ createdAt: -1 })
      .populate("course", "title")
      .lean();
    return NextResponse.json(list);
  }

  // Student: find their enrolled courses
  const enrollments = await Enrollment.find({ student: session.id, status: "APPROVED" })
    .select("course")
    .lean();
  const courseIds = enrollments.map((e: any) => e.course);

  const list = await Broadcast.find({
    $or: [{ target: "ALL" }, { course: { $in: courseIds } }],
  })
    .sort({ createdAt: -1 })
    .populate("course", "title")
    .lean();

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  if (!body.title || !body.message || !body.linkUrl) {
    return NextResponse.json(
      { error: "Title, message, and link URL are required" },
      { status: 400 }
    );
  }

  const broadcast = await Broadcast.create({
    title: body.title.trim(),
    message: body.message.trim(),
    linkUrl: body.linkUrl.trim(),
    linkLabel: body.linkLabel?.trim() || "Open Broadcast Link",
    target: body.target === "COURSE" ? "COURSE" : "ALL",
    course: body.target === "COURSE" && body.courseId ? body.courseId : undefined,
    senderName: admin.name || "IT SkillCore Administration",
  });

  return NextResponse.json(broadcast, { status: 201 });
}
