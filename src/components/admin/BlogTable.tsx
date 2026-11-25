"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import BlogForm from "./BlogForm";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
  publishedAt: string;
}

export default function BlogTable({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Post deleted"); router.refresh(); }
    else toast.error("Failed to delete");
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="h-display text-2xl">Blog Posts</h1>
        <button onClick={() => setCreating(true)} className="btn-primary"><Plus size={16} />New Post</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              {["Title", "Author", "Tags", "Published", ""].map((h) => (
                <th key={h} className="p-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p._id} className="border-b border-slate-50 hover:bg-[#F4FFE2]/30 transition">
                <td className="p-4 font-medium text-slate-800 max-w-xs truncate">{p.title}</td>
                <td className="p-4 text-slate-500">{p.author || "—"}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {(p.tags ?? []).slice(0, 3).map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(p.publishedAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(p)} className="btn-ghost !px-2 text-slate-500 hover:text-[#063F38]" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="btn-ghost !px-2 text-slate-500 hover:text-rose-600" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="p-10 text-center text-slate-400">No blog posts yet. Create your first one.</p>}
      </div>

      {creating && <BlogForm onClose={() => setCreating(false)} />}
      {editing && <BlogForm post={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
