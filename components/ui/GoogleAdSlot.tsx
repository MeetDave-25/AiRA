"use client";

import { useEffect, useRef } from "react";

import { ADSENSE_CLIENT } from "@/lib/site";

export { ADSENSE_CLIENT };

interface GoogleAdSlotProps {
    /** Numeric ad-unit ID from AdSense → Ads → By ad unit. Falls back to NEXT_PUBLIC_ADSENSE_SLOT. */
    slot?: string;
    format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
    responsive?: boolean;
    className?: string;
}

/**
 * Reusable Google AdSense ad unit.
 * Renders nothing until a real ad-unit ID is configured (Auto ads from the head script still work),
 * reserves height to avoid layout shift, and is clearly labelled as required by AdSense policy.
 */
export default function GoogleAdSlot({
    slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT,
    format = "auto",
    responsive = true,
    className = "",
}: GoogleAdSlotProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        const el = adRef.current;
        // Push once per <ins>; React strict mode re-runs effects, and a second push throws.
        if (!el || el.dataset.adsPushed) return;
        try {
            el.dataset.adsPushed = "1";
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            // ad blocked or script not loaded yet
        }
    }, [slot]);

    if (!slot) return null;

    return (
        <aside aria-label="Advertisement" className={`my-8 ${className}`}>
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-nb-muted">Advertisement</p>
            <div className="min-h-[100px] flex items-center justify-center overflow-hidden">
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: "block", width: "100%" }}
                    data-ad-client={ADSENSE_CLIENT}
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive={responsive ? "true" : "false"}
                />
            </div>
        </aside>
    );
}
