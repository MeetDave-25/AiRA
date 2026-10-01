"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

/** True when the wheel/touch started inside something that should scroll on its own (modals, drawers, lists). */
function insideOwnScroller(node: HTMLElement | null) {
    for (let el = node; el && el !== document.body; el = el.parentElement) {
        if (el.hasAttribute("data-lenis-prevent") || el.getAttribute("role") === "dialog" || el.getAttribute("aria-modal") === "true") return true;
        const style = getComputedStyle(el);
        const scrollsY = /(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
        if (scrollsY) return true;
        if (style.position === "fixed") return true; // overlays and popups
    }
    return false;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            // Let modals, drawers and inner lists scroll natively instead of moving the page behind them.
            prevent: (node) => insideOwnScroller(node as HTMLElement),
        });

        lenisRef.current = lenis;

        // When something locks the page (body overflow hidden), pause smooth scrolling so nothing drifts or sticks.
        const syncLock = () => {
            const locked = document.body.style.overflow === "hidden" || document.documentElement.style.overflow === "hidden";
            if (locked) lenis.stop();
            else lenis.start();
        };
        const mo = new MutationObserver(syncLock);
        mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

        let animId = 0;
        function raf(time: number) {
            lenis.raf(time);
            animId = requestAnimationFrame(raf);
        }

        animId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animId);
            mo.disconnect();
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
    }, [pathname]);

    return <>{children}</>;
}
