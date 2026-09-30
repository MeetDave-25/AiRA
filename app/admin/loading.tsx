"use client";

export default function AdminLoading() {
    return (
        <div className="space-y-6 p-2 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 h-24 flex flex-col justify-center space-y-2">
                <div className="h-6 w-48 bg-slate-800 rounded-lg" />
                <div className="h-4 w-72 bg-slate-800/60 rounded-md" />
            </div>

            {/* KPI Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 h-28 flex items-center justify-between">
                        <div className="space-y-3 flex-1">
                            <div className="h-3 w-24 bg-slate-800 rounded" />
                            <div className="h-7 w-16 bg-slate-800 rounded-lg" />
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-slate-800/80" />
                    </div>
                ))}
            </div>

            {/* Table / Content Skeleton */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="h-6 w-36 bg-slate-800 rounded-lg" />
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-14 bg-slate-800/40 rounded-xl border border-white/5 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
