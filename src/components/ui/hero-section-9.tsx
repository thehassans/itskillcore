"use client";

import { motion, type Variants } from "framer-motion";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface StatProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ActionProps {
  text: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  className?: string;
}

interface HeroSectionProps {
  title: React.ReactNode;
  subtitle: string;
  actions: ActionProps[];
  stats: StatProps[];
  images: string[];
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const floatingVariants: Variants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const HeroSection = ({
  title,
  subtitle,
  actions,
  stats,
  images,
  className,
}: HeroSectionProps) => {
  return (
    <section
      className={cn(
        "w-full overflow-hidden bg-[#fbfdfb] py-14 sm:py-20",
        className
      )}
    >
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
        {/* Left Column: Text Content */}
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.h2
            className="h-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-[1.1]"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.p
            className="mt-5 max-w-lg text-base text-slate-600 sm:text-lg leading-relaxed"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-3.5 lg:justify-start"
            variants={itemVariants}
          >
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant}
                size="lg"
                className={action.className}
              >
                {action.text}
              </Button>
            ))}
          </motion.div>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-7 lg:justify-start"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#063F38]/20/70 bg-[#F4FFE2] text-[#063F38]">
                  {stat.icon}
                </div>
                <div className="text-left">
                  <p className="text-lg font-extrabold text-slate-900 leading-none">
                    {stat.value}
                  </p>
                  {stat.label && (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Floating 3-Image Collage */}
        <motion.div
          className="relative h-[380px] w-full sm:h-[470px]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Brand-matched Pine & Lime Decorative Shapes */}
          <motion.div
            className="absolute -top-3 left-1/4 h-16 w-16 rounded-full bg-[#063F38]/15"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-2 right-1/4 h-12 w-12 rounded-xl bg-[#C9FA52]/55"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-1/4 left-4 h-7 w-7 rounded-full bg-emerald-300/60"
            variants={floatingVariants}
            animate="animate"
          />

          {/* Collage Images */}
          <motion.div
            className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-emerald-950/10 sm:h-60 sm:w-60"
            style={{ transformOrigin: "bottom center" }}
            variants={imageVariants}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt="Live cohort learning"
              className="h-full w-full rounded-xl object-cover"
            />
          </motion.div>
          <motion.div
            className="absolute right-0 top-1/3 h-40 w-40 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-emerald-950/10 sm:h-52 sm:w-52"
            style={{ transformOrigin: "left center" }}
            variants={imageVariants}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[1]}
              alt="Instructor mentoring students"
              className="h-full w-full rounded-xl object-cover object-top"
            />
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 h-36 w-36 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-emerald-950/10 sm:h-48 sm:w-48"
            style={{ transformOrigin: "top right" }}
            variants={imageVariants}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[2]}
              alt="Hands-on engineering workshop"
              className="h-full w-full rounded-xl object-cover"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
