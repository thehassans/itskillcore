import { connectDB } from "@/lib/db";
import { FAQ } from "@/models/Content";
import { plain } from "@/lib/utils";
import FAQTable from "@/components/admin/FAQTable";

export const dynamic = "force-dynamic";

export default async function AdminFAQs() {
  await connectDB();
  const faqs = plain(await FAQ.find().sort({ order: 1 }).lean());
  return <FAQTable faqs={faqs as any} />;
}
