import { connectDB } from "@/lib/db";
import LeaveRequest from "@/models/LeaveRequest";
import "@/models/User";
import "@/models/Course";
import LeaveManager from "@/components/shared/LeaveManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLeavesPage() {
  await connectDB();
  const leaves: any[] = plain(
    await LeaveRequest.find()
      .populate("student", "name email")
      .populate("course", "title batchCode")
      .sort({ status: 1, createdAt: -1 })
      .lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Leave Requests &amp; Make-Up Credit</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Approve excused absences with make-up recording verification to automatically credit student attendance.
        </p>
      </div>
      <LeaveManager initialLeaves={leaves} />
    </div>
  );
}
