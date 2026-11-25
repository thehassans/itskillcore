import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(_: Request, { params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  await connectDB();
  const c: any = await Certificate.findOne({ certificateId: certId })
    .populate("student", "name").populate("course", "title").lean();
  if (!c) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({ valid: true, student: c.student.name, course: c.course.title, issuedAt: c.issuedAt });
}
