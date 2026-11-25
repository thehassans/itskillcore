import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import LeaveRequest from "@/models/LeaveRequest";
import "@/models/User";
import "@/models/Course";
import LeaveManager from "@/components/shared/LeaveManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorLeavesPage() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const filter = scope !== null ? { course: { $in: scope } } : {};

  const leaves: any[] = plain(
    await LeaveRequest.find(filter)
      .populate("student", "name email")
      .populate("course", "title batchCode")
      .sort({ status: 1, createdAt: -1 })
      .lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Leave &amp; Make-Up Attendance Credits</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review student absence excuses and grant verified make-up recording credit toward their 75% Attendance Gate.
        </p>
      </div>
      <LeaveManager initialLeaves={leaves} />
    </div>
  );
}
