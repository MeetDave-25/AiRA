"use client";

import Link from "next/link";

export default function OfflinePage() {
    return (
        <main className="min-h-screen bg-aira-bg px-6 py-20 text-slate-100">
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-aira-cyan/10">
                <div className="mb-4 rounded-full border border-aira-cyan/30 bg-aira-cyan/10 px-4 py-1 text-sm text-aira-cyan">
                    Offline Mode
                </div>
                <h1 className="font-orbitron text-3xl font-bold text-white">AiRA Lab is ready offline</h1>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                    Your internet connection looks unavailable right now. Reconnect to keep browsing live data,
                    uploads, and admin actions.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-xl bg-aira-cyan px-5 py-3 text-sm font-semibold text-aira-bg transition hover:opacity-90"
                    >
                        Go Home
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        </main>
    );
}
