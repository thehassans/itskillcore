import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ContactMessage } from "@/models/Content";

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const status = new URL(req.url).searchParams.get("status");
  const filter: Record<string, unknown> = status && status !== "ALL" ? { status } : {};
  const list = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(list);
}
