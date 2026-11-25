import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import FeeInstallment from "@/models/FeeInstallment";
import { buildDefaultInstallments } from "@/lib/academic";
import { finalPrice } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

// Admin: { status: "APPROVED" | "REJECTED" }.  Student: { lessonId, done } to update own progress.
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    await connectDB();

    if (body.status) {
      if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (!["APPROVED", "REJECTED"].includes(body.status))
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      const e: any = await Enrollment.findByIdAndUpdate(id, { status: body.status }, { new: true });
      if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });

      if (body.status === "APPROVED") {
        const existingCount = await FeeInstallment.countDocuments({ student: e.student, course: e.course });
        if (existingCount === 0) {
          const course: any = await Course.findById(e.course).select("price discountPrice").lean();
          const billedUSD =
            typeof e.finalPriceUSD === "number"
              ? e.finalPriceUSD
              : course
              ? finalPrice(course)
              : 30000;
          const docs = buildDefaultInstallments({
            studentId: e.student,
            courseId: e.course,
            enrollmentId: e._id,
            totalPricePKR: billedUSD,
          });
          if (docs.length > 0) {
            await FeeInstallment.insertMany(docs).catch(() => {});
          }
        }
      }
      return NextResponse.json(e);
    }

    if (body.lessonId) {
      const e = await Enrollment.findOne({ _id: id, student: session.id, status: "APPROVED" });
      if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await Enrollment.updateOne({ _id: id }, body.done === false
        ? { $pull: { progress: body.lessonId } }
        : { $addToSet: { progress: body.lessonId } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
