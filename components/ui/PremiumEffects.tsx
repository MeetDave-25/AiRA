"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView, MotionValue } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   1. SPOTLIGHT CARD — Radial light that follows mouse
   ═══════════════════════════════════════════════════════════ */
export function SpotlightCard({
    children,
    className = "",
    spotlightColor = "rgba(0, 212, 255, 0.12)",
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a1a]/80 backdrop-blur-xl transition-colors duration-300 hover:border-white/[0.15] ${className}`}
        >
            {/* Spotlight radial gradient */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`,
                }}
            />
            {/* Shimmer border on hover */}
            <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
                style={{
                    opacity: isHovered ? 1 : 0,
                    background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.06), transparent 60%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   2. MAGNETIC BUTTON — Subtly follows cursor, elastic press
   ═══════════════════════════════════════════════════════════ */
export function MagneticButton({
    children,
    className = "",
    onClick,
    href,
    magnetStrength = 0.3,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    magnetStrength?: number;
}) {
    const btnRef = useRef<HTMLElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { damping: 15, stiffness: 300, mass: 0.2 });
    const springY = useSpring(y, { damping: 15, stiffness: 300, mass: 0.2 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * magnetStrength);
        y.set((e.clientY - centerY) * magnetStrength);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const Tag = href ? motion.a : motion.button;

    return (
        <Tag
            ref={btnRef as any}
            href={href}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center justify-center cursor-pointer select-none ${className}`}
        >
            {children}
        </Tag>
    );
}

/* ═══════════════════════════════════════════════════════════
   3. ANIMATED COUNTER — Counts up from 0 to target value
   ═══════════════════════════════════════════════════════════ */
export function AnimatedCounter({
    value,
    suffix = "",
    duration = 2,
    className = "",
}: {
    value: number;
    suffix?: string;
    duration?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });
    const motionVal = useMotionValue(0);
    const springVal = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        if (isInView) motionVal.set(value);
    }, [isInView, value, motionVal]);

    useEffect(() => {
        const unsubscribe = springVal.on("change", (latest) => {
            setDisplayVal(Math.round(latest));
        });
        return unsubscribe;
    }, [springVal]);

    return (
        <span ref={ref} className={className}>
            {displayVal}{suffix}
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   4. SPLIT TEXT REVEAL — Words/chars animate in staggered
   ═══════════════════════════════════════════════════════════ */
export function SplitText({
    children,
    className = "",
    splitBy = "word",
    delay = 0,
    staggerChildren = 0.04,
}: {
    children: string;
    className?: string;
    splitBy?: "word" | "char";
    delay?: number;
    staggerChildren?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    const items = splitBy === "word" ? children.split(" ") : children.split("");

    return (
        <motion.div
            ref={ref}
            className={`inline-flex flex-wrap ${className}`}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                visible: {
                    transition: { staggerChildren, delayChildren: delay },
                },
                hidden: {},
            }}
        >
            {items.map((item, i) => (
                <motion.span
                    key={i}
                    className="inline-block"
                    variants={{
                        hidden: { opacity: 0, y: 30, rotateX: -60, filter: "blur(8px)" },
                        visible: {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            filter: "blur(0px)",
                            transition: {
                                type: "spring",
                                damping: 20,
                                stiffness: 100,
                            },
                        },
                    }}
                    style={{ transformOrigin: "bottom center" }}
                >
                    {item}{splitBy === "word" ? "\u00A0" : ""}
                </motion.span>
            ))}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   5. GRADIENT MESH BACKGROUND — Morphing animated blobs
   ═══════════════════════════════════════════════════════════ */
export function GradientMesh({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Blob 1 — Cyan */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00D4FF]/[0.08] blur-[120px] animate-blob-1" />
            {/* Blob 2 — Purple */}
            <div className="absolute top-[10%] right-[-15%] w-[55%] h-[55%] rounded-full bg-[#7C3AED]/[0.10] blur-[100px] animate-blob-2" />
            {/* Blob 3 — Magenta */}
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#FF006E]/[0.06] blur-[130px] animate-blob-3" />
            {/* Blob 4 — Deep blue accent */}
            <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-[#1e40af]/[0.08] blur-[100px] animate-blob-4" />
            {/* Noise grain overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-noise" />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   6. AURORA BACKGROUND — Flowing northern lights effect
   ═══════════════════════════════════════════════════════════ */
export function AuroraBackground({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0">
                <div className="aurora-strip aurora-strip-1" />
                <div className="aurora-strip aurora-strip-2" />
                <div className="aurora-strip aurora-strip-3" />
            </div>
            <div className="absolute inset-0 opacity-[0.025] bg-noise" />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   7. FLOATING PARTICLES — Lightweight GPU-accelerated dots
   ═══════════════════════════════════════════════════════════ */
export function FloatingParticles({
    count = 30,
    className = "",
}: {
    count?: number;
    className?: string;
}) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
        duration: 8 + Math.random() * 16,
        delay: Math.random() * 8,
        opacity: 0.15 + Math.random() * 0.35,
    }));

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-aira-cyan"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        opacity: p.opacity,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 15, -10, 0],
                        opacity: [p.opacity, p.opacity * 1.8, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   8. SCROLL REVEAL — Smooth entrance on scroll
   ═══════════════════════════════════════════════════════════ */
export function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
}) {
    const initial = {
        up: { opacity: 0, y: 50 },
        down: { opacity: 0, y: -50 },
        left: { opacity: 0, x: -60 },
        right: { opacity: 0, x: 60 },
    }[direction];

    return (
        <motion.div
            className={className}
            initial={initial}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
                duration: 0.7,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   9. SHIMMER BORDER — Animated gradient border
   ═══════════════════════════════════════════════════════════ */
export function ShimmerBorder({
    children,
    className = "",
    borderRadius = "1rem",
}: {
    children: React.ReactNode;
    className?: string;
    borderRadius?: string;
}) {
    return (
        <div className={`relative group ${className}`}>
            {/* Animated gradient border */}
            <div
                className="absolute -inset-[1px] rounded-[inherit] bg-gradient-to-r from-aira-cyan via-aira-purple to-aira-magenta opacity-30 group-hover:opacity-70 transition-opacity duration-500 blur-[1px] animate-shimmer-border"
                style={{ borderRadius }}
            />
            <div
                className="relative bg-[#080816] rounded-[inherit]"
                style={{ borderRadius }}
            >
                {children}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   10. VIDEO HERO BACKGROUND — Cinematic fullscreen video bg
   ═══════════════════════════════════════════════════════════ */
export function VideoHeroBackground({
    className = "",
}: {
    className?: string;
}) {
    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Simulated 3D video background using animated gradient mesh */}
            <div className="absolute inset-0 bg-[#020817]">
                <GradientMesh />
                <AuroraBackground />
                <FloatingParticles count={40} />
            </div>
            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-30" />
            {/* Bottom vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-[#020817]/60" />
            {/* Side vignettes */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/40 via-transparent to-[#020817]/40" />
        </div>
    );
}
