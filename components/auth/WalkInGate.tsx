"use client";

// Mounted once in the root layout so the access reveal keeps playing while the router swaps
// the login page for the dashboard underneath it.

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AccessReveal = dynamic(() => import("./AccessReveal"), { ssr: false });

type Detail = { name: string; role?: string };
const EVENT = "aira-walkin";

/** Start the post-login access reveal from anywhere on the client. */
export function startWalkIn(detail: Detail) {
    window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail }));
}

export default function WalkInGate() {
    const [run, setRun] = useState<Detail | null>(null);

    useEffect(() => {
        const on = (e: Event) => setRun((e as CustomEvent<Detail>).detail);
        window.addEventListener(EVENT, on);
        return () => window.removeEventListener(EVENT, on);
    }, []);

    if (!run) return null;
    return <AccessReveal name={run.name} role={run.role} onDone={() => setRun(null)} />;
}
