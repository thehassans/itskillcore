import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Blog } from "@/models/Content";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  await connectDB();
  const posts = await Blog.find().sort({ publishedAt: -1 }).lean();
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const slug = slugify(body.title ?? "");
  if (!slug) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const post = await Blog.create({ ...body, slug });
  return NextResponse.json(post, { status: 201 });
}
