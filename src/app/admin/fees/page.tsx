import { connectDB } from "@/lib/db";
import FeeInstallment from "@/models/FeeInstallment";
import User from "@/models/User";
import Course from "@/models/Course";
import "@/models/Enrollment";
import { Download } from "lucide-react";
import FeeInstallmentManager from "@/components/admin/FeeInstallmentManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFeesPage() {
  await connectDB();
  const [installments, students, courses]: any[] = await Promise.all([
    FeeInstallment.find()
      .populate("student", "name email")
      .populate("course", "title slug")
      .populate("enrollment", "status accessLocked lockReason")
      .sort({ status: 1, installmentNumber: 1, dueDate: 1 })
      .lean(),
    User.find({ role: "STUDENT" }).select("name email").lean(),
    Course.find().select("title").lean(),
  ]).then(plain);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-2xl text-slate-900">
            Fee Installments &amp; Payment Verification
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verify JazzCash, EasyPaisa, and Bank Transfer receipts in 1 click, or automatically lock/unlock cohort classroom access for overdue installments.
          </p>
        </div>
        <a href="/api/admin/export?type=fees" className="btn-outline btn-sm">
          <Download size={14} /> Export Fee Ledger CSV
        </a>
      </div>
      <FeeInstallmentManager
        initialInstallments={installments}
        students={students}
        courses={courses}
      />
    </div>
  );
}
