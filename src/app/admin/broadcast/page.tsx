import { connectDB } from "@/lib/db";
import Broadcast from "@/models/Broadcast";
import Course from "@/models/Course";
import BroadcastManager from "@/components/admin/BroadcastManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminBroadcastPage() {
  await connectDB();
  const [broadcasts, courses]: any[] = await Promise.all([
    Broadcast.find().sort({ createdAt: -1 }).populate("course", "title").lean(),
    Course.find().select("title").lean(),
  ]).then(plain);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="h-display text-2xl text-slate-900">Broadcast Links & Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Send live stream meeting URLs, emergency announcements, and resource links directly into all student inboxes.
          </p>
        </div>
      </div>
      <BroadcastManager broadcasts={broadcasts} courses={courses} />
    </div>
  );
}
