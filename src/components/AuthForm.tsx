"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Star, Eye, EyeOff } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const reg = mode === "register";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error ?? "Something went wrong");
    toast.success(reg ? "Account created!" : "Welcome back!");
    router.push(next ?? (data.role === "ADMIN" ? "/admin" : "/dashboard"));
    router.refresh();
  }
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden flex-col justify-between bg-[#063F38] p-12 text-white lg:flex">
        <Link href="/" className="inline-flex items-center gap-3 w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/it-skillcore-mark.svg" alt="IT SkillCore" className="h-9 w-9 object-contain" />
          <span className="font-[family-name:var(--font-head)] text-lg font-extrabold tracking-tight text-white">
            IT SkillCore
          </span>
        </Link>
        <div className="my-8 overflow-hidden rounded-xl border border-[#0c594f] bg-[#042b26]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero.jpg" alt="IT SkillCore Cohort" className="aspect-[16/10] w-full object-cover" />
        </div>
        <figure className="rounded-xl border border-[#0c594f] bg-[#042b26]/70 p-6 text-white">
          <div className="flex gap-0.5 text-[#C9FA52]">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" />)}</div>
          <blockquote className="mt-3 text-sm leading-relaxed text-[#F4FFE2]">&ldquo;The 3-Month live cohort with 5 days a week classes and daily code reviews got me hired as a Full-Stack Engineer.&rdquo;</blockquote>
          <figcaption className="mt-4 flex items-center gap-3 text-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/pk-bilal.jpg" alt="Muhammad Bilal" className="h-9 w-9 rounded-full object-cover object-top ring-1 ring-[#C9FA52]/40" />
            <div><b className="text-white block">Muhammad Bilal</b><span className="text-[#F4FFE2]/70">Systems Ltd, Lahore</span></div>
          </figcaption>
        </figure>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-10 bg-white">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <Link href="/" className="inline-block mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/it-skillcore.svg" alt="IT SkillCore" className="h-8 w-auto object-contain" />
          </Link>
          <h1 className="h-display text-2xl sm:text-3xl text-slate-900">{reg ? "Create student account" : "Welcome back"}</h1>
          <p className="text-sm text-slate-500">{reg ? "Apply for live 3-month cohorts and start learning today." : "Sign in to continue your learning."}</p>
          {reg && <div><label className="label">Full name</label><input name="name" placeholder="Muhammad Bilal" required className="input" /></div>}
          <div><label className="label">Email</label><input name="email" type="email" placeholder="you@email.com" required className="input" /></div>
          <div><label className="label">Password</label>
            <div className="relative">
              <input name="password" type={show ? "text" : "password"} placeholder="8+ characters" minLength={8} required className="input pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#063F38]">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button disabled={busy} className="btn-primary w-full !py-3">{busy ? "Please wait…" : reg ? "Create account" : "Sign in"}</button>
          <p className="text-center text-sm text-slate-500">{reg ? "Already registered? " : "New here? "}
            <Link className="font-semibold text-[#063F38] hover:text-[#063F38]" href={reg ? "/login" : "/register"}>{reg ? "Sign in" : "Create an account"}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
