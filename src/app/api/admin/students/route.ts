import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  return NextResponse.json(await User.find({ role: "STUDENT" }).sort({ createdAt: -1 }).lean());
}

// Create a student with a custom password and instantly assign courses (APPROVED).
export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { name, email, password, courseIds = [] } = await req.json();
    if (!name || !email || !password || password.length < 8)
      return NextResponse.json({ error: "Name, email and a password of 8+ characters are required" }, { status: 400 });
    await connectDB();
    if (await User.exists({ email: String(email).toLowerCase() }))
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    if (courseIds.length)
      await Enrollment.insertMany(courseIds.map((c: string) => ({
        student: user._id, course: c, status: "APPROVED", paymentReference: "Admin Assigned",
      })));
    return NextResponse.json({ id: user._id, email: user.email }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
