import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Course from "@/models/Course";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const list = await User.find({ role: "INSTRUCTOR" })
    .populate("assignedCourses", "title batchCode slug")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { name, email, password, title = "Senior Cohort Instructor", bio = "", courseIds = [] } =
      await req.json();
    if (!name || !email || !password || String(password).length < 8) {
      return NextResponse.json(
        { error: "Name, email, and an 8+ character password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    if (await User.exists({ email: String(email).toLowerCase() })) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const instructor = await User.create({
      name,
      email,
      password: await bcrypt.hash(String(password), 12),
      role: "INSTRUCTOR",
      title,
      bio,
      assignedCourses: courseIds,
    });

    if (Array.isArray(courseIds) && courseIds.length > 0) {
      await Course.updateMany(
        { _id: { $in: courseIds } },
        {
          $set: {
            assignedInstructor: instructor._id,
            "instructor.name": instructor.name,
            "instructor.title": instructor.title || title,
          },
        }
      );
    }

    return NextResponse.json({ id: instructor._id, email: instructor.email }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
