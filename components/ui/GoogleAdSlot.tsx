"use client";

import { useEffect, useRef } from "react";

interface GoogleAdSlotProps {
    slot?: string;
    format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
    responsive?: boolean;
    className?: string;
}

/**
 * Reusable Google AdSense Ad Unit Component
 * Automatically pushes to adsbygoogle array when mounted on client.
 */
export default function GoogleAdSlot({
    slot = "3747182240775238",
    format = "auto",
    responsive = true,
    className = "",
}: GoogleAdSlotProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const adsbygoogle = (window as any).adsbygoogle || [];
                adsbygoogle.push({});
            }
        } catch (err) {
            // ignore duplicate push or blocked ad errors
        }
    }, []);

    return (
        <div className={`my-6 flex items-center justify-center overflow-hidden ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-3747182240775238"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
}
