// src/app/(dashboard)/auditoria/loading.tsx
import React from "react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export default function AuditoriaLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#020b18" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">

        <div className="space-y-2 mb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-52" />
        </div>

        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 p-5 flex items-center justify-between gap-4"
            style={{ background: "#081121" }}
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-28 rounded-lg shrink-0" />
          </div>
        ))}

      </main>
    </div>
  );
}
