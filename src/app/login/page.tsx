"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const pakistaniStudentTestimonials: Testimonial[] = [
  {
    avatarSrc: "/images/pk-bilal.jpg",
    name: "Muhammad Bilal",
    handle: "FAST-NUCES · Full-Stack Engineer at Systems Ltd",
    text: "The 3-Month live cohort schedule with 5 days a week classes on Google Meet made all the difference. Daily code reviews and lecture notes are unmatched.",
  },
  {
    avatarSrc: "/images/pk-ayesha.jpg",
    name: "Ayesha Siddiqui",
    handle: "Karachi · UI/UX Designer at DevSinc",
    text: "The presentation slide decks and Figma project submissions gave me the confidence to ace my design agency interviews in Lahore.",
  },
  {
    avatarSrc: "/images/pk-hamza.jpg",
    name: "Hamza Tariq",
    handle: "NUST · Data Scientist at Jazz Islamabad",
    text: "Live instructor walkthroughs on real-world datasets and homework grading gave me hands-on skills I use daily in production.",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setBusy(false);

      if (!res.ok) {
        return toast.error(data.error ?? "Invalid email or password");
      }

      toast.success("Welcome back to IT SkillCore!");
      router.push(
        next ??
          (data.role === "ADMIN"
            ? "/admin"
            : data.role === "INSTRUCTOR"
            ? "/instructor"
            : "/dashboard")
      );
      router.refresh();
    } catch (err) {
      setBusy(false);
      toast.error("Network error. Please try again.");
    }
  }

  return (
    <SignInPage
      title="Welcome back"
      description="Sign in to access your live cohorts, slides, homework submissions, and verified certificates."
      heroImageSrc="/images/hero.jpg"
      testimonials={pakistaniStudentTestimonials}
      onSignIn={handleSignIn}
      busy={busy}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfdfb] text-slate-400">
          Loading IT SkillCore Portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
