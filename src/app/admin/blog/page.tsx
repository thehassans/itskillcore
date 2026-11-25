import { connectDB } from "@/lib/db";
import { Blog } from "@/models/Content";
import { plain } from "@/lib/utils";
import BlogTable from "@/components/admin/BlogTable";

export const dynamic = "force-dynamic";

export default async function AdminBlog() {
  await connectDB();
  const posts = plain(await Blog.find().sort({ publishedAt: -1 }).lean());
  return <BlogTable posts={posts as any} />;
}
