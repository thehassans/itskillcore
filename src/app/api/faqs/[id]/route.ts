import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FAQ } from "@/models/Content";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const faq = await FAQ.findByIdAndUpdate(id, body, { new: true }).lean();
  if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(faq);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const faq = await FAQ.findByIdAndDelete(id);
  if (!faq) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
