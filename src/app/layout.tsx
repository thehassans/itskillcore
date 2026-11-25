import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const head = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-head" });

export const metadata: Metadata = {
  title: {
    default: "IT SkillCore — Learn, Complete & Get Certified",
    template: "%s | IT SkillCore",
  },
  description:
    "IT SkillCore is a modern learning platform. Browse expert-led courses, earn verified certificates, and accelerate your career.",
  keywords: ["online courses", "learning platform", "certificates", "IT SkillCore", "LMS", "education"],
  authors: [{ name: "IT SkillCore" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "IT SkillCore",
    title: "IT SkillCore — Learn, Complete & Get Certified",
    description:
      "Browse expert-led courses, earn verified certificates, and accelerate your career with IT SkillCore.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "IT SkillCore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IT SkillCore — Learn, Complete & Get Certified",
    description:
      "Browse expert-led courses, earn verified certificates, and accelerate your career.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${head.variable}`}>
      <body className="font-[family-name:var(--font-body)]">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
