import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import LiveAttendanceTool from "@/components/shared/LiveAttendanceTool";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  await connectDB();
  const courses: any[] = plain(
    await Course.find().select("title batchCode").sort({ createdAt: -1 }).lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Live Attendance &amp; Roll-Call PIN</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Issue verified live check-in PINs across cohorts or manually confirm student attendance.
        </p>
      </div>
      <LiveAttendanceTool courses={courses} />
    </div>
  );
}
