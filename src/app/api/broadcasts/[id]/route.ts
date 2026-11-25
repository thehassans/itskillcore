import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Broadcast from "@/models/Broadcast";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  const deleted = await Broadcast.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
