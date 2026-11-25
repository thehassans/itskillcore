import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import FeeInstallment from "@/models/FeeInstallment";
import Enrollment from "@/models/Enrollment";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const inst: any = await FeeInstallment.findById(id);
    if (!inst) return NextResponse.json({ error: "Installment not found" }, { status: 404 });

    // Student submitting payment receipt proof
    if (session.role === "STUDENT") {
      if (String(inst.student) !== session.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!body.receiptUrl || !body.transactionId) {
        return NextResponse.json(
          { error: "Please upload receipt screenshot and enter Transaction / TID reference" },
          { status: 400 }
        );
      }

      inst.paymentMethod = body.paymentMethod || "JazzCash";
      inst.transactionId = String(body.transactionId).trim();
      inst.receiptUrl = body.receiptUrl;
      inst.status = "SUBMITTED";
      inst.submittedAt = new Date();
      inst.adminNote = "";
      await inst.save();

      return NextResponse.json(inst);
    }

    // Admin 1-click verification, rejection, overdue lock, or direct access toggle
    if (body.action === "UNLOCK_ACCESS" || body.action === "LOCK_ACCESS") {
      const locked = body.action === "LOCK_ACCESS";
      await Enrollment.findByIdAndUpdate(inst.enrollment, {
        accessLocked: locked,
        lockReason: locked
          ? body.lockReason || `${inst.monthLabel} overdue — please submit fee receipt to restore access.`
          : "",
      });
      return NextResponse.json({ ok: true, accessLocked: locked });
    }

    const nextStatus = body.status;
    if (!["UNPAID", "SUBMITTED", "VERIFIED", "OVERDUE", "REJECTED"].includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    inst.status = nextStatus;
    if (body.adminNote !== undefined) inst.adminNote = body.adminNote;
    if (nextStatus === "VERIFIED") {
      inst.verifiedAt = new Date();
    }
    await inst.save();

    // Automatic cohort access lock/unlock based on overdue installments
    if (nextStatus === "VERIFIED") {
      const remainingOverdue = await FeeInstallment.countDocuments({
        enrollment: inst.enrollment,
        status: "OVERDUE",
      });
      if (remainingOverdue === 0) {
        await Enrollment.findByIdAndUpdate(inst.enrollment, {
          accessLocked: false,
          lockReason: "",
        });
      }
    } else if (nextStatus === "OVERDUE") {
      await Enrollment.findByIdAndUpdate(inst.enrollment, {
        accessLocked: true,
        lockReason:
          body.adminNote ||
          `${inst.monthLabel} fee is overdue. Upload JazzCash / EasyPaisa / Bank receipt in Dashboard → Fee Installments to unlock classes.`,
      });
    }

    return NextResponse.json(inst);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
