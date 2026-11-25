import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import InstructorShell from "@/components/instructor/InstructorShell";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s || (s.role !== "INSTRUCTOR" && s.role !== "ADMIN")) {
    redirect("/login?next=/instructor");
  }
  return <InstructorShell name={s.name}>{children}</InstructorShell>;
}
