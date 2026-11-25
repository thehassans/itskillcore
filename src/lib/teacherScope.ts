import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";
import type { Session } from "@/lib/auth";

/** Returns null for ADMIN (unrestricted) or string[] of course IDs owned by INSTRUCTOR. */
export async function getTeacherCourseIds(s: Session): Promise<string[] | null> {
  if (s.role === "ADMIN") return null;
  if (s.role !== "INSTRUCTOR") return [];
  await connectDB();
  const [user, directCourses]: any[] = await Promise.all([
    User.findById(s.id).select("assignedCourses").lean(),
    Course.find({ assignedInstructor: s.id }).select("_id").lean(),
  ]);
  const ids = new Set<string>();
  for (const cid of user?.assignedCourses || []) ids.add(String(cid));
  for (const c of directCourses || []) ids.add(String(c._id));
  return Array.from(ids);
}
