import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-6">
          <span className="text-[10rem] font-extrabold leading-none text-emerald-100 select-none">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-[#063F38] font-[family-name:var(--font-head)]">
            Oops!
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-head)]">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/courses" className="btn-outline">
            Browse Courses
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
