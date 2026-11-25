import { createElement } from "react";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { connectDB } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import Certificate from "@/models/Certificate";
import { CertificatePDF, CertificateProps } from "@/components/certificate/CertificatePDF";

const fmt = (d: Date | string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const DEFAULT_LOGO = "/images/it-skillcore-mark.png";

// Local /public images are inlined as data URLs so react-pdf never needs to fetch from itself.
async function resolveLogo(url: string | undefined) {
  const u = url || DEFAULT_LOGO;
  if (!u.startsWith("/")) return u;
  try {
    const clean = path.normalize(u).replace(/^(\.\.[/\\])+/, "");
    const buf = await readFile(path.join(process.cwd(), "public", clean));
    const ext = path.extname(clean).slice(1).toLowerCase();
    if (!["png", "jpg", "jpeg"].includes(ext)) return undefined; // react-pdf supports PNG/JPG only
    return `data:image/${ext === "jpg" ? "jpeg" : ext};base64,${buf.toString("base64")}`;
  } catch { return undefined; }
}

const pdf = async (p: CertificateProps, origin: string) => {
  const verifyUrl = `${origin}/verify/${p.certificateId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
  const logoUrl = await resolveLogo(p.logoUrl);
  const buf = await renderToBuffer(createElement(CertificatePDF, { ...p, logoUrl, qrDataUrl, verifyUrl }) as any);
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${p.certificateId}.pdf"` } });
};

// Owner or admin downloads an issued certificate: /api/certificates/pdf?certId=...
export async function GET(req: Request) {
  try {
    const s = await getSession();
    if (!s) return new Response("Unauthorized", { status: 401 });
    const url = new URL(req.url);
    await connectDB();
    const c: any = await Certificate.findOne({ certificateId: url.searchParams.get("certId") })
      .populate("student", "name").populate("course", "title").lean();
    if (!c || !c.student || !c.course || (s.role !== "ADMIN" && String(c.student._id) !== s.id)) return new Response("Not found", { status: 404 });
    return await pdf({
      studentName: c.student.name,
      courseTitle: c.course.title,
      issuedAt: fmt(c.issuedAt),
      certificateId: c.certificateId,
      note: c.customNote,
      attendancePct: c.attendancePct,
      homeworkAvg: c.homeworkAvg,
    }, url.origin);
  } catch (e) {
    console.error(e);
    return new Response("Could not generate certificate", { status: 500 });
  }
}

// Admin test download with any sample data.
export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) return new Response("Forbidden", { status: 403 });
    const b = await req.json();
    return await pdf({
      studentName: b.studentName || "Sample Student", courseTitle: b.courseTitle || "Sample Course Title",
      issuedAt: fmt(new Date()), certificateId: "CERT-TEST-000000", note: b.note || undefined,
      platformName: b.platformName, logoUrl: b.logoUrl || undefined, signatureText: b.signatureText,
    }, new URL(req.url).origin);
  } catch (e) {
    console.error(e);
    return new Response("Could not generate certificate", { status: 500 });
  }
}
