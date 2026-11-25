export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fbfdfb]">
      <header className="border-b border-slate-100 bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="skeleton h-10 w-36" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </header>
      <main className="container-x py-10">
        <div className="skeleton h-8 w-64 mb-6" />
        <div className="flex gap-2 mb-8">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-32 rounded-xl" />)}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 space-y-4">
              <div className="skeleton aspect-video w-full rounded-xl" />
              <div className="skeleton h-5 w-3/4" />
              <div className="skeleton h-3 w-full rounded-full" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
