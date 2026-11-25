import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

type Ctx = { params: Promise<{ id: string }> };

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcs(s: string) {
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();

  const course: any = await Course.findOne(isValidObjectId(id) ? { _id: id } : { slug: id }).lean();
  if (!course) return new Response("Course not found", { status: 404 });

  // Compute next weekday 8:00 PM PKT (15:00 UTC) as series start
  const start = course.batchStartDate ? new Date(course.batchStartDate) : new Date();
  while (start.getUTCDay() === 0 || start.getUTCDay() === 6) {
    start.setUTCDate(start.getUTCDate() + 1);
  }
  start.setUTCHours(15, 0, 0, 0); // 8:00 PM PKT = 15:00 UTC
  const end = new Date(start.getTime() + 90 * 60000); // 90-minute live session

  const meetLink = course.cohortSchedule?.liveClassLink || "https://meet.google.com/itskillcore-live";
  const sessionsCount = Math.max(
    10,
    (course.curriculum || []).reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 60
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IT SkillCore//Live Cohort Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cohort-${course._id}@itskillcore.pk`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=${sessionsCount}`,
    `SUMMARY:${escapeIcs(`${course.title} (${course.batchCode || "Live Cohort"})`)}`,
    `DESCRIPTION:${escapeIcs(`Live Mon-Fri Interactive Class via Google Meet: ${meetLink}\nSchedule: ${course.cohortSchedule?.timing || "Monday to Friday · 8:00 PM – 9:30 PM PKT"}`)}`,
    `LOCATION:${escapeIcs(meetLink)}`,
    `URL:${meetLink}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${course.slug || "cohort"}-schedule.ics"`,
    },
  });
}
