import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Certificate from "@/models/Certificate";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const cert = await Certificate.findByIdAndUpdate(
    id,
    {
      isRevoked: Boolean(body.isRevoked),
      revokedReason: body.isRevoked ? body.revokedReason || "Revoked by Academic Administration" : "",
    },
    { new: true }
  );
  return cert ? NextResponse.json(cert) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  await Certificate.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
