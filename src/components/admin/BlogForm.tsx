"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { slugify } from "@/lib/utils";

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  tags: string[];
}

const empty: BlogPost = { title: "", slug: "", excerpt: "", content: "", coverImage: "", author: "", tags: [] };

export default function BlogForm({ post, onClose }: { post?: BlogPost | null; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPost>(post ?? { ...empty });
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const isEdit = !!post?._id;

  useEffect(() => {
    if (!isEdit) setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { ...form, tags };

    try {
      const url = isEdit ? `/api/blog/${post!._id}` : "/api/blog";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }
      toast.success(isEdit ? "Post updated" : "Post created");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 overflow-y-auto">
      <form onSubmit={handleSubmit} className="card w-full max-w-2xl space-y-4 p-6 relative">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h2 className="h-display text-xl">{isEdit ? "Edit Post" : "New Blog Post"}</h2>

        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <label className="label">Slug</label>
          <input className="input text-slate-500" value={isEdit ? (form.slug ?? "") : slugify(form.title)} onChange={(e) => setForm({ ...form, slug: e.target.value })} readOnly={!isEdit} />
        </div>

        <div>
          <label className="label">Author</label>
          <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </div>

        <div>
          <label className="label">Cover Image URL</label>
          <input className="input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
        </div>

        <div>
          <label className="label">Tags (comma-separated)</label>
          <input className="input" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="nextjs, react, web" />
        </div>

        <div>
          <label className="label">Excerpt</label>
          <textarea className="input min-h-[80px]" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>

        <div>
          <label className="label">Content</label>
          <textarea className="input min-h-[200px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving…" : isEdit ? "Update Post" : "Create Post"}</button>
        </div>
      </form>
    </div>
  );
}
