import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Course from "@/models/Course";
import AssignmentManager from "@/components/admin/AssignmentManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorAssignmentsPage() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const filter = scope !== null ? { course: { $in: scope } } : {};
  const cFilter = scope !== null ? { _id: { $in: scope } } : {};

  const [rawAssignments, courses]: any[] = await Promise.all([
    Assignment.find(filter).sort({ dueDate: 1 }).populate("course", "title").lean(),
    Course.find(cFilter).select("title").lean(),
  ]).then(plain);

  const assignments = await Promise.all(
    rawAssignments.map(async (a: any) => {
      const submissionCount = await Submission.countDocuments({ assignment: a._id });
      const gradedCount = await Submission.countDocuments({ assignment: a._id, status: "GRADED" });
      return { ...a, submissionCount, gradedCount };
    })
  );

  return <AssignmentManager assignments={assignments} courses={courses} />;
}
