import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ContactMessage } from "@/models/Content";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const update: Record<string, unknown> = {};
    if (body.status && ["NEW", "IN_PROGRESS", "RESOLVED"].includes(body.status)) {
      update.status = body.status;
      update.resolvedAt = body.status === "RESOLVED" ? new Date() : null;
    }
    if (typeof body.adminNotes === "string") {
      update.adminNotes = body.adminNotes;
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  const deleted = await ContactMessage.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
