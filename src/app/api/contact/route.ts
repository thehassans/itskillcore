import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/Content";

const schema = z.object({
  name: z.string().min(2), email: z.string().email(),
  subject: z.string().min(2), message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Please fill in every field" }, { status: 400 });
    await connectDB();
    await ContactMessage.create(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
