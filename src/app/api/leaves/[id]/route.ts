import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireTeacher } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import LeaveRequest from "@/models/LeaveRequest";
import Attendance from "@/models/Attendance";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const teacher = await requireTeacher();
  if (!teacher) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  if (!["APPROVED", "REJECTED"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const leave: any = await LeaveRequest.findById(id);
  if (!leave) return NextResponse.json({ error: "Leave request not found" }, { status: 404 });

  const scope = await getTeacherCourseIds(teacher);
  if (scope !== null && !scope.includes(String(leave.course))) {
    return NextResponse.json({ error: "Forbidden: Course not assigned to you" }, { status: 403 });
  }

  leave.status = body.status;
  leave.reviewNote = body.reviewNote || "";
  leave.reviewedBy = teacher.id;
  leave.reviewedAt = new Date();
  await leave.save();

  // Grant verified Make-Up Attendance Credit when approved!
  if (body.status === "APPROVED") {
    await Attendance.updateOne(
      { student: leave.student, course: leave.course, dateKey: leave.dateKey },
      {
        $set: {
          lessonTitle: `Make-Up Credit (${leave.dateKey})`,
          verificationMethod: "MAKEUP_CREDIT",
          verifiedByInstructor: true,
          joinedAt: new Date(`${leave.dateKey}T15:00:00Z`),
        },
      },
      { upsert: true }
    );
  }

  return NextResponse.json(leave);
}
