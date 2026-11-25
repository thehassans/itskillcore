import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/Content";
import ContactInboxManager from "@/components/admin/ContactInboxManager";
import { plain } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await connectDB();
  const messages: any = plain(await ContactMessage.find().sort({ createdAt: -1 }).lean());

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="h-display text-2xl text-slate-900">Leads &amp; Contact Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review prospective student inquiries submitted from the public website and track admissions follow-ups.
        </p>
      </div>
      <ContactInboxManager initialMessages={messages} />
    </div>
  );
}
