import Link from "next/link";
import {
  Search,
  ShieldCheck,
  Award,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";
import { Blog, FAQ } from "@/models/Content";
import Navbar from "@/components/landing/Navbar";
import { HeroSection as ArchitecturalHero } from "@/components/ui/hero-section-2";
import CourseCard from "@/components/landing/CourseCard";
import Stats from "@/components/landing/Stats";
import FAQAccordion from "@/components/landing/FAQAccordion";
import ContactForm from "@/components/landing/ContactForm";
import Footer from "@/components/landing/Footer";
import Reveal from "@/components/landing/Reveal";
import GoldenSeal from "@/components/certificate/GoldenSeal";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";
import { plain, readTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const steps = [
  [
    Search,
    "Admissions & Installment Setup",
    "Select your 3-month cohort, apply online, and submit your monthly installment proof via JazzCash, EasyPaisa, or Meezan IBAN.",
  ],
  [
    ShieldCheck,
    "Mon–Fri Live Sessions & Reviews",
    "Attend interactive Google Meet classes 5 days a week, access slide decks & notes, ask lesson Q&A, and track 75%+ attendance.",
  ],
  [
    Award,
    "Golden-Seal Credential Issuance",
    "Complete graded capstone homework and quizzes to unlock an employer-verifiable certificate with QR & registry ID.",
  ],
] as const;

const pakistaniMarqueeTestimonials = [
  {
    author: {
      name: "Muhammad Bilal",
      handle: "@bilal_dev · Systems Ltd, Lahore",
      avatar: "/images/pk-bilal.jpg",
    },
    text: "The 3-month live cohort with classes 5 days a week kept me completely focused. Instructor code reviews and downloadable slides helped me secure a Full-Stack developer role at Systems Ltd.",
  },
  {
    author: {
      name: "Ayesha Siddiqui",
      handle: "@ayesha_uiux · DevSinc, Karachi",
      avatar: "/images/pk-ayesha.jpg",
    },
    text: "IT SkillCore's UI/UX live classes completely transformed how I present Figma prototypes and design systems. Getting my homework graded with actionable feedback made all the difference.",
  },
  {
    author: {
      name: "Hamza Tariq",
      handle: "@hamza_ai · Jazz Telecom, Islamabad",
      avatar: "/images/pk-hamza.jpg",
    },
    text: "Data science tutorials online are usually passive playlists. IT SkillCore's 5-day live sessions on Google Meet with real-world datasets and milestone quizzes gave me practical skills.",
  },
  {
    author: {
      name: "Fatima Zahra",
      handle: "@fatima_growth · E-Commerce Lead, Rawalpindi",
      avatar: "/images/pk-fatima.jpg",
    },
    text: "The digital marketing strategy bootcamp gave me the frameworks to scale Meta Ads to 4.5x ROAS. The QR code verifiable certificate was verified immediately by my employers.",
  },
  {
    author: {
      name: "Daniyal Ahmed",
      handle: "@daniyal_mern · FAST-NUCES, Faisalabad",
      avatar: "/images/pk-daniyal.jpg",
    },
    text: "Next.js 14 App Router, Server Actions, and MongoDB modeling were taught in great depth. The admin broadcasts and daily meeting links kept our entire cohort aligned.",
  },
  {
    author: {
      name: "Zainab Noor",
      handle: "@zainab_code · Peshawar",
      avatar: "/images/pk-zainab.jpg",
    },
    text: "From student panel assignments upload (supporting PDFs and Word docs) to certificate verification, IT SkillCore is hands-down the best tech learning academy in Pakistan.",
  },
];

export default async function Home() {
  await connectDB();
  const [courses, posts, faqs, students, courseCount] = await Promise.all([
    Course.find({ isPublished: true }).sort({ createdAt: -1 }).limit(6).lean(),
    Blog.find().sort({ publishedAt: -1 }).limit(3).lean(),
    FAQ.find().sort({ order: 1 }).lean(),
    User.countDocuments({ role: "STUDENT" }),
    Course.countDocuments({ isPublished: true }),
  ]).then(plain);

  return (
    <>
      <Navbar />
      <main>
        {/* 1. Architectural Diagonal Split Hero (no duplicate navbar logo) */}
        <ArchitecturalHero
          slogan="LIVE COHORT ACADEMY · MON–FRI 8 PM PKT"
          title={
            <>
              Engineering careers <br />
              <span className="text-[#063F38]">built through live mastery</span>
            </>
          }
          subtitle="Structured 3-month online cohorts with senior mentors 5 days a week. Track attendance, submit real projects, pay flexibly via monthly installments, and graduate with verifiable credentials."
          callToAction={{
            text: "EXPLORE LIVE COHORTS",
            href: "/courses",
          }}
          secondaryAction={{
            text: "Verify Credential",
            href: "/verify/CERT-ITSKILLCORE-2025",
          }}
          backgroundImage="/images/hero.jpg"
          contactInfo={{
            website: "itskillcore.pk",
            phone: "+92 300 123 4567",
            address: "Gulberg III, Lahore · Nationwide Live",
          }}
        />

        {/* 2. Deep Pine Architectural Metrics Band */}
        <section className="bg-[#063F38] py-8 border-b border-[#042b26]">
          <div className="container-x">
            <Stats students={students} courses={courseCount} />
          </div>
        </section>

        {/* 3. Featured 3-Month Live Cohorts */}
        <section className="container-x py-20">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow mb-3">Cohort Catalog</span>
              <h2 className="section-title">3-Month Live Bootcamps</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                Monday-to-Friday live Google Meet training with downloadable slides, graded homework, and weekly milestone quizzes.
              </p>
            </div>
            <Link href="/courses" className="btn-outline">
              All programs <ArrowRight size={15} />
            </Link>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any, i: number) => (
              <Reveal key={c._id} delay={i * 0.05}>
                <CourseCard c={c} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. Academic Method & Golden-Seal Credential Registry */}
        <section id="how" className="scroll-mt-20 bg-white py-20 border-y border-slate-200/80">
          <div className="container-x space-y-12">
            <Reveal className="max-w-2xl">
              <span className="eyebrow mb-3">Academic Method</span>
              <h2 className="section-title">Accountable cohorts from Week 1 to capstone</h2>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">
                No passive video libraries. Every cohort enforces live participation, weekly deliverables, and verified graduate credentials.
              </p>
            </Reveal>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {steps.map(([Icon, t, d], i) => (
                <div key={t} className="p-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#063F38] text-[#C9FA52]">
                      <Icon size={20} />
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-head)] text-lg font-bold text-slate-900">
                    {t}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">{d}</p>
                </div>
              ))}
            </div>

            {/* Credential Verification Strip */}
            <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-slate-200 bg-[#f8faf9] p-6 sm:flex-row sm:p-8">
              <div className="flex items-center gap-5">
                <div className="h-20 w-16 shrink-0">
                  <GoldenSeal className="h-full w-full" />
                </div>
                <div>
                  <span className="eyebrow">Public Verification Registry</span>
                  <h3 className="font-[family-name:var(--font-head)] text-xl font-bold text-slate-900 mt-2">
                    75%+ Attendance &amp; Capstone Verified Credentials
                  </h3>
                  <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-600">
                    Every IT SkillCore certificate includes a unique registry ID and scannable QR code backed by verified attendance and capstone evaluation scores.
                  </p>
                </div>
              </div>
              <Link href="/verify/CERT-ITSKILLCORE-2025" className="btn-primary shrink-0">
                Verify Sample Credential <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Pakistani Alumni Marquee */}
        <TestimonialsSection
          title="Trusted by 8,500+ learners across Pakistan"
          description="Graduates from Lahore, Karachi, Islamabad, Faisalabad, and Peshawar building software, design, and analytics careers."
          testimonials={pakistaniMarqueeTestimonials}
          className="border-b border-slate-200/80 bg-[#f8faf9]"
        />

        {/* 6. Editorial Journal */}
        <section className="bg-white py-20 border-b border-slate-200/80">
          <div className="container-x">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow mb-3">IT SkillCore Journal</span>
                <h2 className="section-title">Engineering &amp; career dispatches</h2>
              </div>
              <Link href="/blog" className="btn-outline">
                All articles <ArrowRight size={15} />
              </Link>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((p: any, i: number) => (
                <Reveal key={p._id} delay={i * 0.06}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="card group block overflow-hidden transition-colors hover:border-[#063F38]/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {new Date(p.publishedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })} ·{" "}
                        {readTime(p.content)} min read
                      </p>
                      <h3 className="mt-2 font-[family-name:var(--font-head)] text-base font-bold text-slate-900 group-hover:text-[#063F38] transition">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {p.excerpt}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Detailed Knowledge Base & FAQ */}
        <section id="faq" className="container-x max-w-6xl scroll-mt-20 py-24">
          <Reveal className="mb-12 max-w-2xl">
            <span className="eyebrow mb-3">Knowledge Base &amp; Policies</span>
            <h2 className="section-title">Everything about cohorts, fees &amp; credentials</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
              Detailed guidance on Mon–Fri live schedules, PIN attendance, monthly installments, scholarship codes, grading standards, and employer certificate verification.
            </p>
          </Reveal>
          <FAQAccordion faqs={faqs} />
        </section>

        {/* 8. Admissions Desk */}
        <section id="contact" className="scroll-mt-20 bg-white py-20 border-t border-slate-200/80">
          <div className="container-x grid gap-12 lg:grid-cols-2 items-center">
            <Reveal>
              <span className="eyebrow mb-3">Admissions Desk</span>
              <h2 className="section-title">Speak with a cohort advisor</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                Need help picking a 3-month track, configuring monthly fee installments, or verifying a graduate certificate? Reach our Lahore &amp; Karachi admissions team directly.
              </p>
              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#063F38]/15 bg-[#F4FFE2] text-[#063F38]">
                    <Mail size={18} />
                  </span>
                  <a href="mailto:admissions@itskillcore.pk" className="font-semibold text-slate-800 hover:text-[#063F38]">
                    admissions@itskillcore.pk
                  </a>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#063F38]/15 bg-[#F4FFE2] text-[#063F38]">
                    <Phone size={18} />
                  </span>
                  <a href="tel:+923001234567" className="font-semibold text-slate-800 hover:text-[#063F38]">
                    +92 300 123 4567
                  </a>
                </li>
                <li className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-[#063F38]/15 bg-[#F4FFE2] text-[#063F38]">
                    <MapPin size={18} />
                  </span>
                  <span className="font-semibold text-slate-800">
                    Gulberg III, Lahore · Live Online Across Pakistan
                  </span>
                </li>
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card p-6 sm:p-8 border-slate-200">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
