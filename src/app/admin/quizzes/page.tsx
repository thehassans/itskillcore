import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { plain } from "@/lib/utils";
import QuizManager from "@/components/admin/QuizManager";

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  await connectDB();
  const courses = plain(await Course.find().select("_id title").sort({ createdAt: -1 }).lean());
  return <QuizManager courses={courses} />;
}
