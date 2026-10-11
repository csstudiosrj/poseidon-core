// src/app/(dashboard)/setup/loading.tsx
import React from "react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export default function SetupLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#020b18" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Formulário skeleton */}
          <div
            className="lg:col-span-2 rounded-xl border border-white/5 p-6 space-y-5"
            style={{ background: "#081121" }}
          >
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg mt-4" />
          </div>

          {/* Sidebar skeleton */}
          <div
            className="rounded-xl border border-white/5 p-5 space-y-4"
            style={{ background: "#081121" }}
          >
            <Skeleton className="h-4 w-32" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
