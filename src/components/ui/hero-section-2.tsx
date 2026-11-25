"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Globe, Phone, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const InfoIcon = ({ type }: { type: "website" | "phone" | "address" }) => {
  const cls = "mr-2 h-4 w-4 shrink-0 text-[#063F38]";
  if (type === "website") return <Globe className={cls} />;
  if (type === "phone") return <Phone className={cls} />;
  return <MapPin className={cls} />;
};

export interface HeroSectionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  logo?: {
    url: string;
    alt: string;
    text?: string;
  };
  slogan?: string;
  title: React.ReactNode;
  subtitle: string;
  callToAction: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  backgroundImage: string;
  contactInfo: {
    website: string;
    phone: string;
    address: string;
  };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      logo,
      slogan,
      title,
      subtitle,
      callToAction,
      secondaryAction,
      backgroundImage,
      contactInfo,
    },
    ref
  ) => {
    return (
      <motion.section
        ref={ref}
        className={cn(
          "relative flex w-full flex-col overflow-hidden border-b border-slate-200/80 bg-white text-slate-900 md:flex-row",
          className
        )}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Left Side: Editorial Architectural Content */}
        <div className="flex w-full flex-col justify-between p-8 md:w-1/2 md:p-12 lg:w-[58%] lg:px-16 lg:py-16">
          <div>
            {(logo || slogan) && (
              <motion.header className="mb-8" variants={itemVariants}>
                {logo ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.url} alt={logo.alt} className="h-9 w-9 object-contain" />
                    <div>
                      {logo.text && (
                        <p className="font-[family-name:var(--font-head)] text-base font-extrabold tracking-tight text-[#063F38]">
                          {logo.text}
                        </p>
                      )}
                      {slogan && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          {slogan}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="eyebrow">{slogan}</span>
                )}
              </motion.header>
            )}

            <motion.div variants={containerVariants}>
              <motion.h1
                className="h-display text-4xl leading-[1.06] text-slate-900 sm:text-5xl lg:text-[3.35rem]"
                variants={itemVariants}
              >
                {title}
              </motion.h1>

              <motion.div
                className="my-6 h-1 w-16 rounded-full bg-[#C9FA52]"
                variants={itemVariants}
              />

              <motion.p
                className="mb-8 max-w-lg text-base leading-relaxed text-slate-600 sm:text-[17px]"
                variants={itemVariants}
              >
                {subtitle}
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3.5"
                variants={itemVariants}
              >
                <Link href={callToAction.href} className="btn-primary !px-6 !py-3 text-sm">
                  {callToAction.text} <ArrowRight size={16} />
                </Link>
                {secondaryAction && (
                  <Link href={secondaryAction.href} className="btn-outline !px-5 !py-3 text-sm">
                    {secondaryAction.text}
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Institutional Footer Info with Working Links */}
          <motion.footer
            className="mt-12 border-t border-slate-100 pt-6 w-full"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 gap-4 text-xs font-medium text-slate-600 sm:grid-cols-3">
              <Link href="/courses" className="flex items-center hover:text-[#063F38] transition">
                <InfoIcon type="website" />
                <span>{contactInfo.website}</span>
              </Link>
              <a
                href={`tel:${contactInfo.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center hover:text-[#063F38] transition"
              >
                <InfoIcon type="phone" />
                <span>{contactInfo.phone}</span>
              </a>
              <Link href="/#contact" className="flex items-center hover:text-[#063F38] transition">
                <InfoIcon type="address" />
                <span>{contactInfo.address}</span>
              </Link>
            </div>
          </motion.footer>
        </div>

        {/* Right Side: Architectural Diagonal Photography */}
        <motion.div
          className="relative w-full min-h-[340px] bg-cover bg-center md:w-1/2 md:min-h-[540px] lg:w-[42%]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
          initial={{ clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" }}
          animate={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0% 100%)" }}
          transition={{ duration: 0.9, ease: "circOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#063F38]/25 via-transparent to-transparent" />
        </motion.div>
      </motion.section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
export default HeroSection;
