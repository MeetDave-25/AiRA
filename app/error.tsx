"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#060B14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF006E]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#FF006E]/15 border border-[#FF006E]/30 flex items-center justify-center mx-auto text-[#FF006E]">
                    <AlertTriangle size={32} />
                </div>

                <div className="space-y-2">
                    <h2 className="font-orbitron font-bold text-xl md:text-2xl text-white">
                        System Interruption
                    </h2>
                    <p className="text-sm text-slate-400">
                        An unexpected issue occurred while rendering this view. Our diagnostic logs have captured the event.
                    </p>
                </div>

                {error.digest && (
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-xs font-mono text-slate-400 break-all">
                        Digest ID: {error.digest}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-slate-950 font-bold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Retry View
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
                    >
                        <Home size={16} />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
