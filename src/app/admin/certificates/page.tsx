import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Certificate from "@/models/Certificate";
import CertificateStudio from "@/components/admin/CertificateStudio";
import CertificateActionButtons from "@/components/admin/CertificateActionButtons";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Certificates() {
  await connectDB();
  const [students, courses, certs]: any[] = await Promise.all([
    User.find({ role: "STUDENT" }).select("name email").lean(),
    Course.find().select("title").lean(),
    Certificate.find()
      .sort({ issuedAt: -1 })
      .limit(20)
      .populate("student", "name")
      .populate("course", "title")
      .lean(),
  ]).then(plain);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="h-display text-2xl text-slate-900">Certificate Studio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Issue verified cohort credentials, inspect academic eligibility gates, or revoke issued records.
        </p>
      </div>

      <CertificateStudio students={students} courses={courses} />

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="text-sm font-bold text-slate-900">Recently Issued Registry</h2>
          <span className="font-mono text-xs text-slate-400">{certs.length} records</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Credential ID</th>
              <th className="px-5 py-3">Recipient</th>
              <th className="px-5 py-3">Cohort</th>
              <th className="px-5 py-3">Issued</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {certs
              .filter((c: any) => c.student && c.course)
              .map((c: any) => (
                <tr key={c._id} className="hover:bg-slate-50/60 transition">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs font-semibold text-slate-800">
                    {c.certificateId}
                    {c.isRevoked && (
                      <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                        REVOKED
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900">
                    {c.student.name}
                  </td>
                  <td className="max-w-[260px] truncate px-5 py-3.5 text-slate-600">
                    {c.course.title}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-500">
                    {new Date(c.issuedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs space-x-3">
                    <a
                      className="font-medium text-slate-600 hover:text-[#063F38]"
                      href={`/verify/${c.certificateId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Verify
                    </a>
                    <a
                      className="font-semibold text-[#063F38] hover:underline"
                      href={`/api/certificates/pdf?certId=${c.certificateId}`}
                    >
                      PDF
                    </a>
                    <CertificateActionButtons id={c._id} isRevoked={c.isRevoked} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {certs.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-400">No certificates issued yet.</p>
        )}
      </div>
    </div>
  );
}
