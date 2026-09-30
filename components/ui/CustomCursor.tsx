"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function CustomCursor() {
    const [mounted, setMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [cursorText, setCursorText] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        // Disable on touch devices
        if (window.matchMedia("(pointer: coarse)").matches) return;

        setMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);

            // Check if hovering over interactive elements
            const target = e.target as HTMLElement | null;
            if (target) {
                const interactive = target.closest("a, button, [role='button'], input, textarea, select, .card-3d, .cursor-pointer, [data-cursor]");
                if (interactive) {
                    setIsHovered(true);
                    const customText = interactive.getAttribute("data-cursor-text");
                    setCursorText(customText || "");
                } else {
                    setIsHovered(false);
                    setCursorText("");
                }
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        document.documentElement.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [mouseX, mouseY, isVisible]);

    if (!mounted || !isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none">
            {/* Smooth Trailing Glow Ring */}
            <motion.div
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: isHovered ? 48 : isClicking ? 28 : 34,
                    height: isHovered ? 48 : isClicking ? 28 : 34,
                    backgroundColor: isHovered ? "rgba(56, 189, 248, 0.08)" : "transparent",
                    borderColor: isHovered ? "rgba(56, 189, 248, 0.6)" : "rgba(56, 189, 248, 0.3)",
                    borderWidth: isHovered ? "1.5px" : "1px",
                }}
                transition={{ duration: 0.2 }}
                className="rounded-full border shadow-[0_0_15px_rgba(56,189,248,0.25)] backdrop-blur-[0.5px] flex items-center justify-center"
            >
                {cursorText && (
                    <span className="text-[9px] font-orbitron font-bold text-sky-300 uppercase tracking-wider">
                        {cursorText}
                    </span>
                )}
            </motion.div>

            {/* Instant Center Dot */}
            <motion.div
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isClicking ? 0.6 : isHovered ? 0 : 1,
                    opacity: isHovered ? 0 : 1,
                }}
                transition={{ duration: 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_#38bdf8]"
            />
        </div>
    );
}
