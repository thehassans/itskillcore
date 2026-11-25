export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-5 space-y-3 border-slate-200">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card border-slate-200 p-5 space-y-4">
          <div className="skeleton h-6 w-48" />
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
        </div>
        <div className="card border-slate-200 p-5 space-y-4">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
