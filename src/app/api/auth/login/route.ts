import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await connectDB();
    const user: any = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(String(password), user.password)))
      return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
    if (user.isSuspended)
      return NextResponse.json(
        { error: "Account temporarily suspended. Please contact admissions@itskillcore.pk." },
        { status: 403 }
      );
    await setSessionCookie({ id: String(user._id), role: user.role, name: user.name, email: user.email });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
