import Link from "next/link";
import { Menu, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";

const links = [
  ["Programs", "/courses"],
  ["Methodology", "/#how"],
  ["Verify Credential", "/verify"],
  ["Journal", "/blog"],
  ["FAQ", "/#faq"],
  ["Admissions", "/#contact"],
];

export default async function Navbar() {
  const s = await getSession();
  const cta = s
    ? [
        s.role === "ADMIN" ? "Admin Console" : "Student Portal",
        s.role === "ADMIN" ? "/admin" : "/dashboard",
      ]
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
      <nav className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center shrink-0 transition hover:opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/it-skillcore.svg"
            alt="IT SkillCore"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map(([l, h]) => (
            <li key={l}>
              <Link
                href={h}
                className="rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-[#F4FFE2] hover:text-[#063F38]"
              >
                {l}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          {cta ? (
            <Link href={cta[1]} className="btn-primary btn-sm !px-4 !py-2">
              {cta[0]} <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm hidden sm:inline-flex !px-3.5 !py-2">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary btn-sm !px-4 !py-2">
                Apply Now <ArrowRight size={14} />
              </Link>
            </>
          )}

          <details className="relative lg:hidden">
            <summary className="btn-outline btn-sm list-none !p-2 [&::-webkit-details-marker]:hidden cursor-pointer">
              <Menu size={18} />
            </summary>
            <ul className="card absolute right-0 mt-2 w-56 p-2 shadow-xl space-y-0.5">
              {links.map(([l, h]) => (
                <li key={l}>
                  <Link
                    href={h}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[#F4FFE2] hover:text-[#063F38]"
                  >
                    {l}
                  </Link>
                </li>
              ))}
              {!cta && (
                <li className="border-t border-slate-100 pt-1 mt-1">
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#063F38] hover:bg-[#F4FFE2]"
                  >
                    Student Sign In
                  </Link>
                </li>
              )}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
