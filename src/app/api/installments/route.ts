import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession, requireAdmin } from "@/lib/auth";
import FeeInstallment from "@/models/FeeInstallment";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import "@/models/User";
import { buildDefaultInstallments } from "@/lib/academic";
import { finalPrice } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  // For students, ensure every APPROVED enrollment has 3 monthly installments generated
  if (session.role === "STUDENT") {
    const approved = await Enrollment.find({ student: session.id, status: "APPROVED" })
      .populate("course", "price discountPrice")
      .lean();

    for (const enr of approved as any[]) {
      if (!enr.course) continue;
      const existingCount = await FeeInstallment.countDocuments({
        student: session.id,
        course: enr.course._id,
      });
      if (existingCount === 0) {
        const docs = buildDefaultInstallments({
          studentId: session.id,
          courseId: enr.course._id,
          enrollmentId: enr._id,
          totalPricePKR: finalPrice(enr.course),
          startDate: enr.enrolledAt ? new Date(enr.enrolledAt) : new Date(),
        });
        await FeeInstallment.insertMany(docs).catch(() => {});
      }
    }
  }

  const statusFilter = new URL(req.url).searchParams.get("status");
  const filter: any = session.role === "ADMIN" ? {} : { student: session.id };
  if (statusFilter && statusFilter !== "ALL") filter.status = statusFilter;

  const list = await FeeInstallment.find(filter)
    .populate("student", "name email")
    .populate("course", "title slug price discountPrice")
    .populate("enrollment", "status accessLocked lockReason")
    .sort({ installmentNumber: 1, dueDate: 1 })
    .lean();

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await req.json();
  const { studentId, courseId, installmentNumber = 1, monthLabel, amount, dueDate } = body;

  if (!studentId || !courseId || !amount) {
    return NextResponse.json({ error: "studentId, courseId and amount are required" }, { status: 400 });
  }

  let enr = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enr) {
    enr = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: "APPROVED",
      paymentReference: "Installment Plan",
    });
  }

  const course = await Course.findById(courseId).lean();
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const item = await FeeInstallment.findOneAndUpdate(
    { student: studentId, course: courseId, installmentNumber: Number(installmentNumber) },
    {
      $setOnInsert: {
        student: studentId,
        course: courseId,
        enrollment: enr._id,
        installmentNumber: Number(installmentNumber),
      },
      $set: {
        monthLabel: monthLabel || `Month ${installmentNumber} Tuition`,
        amount: Number(amount),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json(item, { status: 201 });
}
