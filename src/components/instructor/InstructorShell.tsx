"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  KeyRound,
  FileCheck,
  CheckSquare,
  MessageSquare,
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ExternalLink,
} from "lucide-react";

const nav = [
  [LayoutDashboard, "Overview", "/instructor"],
  [KeyRound, "Live Attendance & PIN", "/instructor/attendance"],
  [FileCheck, "Homework & Grading", "/instructor/assignments"],
  [CheckSquare, "Quizzes & Results", "/instructor/quizzes"],
  [MessageSquare, "Lesson Q&A", "/instructor/qa"],
  [CalendarCheck, "Leave & Make-Up", "/instructor/leaves"],
] as const;

export default function InstructorShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-4">
          {collapsed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/images/it-skillcore-mark.svg" alt="IT SkillCore" className="h-8 w-8 object-contain" />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/images/it-skillcore.svg" alt="IT SkillCore" className="h-7 w-auto object-contain" />
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
          {nav.map(([Icon, label, href]) => {
            const on = href === "/instructor" ? path === href : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
                  on ? "bg-[#063F38] text-white" : "text-slate-600 hover:bg-[#F4FFE2]/70 hover:text-[#063F38]"
                }`}
              >
                <Icon size={17} className={`shrink-0 ${on ? "text-[#C9FA52]" : "text-slate-400"}`} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-0.5 border-t border-slate-200 p-2.5 text-[13px]">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-[#F4FFE2]/70 hover:text-[#063F38] font-medium"
          >
            <ExternalLink size={17} />
            {!collapsed && "Public Website"}
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-700 font-medium"
          >
            <LogOut size={17} />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="btn-ghost !px-2 text-slate-500 hover:text-[#063F38]"
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Instructor Tenant Workspace
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <span className="rounded-md bg-[#C9FA52]/50 border border-[#063F38]/15 px-2 py-0.5 font-bold text-[#063F38]">
              INSTRUCTOR
            </span>
            <span className="font-semibold text-slate-900">{name}</span>
          </div>
        </header>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
