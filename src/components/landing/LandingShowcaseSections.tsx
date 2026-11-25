"use client";

import { useRouter } from "next/navigation";
import { Users, Radio, Award } from "lucide-react";
import HeroCollage from "@/components/ui/hero-section-9";
import { HeroSection as HeroTypewriter } from "@/components/ui/hero-4";

export function LandingCollageShowcase() {
  const router = useRouter();

  return (
    <HeroCollage
      className="bg-white border-y border-emerald-950/5"
      title={
        <>
          A smarter way to master tech{" "}
          <span className="text-[#063F38]">with live mentors</span>
        </>
      }
      subtitle="Skip stale pre-recorded playlists. Learn directly with senior Pakistani engineers and designers 5 days a week via live Google Meet sessions, weekly homework feedback, and real capstone projects."
      actions={[
        {
          text: "Join Next Live Cohort",
          onClick: () => router.push("/register"),
          variant: "default",
        },
        {
          text: "Browse All Bootcamps",
          onClick: () => router.push("/courses"),
          variant: "outline",
        },
      ]}
      stats={[
        {
          value: "8,500+",
          label: "Pakistani learners",
          icon: <Users className="h-5 w-5" />,
        },
        {
          value: "5 Days/Wk",
          label: "Live Google Meet",
          icon: <Radio className="h-5 w-5 text-[#063F38]" />,
        },
        {
          value: "QR Verified",
          label: "Golden-Seal Certs",
          icon: <Award className="h-5 w-5" />,
        },
      ]}
      images={[
        "/images/hero.jpg",
        "/images/instructor.jpg",
        "/images/course-nextjs.jpg",
      ]}
    />
  );
}

export function LandingTypewriterShowcase() {
  const router = useRouter();

  return (
    <div className="w-full bg-[#fbfdfb] border-b border-emerald-950/5">
      <HeroTypewriter
        title={<>Launch your career</>}
        animatedTexts={[
          "in Full-Stack Next.js",
          "in UI/UX Product Design",
          "in Data Science & AI",
          "in Performance Marketing",
        ]}
        subtitle="Build verified production portfolios, track your Mon–Fri live attendance streaks, pay flexibly in monthly installments, and graduate with an employer-verifiable Golden-Seal Credential."
        infoBadgeText="Live 3-Month Cohorts · JazzCash & EasyPaisa Monthly Installments Available"
        ctaButtonText="Explore Bootcamps & Enroll"
        onCtaClick={() => router.push("/courses")}
        socialProofText="Trusted by 8,500+ students across Lahore, Karachi & Islamabad"
        avatars={[
          { src: "/images/pk-bilal.jpg", alt: "Muhammad Bilal", fallback: "MB" },
          { src: "/images/pk-ayesha.jpg", alt: "Ayesha Siddiqui", fallback: "AS" },
          { src: "/images/pk-hamza.jpg", alt: "Hamza Tariq", fallback: "HT" },
          { src: "/images/pk-fatima.jpg", alt: "Fatima Zahra", fallback: "FZ" },
        ]}
      />
    </div>
  );
}
