import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getSession } from "@/lib/auth";

const ALLOWED_EXTS: Record<string, string> = {
  // Images
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  // Documents (Word, PDF, Text)
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
  "text/markdown": "md",
  // Archives
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
  "application/octet-stream": "bin",
};

// Fallback extension detection by filename
function getExtFromFilename(filename: string): string {
  const parts = filename.split(".");
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase();
    if (ext && ["png", "jpg", "jpeg", "webp", "gif", "svg", "pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "zip"].includes(ext)) {
      return ext;
    }
  }
  return "bin";
}

export async function POST(req: Request) {
  try {
    if (!(await getSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let ext = ALLOWED_EXTS[file.type] || getExtFromFilename(file.name);
    if (!ext || ext === "bin") {
      ext = getExtFromFilename(file.name);
    }

    // 25MB limit for homework assignments & documents
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 25MB" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });

    // Clean filename for storage
    const cleanOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const name = `${Date.now()}-${nanoid(6)}-${cleanOriginal}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json(
      {
        url: `/uploads/${name}`,
        name: file.name,
        size: file.size,
        type: file.type,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
