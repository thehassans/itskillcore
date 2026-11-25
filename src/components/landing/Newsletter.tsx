"use client";
import { toast } from "sonner";

export default function Newsletter() {
  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success("Thanks for subscribing to IT SkillCore updates!"); e.currentTarget.reset(); }} className="flex gap-2">
      <input type="email" required placeholder="you@email.com" className="input" />
      <button className="btn-primary !px-4">Join</button>
    </form>
  );
}
