"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Hero4SectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  animatedTexts: string[];
  subtitle: string;
  infoBadgeText: string;
  ctaButtonText: string;
  onCtaClick?: () => void;
  socialProofText: string;
  avatars: {
    src: string;
    alt: string;
    fallback: string;
  }[];
}

const HeroSection = React.forwardRef<HTMLDivElement, Hero4SectionProps>(
  (
    {
      className,
      title,
      animatedTexts,
      subtitle,
      infoBadgeText,
      ctaButtonText,
      onCtaClick,
      socialProofText,
      avatars,
      ...props
    },
    ref
  ) => {
    const [textIndex, setTextIndex] = React.useState(0);
    const [displayText, setDisplayText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
      const fullText = animatedTexts[textIndex] || "";
      let pauseTimer: ReturnType<typeof setTimeout> | undefined;

      if (!isDeleting && displayText === fullText) {
        pauseTimer = setTimeout(() => setIsDeleting(true), 1800);
        return () => clearTimeout(pauseTimer);
      }

      if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % animatedTexts.length);
        return;
      }

      const typingSpeed = isDeleting ? 55 : 105;
      const typeTimer = setTimeout(() => {
        setDisplayText((prev) =>
          isDeleting
            ? prev.substring(0, prev.length - 1)
            : fullText.substring(0, prev.length + 1)
        );
      }, typingSpeed);

      return () => clearTimeout(typeTimer);
    }, [displayText, isDeleting, textIndex, animatedTexts]);

    return (
      <section
        className={cn(
          "container-x flex flex-col items-center justify-center text-center py-16 md:py-24",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="max-w-4xl">
          {/* Main Heading with Typewriter Box */}
          <h2 className="h-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.12]">
            {title}
            <span className="relative mt-3 inline-block px-4 py-1.5">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-600/60 bg-[#F4FFE2]/60"
              />
              <span className="relative inline-block min-h-[1.2em] text-[#063F38]">
                {displayText || "\u00A0"}
                <span className="ml-0.5 animate-pulse text-[#063F38]">|</span>
              </span>
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-5">
          {/* Info Badge */}
          <div className="inline-flex items-center rounded-full border border-[#063F38]/20 bg-[#F4FFE2] px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#063F38]">
            {infoBadgeText}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={onCtaClick}
            className="px-8 py-6 text-base font-bold rounded-xl"
          >
            {ctaButtonText}
          </Button>

          {/* Social Proof */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <Avatar
                  key={index}
                  className="h-10 w-10 border-2 border-white shadow-sm"
                >
                  <AvatarImage
                    src={avatar.src}
                    alt={avatar.alt}
                    className="object-cover object-top"
                  />
                  <AvatarFallback className="bg-[#C9FA52]/40 text-[#063F38] text-xs font-bold">
                    {avatar.fallback}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {socialProofText}
            </p>
          </div>
        </div>
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
