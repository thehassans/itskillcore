import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await connectDB();
    const { name, email, password } = parsed.data;
    if (await User.exists({ email: email.toLowerCase() }))
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    await setSessionCookie({ id: String(user._id), role: "STUDENT", name, email: user.email });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
