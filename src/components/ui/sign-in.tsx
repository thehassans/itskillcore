"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2, Quote } from "lucide-react";
import { toast } from "sonner";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  busy?: boolean;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  title = "Sign in to IT SkillCore",
  description = "Access your live cohorts, assignments, fee installments, and certificates.",
  heroImageSrc = "/images/hero.jpg",
  testimonials = [],
  onSignIn,
  onResetPassword,
  busy = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailVal, setEmailVal] = useState("");
  const [passVal, setPassVal] = useState("");

  const fillDemo = (email: string, pass: string) => {
    setEmailVal(email);
    setPassVal(pass);
    toast.success(`Filled ${email}`);
  };

  const featured = testimonials[0];

  return (
    <div className="min-h-screen grid bg-white text-slate-900 lg:grid-cols-[1fr_1.05fr]">
      {/* Left Column: Swiss Minimalist Auth Form */}
      <section className="flex flex-col justify-between p-6 sm:p-10 lg:px-16 lg:py-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center transition hover:opacity-85">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/it-skillcore.svg"
              alt="IT SkillCore"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#063F38] transition"
          >
            <ArrowLeft size={14} /> Home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm py-10 space-y-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#063F38]">
              Portal Authentication
            </p>
            <h1 className="h-display mt-2 text-2xl sm:text-3xl text-slate-900">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>

          <form className="space-y-4" onSubmit={onSignIn}>
            <div>
              <label className="label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0" htmlFor="login-password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onResetPassword
                      ? onResetPassword()
                      : toast.info("Contact admissions@itskillcore.pk to reset your password.")
                  }
                  className="text-xs font-semibold text-[#063F38] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={passVal}
                  onChange={(e) => setPassVal(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-[#063F38] transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full !py-3 text-sm"
            >
              {busy ? "Signing in…" : "Sign in to Workspace"}
            </button>
          </form>

          {/* Discreet Workspace Demo Switcher */}
          <div className="rounded-xl border border-slate-200 bg-[#f8faf9] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("student@lms.com", "Student@123")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-xs transition hover:border-[#063F38]"
              >
                <span className="block font-bold text-[#063F38]">Student</span>
                <span className="block truncate text-[10px] text-slate-400">student@lms.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("instructor@lms.com", "Instructor@123")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-xs transition hover:border-[#063F38]"
              >
                <span className="block font-bold text-[#063F38]">Instructor</span>
                <span className="block truncate text-[10px] text-slate-400">instructor@lms.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin@lms.com", "Admin@123")}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-xs transition hover:border-[#063F38]"
              >
                <span className="block font-bold text-[#063F38]">Admin</span>
                <span className="block truncate text-[10px] text-slate-400">admin@lms.com</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            New to IT SkillCore?{" "}
            <Link href="/register" className="font-bold text-[#063F38] hover:underline">
              Create student account
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} IT SkillCore</span>
          <div className="flex gap-4">
            <Link href="/verify" className="hover:text-[#063F38]">
              Verify Registry
            </Link>
            <Link href="/courses" className="hover:text-[#063F38]">
              Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Right Column: Solid Architectural Pine Panel */}
      <aside className="hidden lg:flex flex-col justify-between bg-[#063F38] p-12 text-white">
        <div className="flex items-center justify-between text-xs font-semibold text-[#F4FFE2]/80">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#C9FA52]" /> Verified Live Cohort Platform
          </span>
          <span className="font-mono text-[#C9FA52]">MON–FRI · 8:00 PM PKT</span>
        </div>

        <div className="space-y-6 my-auto">
          <div className="overflow-hidden rounded-xl border border-[#0c594f] bg-[#042b26]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageSrc}
              alt="IT SkillCore Studio"
              className="aspect-[16/10] w-full object-cover opacity-95"
            />
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#0c594f] rounded-xl border border-[#0c594f] bg-[#042b26]/70 py-4 text-center">
            <div>
              <p className="font-mono text-xl font-bold text-[#C9FA52]">60+</p>
              <p className="text-[11px] text-[#F4FFE2]/70">Live Sessions</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#C9FA52]">75%</p>
              <p className="text-[11px] text-[#F4FFE2]/70">Merit Gate</p>
            </div>
            <div>
              <p className="font-mono text-xl font-bold text-[#C9FA52]">QR</p>
              <p className="text-[11px] text-[#F4FFE2]/70">Verified Certs</p>
            </div>
          </div>

          {featured && (
            <figure className="rounded-xl border border-[#0c594f] bg-[#042b26]/60 p-5 space-y-3">
              <Quote size={16} className="text-[#C9FA52]" />
              <blockquote className="text-sm leading-relaxed text-[#F4FFE2]">
                &ldquo;{featured.text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.avatarSrc}
                  alt={featured.name}
                  className="h-9 w-9 rounded-full object-cover object-top ring-1 ring-[#C9FA52]/40"
                />
                <div className="text-xs">
                  <b className="text-white block">{featured.name}</b>
                  <span className="text-[#F4FFE2]/70">{featured.handle}</span>
                </div>
              </figcaption>
            </figure>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-[#F4FFE2]/70">
          <CheckCircle2 size={14} className="text-[#C9FA52]" />
          <span>Lahore · Karachi · Islamabad · Live Worldwide</span>
        </div>
      </aside>
    </div>
  );
};
