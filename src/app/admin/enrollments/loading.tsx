export default function AdminEnrollmentsLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-56" />
      <div className="flex gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((t) => (
          <div key={t} className="skeleton h-9 w-24 rounded-xl" />
        ))}
      </div>
      <div className="card overflow-hidden border-slate-200">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50/60">{[...Array(6)].map((_, i) => <th key={i} className="p-4"><div className="skeleton h-4 w-20" /></th>)}</tr></thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                {[...Array(6)].map((_, j) => <td key={j} className="p-4"><div className="skeleton h-4 w-full" /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
