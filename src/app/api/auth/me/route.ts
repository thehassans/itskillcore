import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { getSession, setSessionCookie } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const u = await User.findById(s.id).lean();
  return NextResponse.json(u);
}

// Update own profile: { name?, avatar?, currentPassword?, newPassword? }
export async function PATCH(req: Request) {
  try {
    const s = await getSession();
    if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name, avatar, currentPassword, newPassword } = await req.json();
    await connectDB();
    const user = await User.findById(s.id).select("+password");
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name !== undefined) {
      if (String(name).trim().length < 2) return NextResponse.json({ error: "Name is too short" }, { status: 400 });
      user.name = String(name).trim();
    }
    if (avatar !== undefined) user.avatar = avatar;
    if (newPassword) {
      if (String(newPassword).length < 8) return NextResponse.json({ error: "New password must be 8+ characters" }, { status: 400 });
      if (!currentPassword || !(await bcrypt.compare(String(currentPassword), user.password)))
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      user.password = await bcrypt.hash(String(newPassword), 12);
    }
    await user.save();
    await setSessionCookie({ id: s.id, role: user.role, name: user.name, email: user.email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
