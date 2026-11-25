export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="skeleton h-10 w-36" />
          <div className="hidden items-center gap-3 lg:flex">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 w-16" />)}
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-9 w-24 rounded-xl" />
            <div className="skeleton h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Hero skeleton */}
      <div className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <div className="skeleton mx-auto h-8 w-48 rounded-full" />
          <div className="skeleton mx-auto h-12 w-96" />
          <div className="skeleton mx-auto h-12 w-80" />
          <div className="skeleton mx-auto h-5 w-72" />
          <div className="flex justify-center gap-3 pt-4">
            <div className="skeleton h-12 w-40 rounded-xl" />
            <div className="skeleton h-12 w-40 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Courses grid skeleton */}
      <div className="container-x py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-video w-full rounded-none" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-4 w-20 rounded-full" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-10 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
