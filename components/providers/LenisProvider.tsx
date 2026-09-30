"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

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
        });

        lenisRef.current = lenis;

        let animId = 0;
        function raf(time: number) {
            lenis.raf(time);
            animId = requestAnimationFrame(raf);
        }

        animId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animId);
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
