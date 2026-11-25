"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    const res = await fetch("/api/contact", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    setBusy(false);
    if (res.ok) { toast.success("Message sent. We'll reply by email."); form.reset(); }
    else toast.error((await res.json()).error ?? "Message not sent");
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input name="name" placeholder="Your name" required className="input" />
        </div>
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" placeholder="you@email.com" required className="input" />
        </div>
      </div>
      <div>
        <label className="label">Subject</label>
        <input name="subject" placeholder="What is your question?" required className="input" />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea name="message" placeholder="How can we help? (10+ characters)" rows={5} required className="input" />
      </div>
      <button disabled={busy} className="btn-primary w-full sm:w-auto"><Send size={15} />{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
