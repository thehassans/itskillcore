import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTeacherCourseIds } from "@/lib/teacherScope";
import Course from "@/models/Course";
import QuizManager from "@/components/admin/QuizManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorQuizzesPage() {
  const s = (await getSession())!;
  await connectDB();
  const scope = await getTeacherCourseIds(s);
  const cFilter = scope !== null ? { _id: { $in: scope } } : {};

  const courses: any = plain(await Course.find(cFilter).select("title").lean());

  return <QuizManager courses={courses} />;
}
