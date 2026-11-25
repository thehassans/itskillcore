export default function AdminCoursesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-10 w-40 rounded-xl" />
      </div>
      <div className="card overflow-hidden border-slate-200">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-100 bg-slate-50/60"><th className="p-4"><div className="skeleton h-4 w-20" /></th><th className="p-4"><div className="skeleton h-4 w-16" /></th><th className="p-4"><div className="skeleton h-4 w-12" /></th><th className="p-4"><div className="skeleton h-4 w-16" /></th><th className="p-4"><div className="skeleton h-4 w-16" /></th></tr></thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="p-4"><div className="flex items-center gap-3"><div className="skeleton h-10 w-16 rounded-lg" /><div className="skeleton h-4 w-40" /></div></td>
                <td className="p-4"><div className="skeleton h-4 w-20 rounded-full" /></td>
                <td className="p-4"><div className="skeleton h-4 w-12" /></td>
                <td className="p-4"><div className="skeleton h-5 w-16 rounded-full" /></td>
                <td className="p-4"><div className="skeleton h-8 w-20 rounded-lg" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
