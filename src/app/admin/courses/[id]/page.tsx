import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import CourseForm from "@/components/admin/CourseForm";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const c = plain(await Course.findById(id).lean());
  if (!c) notFound();
  return <CourseForm course={c} />;
}
