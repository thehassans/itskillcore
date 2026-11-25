import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

export interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#fbfdfb] text-slate-900 py-16 sm:py-24 px-0 overflow-hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-container flex-col items-center gap-6 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-3 px-4 sm:gap-4 max-w-3xl">
          <div className="eyebrow">
            <Star size={12} className="fill-[#C9FA52] text-[#063F38]" /> Verified Student Reviews Across Pakistan
          </div>
          <h2 className="section-title text-slate-900 sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="text-base text-slate-600 sm:text-lg max-w-2xl">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4">
          <div className="group flex overflow-hidden p-2 [--gap:1.25rem] [gap:var(--gap)] flex-row [--duration:85s]">
            {[0, 1].map((track) => (
              <div
                key={track}
                aria-hidden={track === 1}
                className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]"
              >
                {testimonials.map((testimonial, i) => (
                  <TestimonialCard key={`${track}-${i}`} {...testimonial} />
                ))}
              </div>
            ))}
          </div>

          {/* Clean fade edges into the background */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 md:w-48 bg-gradient-to-r from-[#fbfdfb] to-transparent sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 md:w-48 bg-gradient-to-l from-[#fbfdfb] to-transparent sm:block" />
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
