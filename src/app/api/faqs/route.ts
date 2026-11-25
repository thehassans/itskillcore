import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FAQ } from "@/models/Content";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await connectDB();
  const faqs = await FAQ.find().sort({ order: 1 }).lean();
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  if (!body.question || !body.answer) {
    return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
  }

  const faq = await FAQ.create(body);
  return NextResponse.json(faq, { status: 201 });
}
