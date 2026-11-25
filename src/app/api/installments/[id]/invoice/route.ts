import { createElement } from "react";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import FeeInstallment from "@/models/FeeInstallment";
import "@/models/User";
import "@/models/Course";
import "@/models/Enrollment";
import { FeeInvoicePDF } from "@/components/certificate/FeeInvoicePDF";

const fmt = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

async function loadLogoPng() {
  try {
    const buf = await readFile(
      path.join(process.cwd(), "public", "images", "it-skillcore-mark.png")
    );
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { id } = await params;
    await connectDB();

    const inst: any = await FeeInstallment.findById(id)
      .populate("student", "name email")
      .populate("course", "title batchCode")
      .populate("enrollment", "couponCode")
      .lean();

    if (!inst || !inst.student || !inst.course) {
      return new Response("Installment not found", { status: 404 });
    }
    if (session.role !== "ADMIN" && String(inst.student._id) !== session.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const invoiceNumber = `INV-${String(inst._id).slice(-8).toUpperCase()}`;
    const logoUrl = await loadLogoPng();

    const buf = await renderToBuffer(
      createElement(FeeInvoicePDF, {
        invoiceNumber,
        studentName: inst.student.name,
        studentEmail: inst.student.email,
        courseTitle: inst.course.title,
        batchCode: inst.course.batchCode || "Batch 01",
        monthLabel: inst.monthLabel,
        installmentNumber: inst.installmentNumber || 1,
        amountPKR: Number(inst.amount || 0),
        status: inst.status,
        paymentMethod: inst.paymentMethod || "JazzCash",
        transactionId: inst.transactionId || undefined,
        dueDate: fmt(inst.dueDate),
        issuedAt: fmt(new Date()),
        verifiedAt: inst.verifiedAt ? fmt(inst.verifiedAt) : undefined,
        couponCode: inst.enrollment?.couponCode || undefined,
        logoUrl,
      }) as any
    );

    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Could not generate invoice PDF", { status: 500 });
  }
}
