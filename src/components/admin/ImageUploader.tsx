"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";

const isValidImageSrc = (u?: string) => Boolean(u && /^(\/|https?:\/\/)/.test(u.trim()));

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
  aspect = "aspect-video",
  hideUrlInput = false,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: string;
  hideUrlInput?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [value]);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (r.ok) {
      setBroken(false);
      onChange(d.url);
      toast.success("Image uploaded");
    } else {
      toast.error(d.error ?? "Upload failed");
    }
  }

  const showImg = isValidImageSrc(value) && !broken;

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          upload(e.dataTransfer.files[0]);
        }}
        className={`${aspect} relative grid cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed transition ${
          drag
            ? "border-[#063F38] bg-[#F4FFE2]"
            : "border-slate-200 bg-slate-50 hover:border-[#063F38]/40"
        }`}
      >
        {showImg ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt=""
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="px-3 text-center text-xs text-slate-400">
            {busy ? (
              <Loader2 className="mx-auto animate-spin text-[#063F38]" />
            ) : (
              <ImagePlus className="mx-auto mb-1 text-[#063F38]" size={20} />
            )}
            Drag &amp; drop or click
          </div>
        )}
        {busy && showImg && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="animate-spin text-[#063F38]" />
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {!hideUrlInput && (
        <input
          type="url"
          autoComplete="off"
          value={isValidImageSrc(value) ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="input mt-2 text-xs"
        />
      )}
    </div>
  );
}
