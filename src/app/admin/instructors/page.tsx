import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import InstructorManager from "@/components/admin/InstructorManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
  await connectDB();
  const [instructors, courses]: any[] = await Promise.all([
    User.find({ role: "INSTRUCTOR" })
      .populate("assignedCourses", "title batchCode slug")
      .sort({ createdAt: -1 })
      .lean(),
    Course.find().select("title batchCode").lean(),
  ]).then(plain);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-2xl text-slate-900">Instructors &amp; Course Assignments</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Create dedicated instructor tenant logins and assign cohorts. Instructors can manage live attendance PINs, grading, Q&amp;A, and leave credits strictly for their assigned courses.
        </p>
      </div>
      <InstructorManager initialInstructors={instructors} courses={courses} />
    </div>
  );
}
