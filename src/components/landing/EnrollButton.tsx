"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Tag, X } from "lucide-react";

export default function EnrollButton({
  courseId,
  slug,
  free,
  basePrice = 0,
}: {
  courseId: string;
  slug: string;
  free?: boolean;
  basePrice?: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [ref, setRef] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<{
    code: string;
    discountUSD: number;
    finalUSD: number;
    description?: string;
  } | null>(null);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return toast.error("Enter a promo or scholarship code");
    setApplying(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setApplied({
        code: data.code,
        discountUSD: data.discountUSD,
        finalUSD: data.finalUSD,
        description: data.description,
      });
      toast.success(`Code ${data.code} applied (-$${data.discountUSD})`);
    } catch (err: any) {
      toast.error(err.message);
      setApplied(null);
    } finally {
      setApplying(false);
    }
  }

  async function enroll() {
    setState("busy");
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        paymentReference: ref || undefined,
        couponCode: applied?.code || undefined,
      }),
    });
    if (res.status === 401) {
      toast.info("Please sign in or create an account to enroll");
      return router.push(`/login?next=/courses/${slug}`);
    }
    const data = await res.json();
    if (res.ok) return setState("done");
    toast.error(data.error ?? "Could not submit your request");
    setState("idle");
  }

  if (state === "done")
    return (
      <div className="rounded-2xl border border-[#063F38]/20 bg-[#F4FFE2] p-4 text-sm text-emerald-950 shadow-sm">
        <CheckCircle2 className="mb-2 text-[#063F38]" size={22} />
        <b>Your enrollment request has been submitted!</b> Our admin team will review and approve your access shortly.
        <button onClick={() => router.push("/dashboard")} className="btn-success btn-sm mt-3 w-full">
          Go to my dashboard
        </button>
      </div>
    );

  return (
    <div className="space-y-3">
      {!free && (
        <>
          {applied ? (
            <div className="flex items-center justify-between rounded-xl border border-[#063F38]/20 bg-[#F4FFE2]/80 px-3 py-2 text-xs">
              <div>
                <p className="font-mono font-bold text-[#063F38] flex items-center gap-1.5">
                  <Tag size={12} /> {applied.code} Applied (-${applied.discountUSD})
                </p>
                <p className="text-slate-600 mt-0.5">
                  Adjusted tuition:{" "}
                  <b className="text-slate-900">
                    {applied.finalUSD === 0 ? "Free (100% Waiver)" : `$${applied.finalUSD}`}
                  </b>
                  {basePrice > 0 && (
                    <span className="ml-1.5 line-through text-slate-400">${basePrice}</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setApplied(null);
                  setCouponInput("");
                }}
                className="rounded p-1 text-slate-500 hover:bg-white"
                title="Remove code"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Scholarship / promo code"
                className="input font-mono text-xs uppercase"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applying}
                className="btn-outline btn-sm shrink-0 text-xs"
              >
                {applying ? "…" : "Apply"}
              </button>
            </div>
          )}

          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Payment note / transaction ID (optional)"
            className="input text-sm"
          />
        </>
      )}

      <button onClick={enroll} disabled={state === "busy"} className="btn-primary w-full !py-3">
        {state === "busy" ? "Sending request…" : "Enroll in Course"}
      </button>
    </div>
  );
}
