export default function CoursesLoading() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <nav className="container-x flex h-16 items-center justify-between">
          <div className="skeleton h-10 w-36" />
          <div className="flex gap-2"><div className="skeleton h-9 w-24 rounded-xl" /></div>
        </nav>
      </header>
      <main className="container-x py-12">
        <div className="mb-8 space-y-4">
          <div className="skeleton h-9 w-56" />
          <div className="skeleton h-11 w-full max-w-md rounded-xl" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video w-full rounded-none" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="flex items-center justify-between pt-2">
                  <div className="skeleton h-6 w-16" />
                  <div className="skeleton h-10 w-28 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
