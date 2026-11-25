import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";
export type Session = { id: string; role: Role; name: string; email: string };
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const COOKIE = "lms_session";

export async function signSession(s: Session) {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    return (await jwtVerify(token, secret())).payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession() {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

export async function requireAdmin() {
  const s = await getSession();
  return s?.role === "ADMIN" ? s : null;
}

export async function requireTeacher() {
  const s = await getSession();
  return s && (s.role === "ADMIN" || s.role === "INSTRUCTOR") ? s : null;
}

export async function setSessionCookie(s: Session) {
  (await cookies()).set(COOKIE, await signSession(s), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
