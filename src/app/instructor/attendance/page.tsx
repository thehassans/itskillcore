import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import Course from "@/models/Course";
import LiveAttendanceTool from "@/components/shared/LiveAttendanceTool";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorAttendancePage() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const courses: any[] = plain(
    await Course.find(scope !== null ? { _id: { $in: scope } } : {})
      .select("title batchCode")
      .lean()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Live Attendance &amp; Check-In PIN</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Generate a session PIN during Google Meet so student attendance is cryptographically verified rather than link-click only.
        </p>
      </div>
      <LiveAttendanceTool courses={courses} />
    </div>
  );
}
