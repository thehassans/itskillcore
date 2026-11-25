const map: Record<string, string> = {
  PENDING: "bg-[#C9FA52]/45 text-[#063F38] border border-[#063F38]/20",
  APPROVED: "bg-[#C9FA52]/40 text-[#063F38] border border-[#063F38]/20",
  REJECTED: "bg-rose-100 text-rose-700 border border-rose-200",
  Published: "bg-[#C9FA52]/40 text-[#063F38] border border-[#063F38]/20",
  Draft: "bg-slate-100 text-slate-600 border border-slate-200",
};
export default function StatusBadge({ s }: { s: string }) {
  return <span className={`badge ${map[s] ?? "bg-slate-100"} font-semibold`}>{s}</span>;
}
