'use client';

export function BasicInfoSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="mb-4 h-8 w-3/4 rounded bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
        <div className="h-4 w-4/6 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function FinancialsSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="mb-4 h-7 w-1/2 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export function TendersSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border p-4">
      <div className="mb-4 h-7 w-2/3 rounded bg-gray-200"></div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-md border p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="mb-2 h-7 w-1/4 rounded bg-gray-200"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-md border p-3">
            <div className="mb-2 h-5 w-1/3 rounded bg-gray-200"></div>
            <div className="mb-1 h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-3 w-1/4 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
