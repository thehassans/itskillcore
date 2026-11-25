import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import Course from "@/models/Course";
import { escapeRegex, slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const session = await getSession();
    const filter: Record<string, unknown> = session?.role === "ADMIN" ? {} : { isPublished: true };
    const q = sp.get("q"), category = sp.get("category"), level = sp.get("level");
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };
    if (category) filter.category = category;
    if (level) filter.level = level;
    const courses = await Course.find(filter).select("-curriculum.lessons.videoUrl -curriculum.lessons.content")
      .sort({ createdAt: -1 }).lean();
    return NextResponse.json(courses);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    await connectDB();
    const slug = body.slug ? slugify(body.slug) : slugify(body.title ?? "");
    if (await Course.exists({ slug })) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    const course = await Course.create({ ...body, slug });
    return NextResponse.json(course, { status: 201 });
  } catch (e: any) {
    console.error(e);
    const status = e?.name === "ValidationError" ? 400 : 500;
    return NextResponse.json({ error: status === 400 ? e.message : "Server error" }, { status });
  }
}
