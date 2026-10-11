// src/app/(dashboard)/hub/loading.tsx
import React from "react";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
    />
  );
}

export default function HubLoading() {
  return (
    <div className="min-h-screen" style={{ background: "#020b18" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        {/* KPI cards skeleton */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 p-4 space-y-2"
              style={{ background: "#081121" }}
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </section>

        {/* Projeto cards skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 p-4 space-y-3"
              style={{ background: "#081121" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full shrink-0" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
