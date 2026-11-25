import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface TestimonialAuthor {
  name: string;
  handle: string;
  avatar: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({
  author,
  text,
  href,
  className,
}: TestimonialCardProps) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-slate-200 bg-white",
        "p-5 text-start sm:p-6 shadow-sm",
        "hover:border-emerald-600/40 hover:shadow-md",
        "w-[320px] sm:w-[340px] shrink-0",
        "transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 shrink-0 border-2 border-emerald-600/25 shadow-sm">
          <AvatarImage src={author.avatar} alt={author.name} className="object-cover object-top" />
          <AvatarFallback className="bg-[#F4FFE2] text-[#063F38] font-bold text-xs">
            {author.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-sm font-bold text-slate-900 leading-none">
            {author.name}
          </h3>
          <p className="text-xs text-[#063F38] font-medium mt-1">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        &ldquo;{text}&rdquo;
      </p>
    </Card>
  );
}
