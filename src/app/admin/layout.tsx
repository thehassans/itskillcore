import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  if (!s) redirect("/login?next=/admin");
  return <AdminShell name={s.name}>{children}</AdminShell>;
}
