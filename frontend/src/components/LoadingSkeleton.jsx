export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-slate-100 rounded w-1/3" />
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 bg-slate-100 rounded w-1/4" />
        <div className="w-9 h-9 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
)

export const PageSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    <div className="h-8 bg-slate-100 rounded w-1/4" />
    <div className="h-4 bg-slate-100 rounded w-1/2" />
    <div className="grid grid-cols-4 gap-4 mt-6">
      {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  </div>
)