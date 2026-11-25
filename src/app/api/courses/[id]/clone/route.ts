import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Course from "@/models/Course";
import Assignment from "@/models/Assignment";
import Quiz from "@/models/Quiz";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await connectDB();

  const source: any = await Course.findById(id).lean();
  if (!source) return NextResponse.json({ error: "Source course not found" }, { status: 404 });

  // Derive next batch label cleanly
  const batchMatch = String(source.batchCode || "Batch 01").match(/(\d+)/);
  const nextNum = batchMatch ? Number(batchMatch[1]) + 1 : 2;
  const nextBatchCode = body.batchCode || `Batch ${String(nextNum).padStart(2, "0")}`;
  const newStartDate = body.batchStartDate
    ? new Date(body.batchStartDate)
    : new Date(Date.now() + 30 * 86400000);

  const baseTitle = String(source.title).replace(/\s*\(Batch\s*\d+\)\s*$/i, "");
  const newTitle = body.title || `${baseTitle} (${nextBatchCode})`;
  let newSlug = slugify(newTitle);
  if (await Course.exists({ slug: newSlug })) {
    newSlug = `${newSlug}-${Date.now().toString(36).slice(-4)}`;
  }

  const { _id, createdAt, updatedAt, __v, ...rest } = source;

  // Strip nested lesson/module _ids so fresh IDs are generated cleanly
  const cleanCurriculum = (source.curriculum || []).map((m: any) => ({
    moduleTitle: m.moduleTitle,
    weekNumber: m.weekNumber,
    lessons: (m.lessons || []).map((l: any) => {
      const { _id: _lid, ...lRest } = l;
      return lRest;
    }),
  }));

  const clonedCourse = await Course.create({
    ...rest,
    title: newTitle,
    slug: newSlug,
    batchCode: nextBatchCode,
    batchStartDate: newStartDate,
    curriculum: cleanCurriculum,
    isPublished: body.isPublished ?? false,
  });

  // Shift & clone linked Assignments and Quizzes relative to batch start date
  const [srcAssignments, srcQuizzes]: any[] = await Promise.all([
    Assignment.find({ course: source._id }).lean(),
    Quiz.find({ course: source._id }).lean(),
  ]);

  if (srcAssignments.length > 0) {
    await Assignment.insertMany(
      srcAssignments.map((a: any) => {
        const { _id: _aid, createdAt: _ac, ...aRest } = a;
        const weekOffset = Math.max(1, Number(a.weekNumber || 1)) * 7 * 86400000;
        return {
          ...aRest,
          course: clonedCourse._id,
          dueDate: new Date(newStartDate.getTime() + weekOffset),
        };
      })
    );
  }

  if (srcQuizzes.length > 0) {
    await Quiz.insertMany(
      srcQuizzes.map((q: any) => {
        const { _id: _qid, createdAt: _qc, ...qRest } = q;
        return {
          ...qRest,
          course: clonedCourse._id,
        };
      })
    );
  }

  return NextResponse.json(
    {
      course: clonedCourse,
      clonedAssignments: srcAssignments.length,
      clonedQuizzes: srcQuizzes.length,
    },
    { status: 201 }
  );
}
