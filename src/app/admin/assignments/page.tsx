import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import Submission from "@/models/Submission";
import Course from "@/models/Course";
import AssignmentManager from "@/components/admin/AssignmentManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAssignmentsPage() {
  await connectDB();

  const [rawAssignments, courses]: any[] = await Promise.all([
    Assignment.find().sort({ dueDate: 1 }).populate("course", "title").lean(),
    Course.find().select("title").lean(),
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
