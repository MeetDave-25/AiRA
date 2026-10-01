"use client";

// Scroll reveal for every admin/member page without touching each page: cards, panels and tables
// below the fold rise into place as they scroll into view. Watches for content that loads later too.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TARGETS = ".glass, .glass-strong, .card-3d, table, [data-reveal]";

export default function ConsoleScrollReveal({ rootId }: { rootId: string }) {
    const pathname = usePathname();

    useEffect(() => {
        const root = document.getElementById(rootId);
        if (!root || typeof IntersectionObserver === "undefined") return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

        const seen = new WeakSet<Element>();

        const io = new IntersectionObserver(
            (entries) => {
                let n = 0;
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target as HTMLElement;
                    io.unobserve(el);
                    el.style.transitionDelay = `${Math.min(n++, 5) * 70}ms`;
                    el.classList.add("nb-revealed");
                    // Hand transforms back to the element's own classes once it has landed.
                    setTimeout(() => {
                        el.classList.remove("nb-reveal", "nb-revealed");
                        el.style.transitionDelay = "";
                    }, 900);
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
        );

        const scan = () => {
            root.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
                if (seen.has(el)) return;
                seen.add(el);
                // Only one level: skip cards nested in a card that is already revealing, and anything floating.
                if (el.parentElement?.closest(".nb-reveal")) return;
                if (el.closest(".fixed, [role='dialog']")) return;
                // Content already on screen just shows; only things below the fold make an entrance.
                if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
                el.classList.add("nb-reveal");
                io.observe(el);
            });
        };

        let raf = 0;
        const mo = new MutationObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(scan);
        });
        scan();
        mo.observe(root, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(raf);
            mo.disconnect();
            io.disconnect();
            root.querySelectorAll(".nb-reveal").forEach((el) => el.classList.remove("nb-reveal", "nb-revealed"));
        };
    }, [rootId, pathname]);

    return null;
}
