import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | IT SkillCore",
  description: "Terms and conditions for enrolling and learning with IT SkillCore.",
};

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="container-x max-w-3xl py-14">
        <h1 className="h-display text-3xl font-extrabold text-slate-900 md:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-6 text-slate-700 leading-relaxed font-[family-name:var(--font-body)]">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing IT SkillCore or creating an account, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Enrollment & Access</h2>
            <p>
              Enrollment in paid or selective courses may be subject to administrative review and approval. IT SkillCore reserves the right to decline or revoke enrollment if academic integrity guidelines or terms of service are violated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Intellectual Property</h2>
            <p>
              All course videos, curriculum materials, lecture notes, graphics, and logos are the exclusive property of IT SkillCore or its content creators. You are granted a limited, personal, non-transferable license to view course materials for educational purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Certificate Issuance & Authenticity</h2>
            <p>
              IT SkillCore certificates are issued to individuals who satisfy all curriculum criteria. Tampering with, altering, or falsifying an IT SkillCore certificate is strictly prohibited and invalidates the credential in our verification database.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Inquiries & Support</h2>
            <p>
              For questions concerning billing, enrollments, or these Terms, please reach out to our admissions team at <a href="mailto:admissions@itskillcore.pk" className="text-[#063F38] font-semibold underline">admissions@itskillcore.pk</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
