"use client";

export default function PortalLoading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse p-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-[#00D4FF] border-r-[#7C3AED] animate-spin" />
            </div>
            <div className="text-center space-y-1">
                <div className="h-4 w-36 bg-slate-800 rounded mx-auto" />
                <div className="h-3 w-24 bg-slate-800/60 rounded mx-auto" />
            </div>
        </div>
    );
}
