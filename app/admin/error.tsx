"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Section Error Caught:", error);
    }, [error]);

    return (
        <div className="bg-slate-900/90 border border-[#FF006E]/30 rounded-3xl p-8 text-center space-y-6 my-6 shadow-2xl max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FF006E]/15 border border-[#FF006E]/30 flex items-center justify-center mx-auto text-[#FF006E]">
                <AlertCircle size={28} />
            </div>

            <div className="space-y-2">
                <h2 className="font-orbitron font-bold text-xl text-white">
                    Admin Section Error
                </h2>
                <p className="text-sm text-slate-400">
                    Failed to load or update this admin section data. You can attempt to refresh without leaving the admin panel.
                </p>
            </div>

            <div className="pt-2">
                <button
                    onClick={() => reset()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-slate-950 font-bold text-sm hover:opacity-95 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Retry Admin View
                </button>
            </div>
        </div>
    );
}
