export default function BlogLoading() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <nav className="container-x flex h-16 items-center justify-between">
          <div className="skeleton h-10 w-36" />
          <div className="flex gap-2"><div className="skeleton h-9 w-24 rounded-xl" /></div>
        </nav>
      </header>
      <main className="container-x py-12">
        <div className="mb-10 space-y-3">
          <div className="skeleton h-9 w-48" />
          <div className="skeleton h-5 w-72" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video w-full rounded-none" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-3 w-32" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
