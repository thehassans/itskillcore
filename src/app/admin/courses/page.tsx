import Link from "next/link";
import { Plus } from "lucide-react";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import CourseRow from "@/components/admin/CourseRow";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  await connectDB();
  const courses: any[] = plain(await Course.find().sort({ createdAt: -1 }).lean());
  return (
    <>
      <div className="mb-6 flex items-center justify-between"><h1 className="h-display text-2xl">Courses</h1><Link href="/admin/courses/new" className="btn-primary"><Plus size={16} />Add new course</Link></div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">{["Course", "Price", "Status", ""].map((h) => <th key={h} className="p-4 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{courses.map((c) => <CourseRow key={c._id} c={c} />)}</tbody>
        </table>
        {courses.length === 0 && <p className="p-10 text-center text-slate-400">No courses yet. Create your first one.</p>}
      </div>
    </>
  );
}
