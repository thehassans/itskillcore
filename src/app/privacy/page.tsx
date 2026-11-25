import { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | IT SkillCore",
  description: "IT SkillCore privacy policy and data governance practices.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="container-x max-w-3xl py-14">
        <h1 className="h-display text-3xl font-extrabold text-slate-900 md:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-6 text-slate-700 leading-relaxed font-[family-name:var(--font-body)]">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Overview</h2>
            <p>
              IT SkillCore (&quot;IT SkillCore&quot;, &quot;we&quot;, &quot;our&quot;) is committed to safeguarding your personal data and educational records. This policy describes how we collect, store, and process your information when you enroll in our courses, earn verified credentials, or browse our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Full name, email address, and encrypted password.</li>
              <li><strong>Academic Progress:</strong> Lessons completed, course progress percentage, and time of completion.</li>
              <li><strong>Certification Records:</strong> Publicly verifiable certificate IDs, course program completions, and honors issued.</li>
              <li><strong>Inquiry Messages:</strong> Name, contact email, and questions submitted via our contact portal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Certificate Verification & Public Records</h2>
            <p>
              When a certificate is awarded, its unique identifier (e.g. <code>CERT-2026-XXXX</code>), recipient name, course title, and issue date are stored in our public verification registry. This enables third-party verification by employers and institutions. Personal contact details and passwords are never exposed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Data Security</h2>
            <p>
              We implement industry-standard encryption, HTTP-only secure session cookies, and strict role-based access control. We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Contact Us</h2>
            <p>
              If you have any questions or data removal requests regarding this Privacy Policy, please contact our Data Protection Officer at <a href="mailto:admissions@itskillcore.pk" className="text-[#063F38] font-semibold underline">admissions@itskillcore.pk</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
