"use client";

import React from "react";
import { motion } from "framer-motion";

export function HeroKineticTitle() {
    const airaLetters = ["A", "i", "R", "A"];
    const labLetters = ["L", "a", "b", "s"];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
            },
        },
    };

    const letterVariants = {
        hidden: {
            opacity: 0,
            y: 45,
            rotateX: -85,
            filter: "blur(14px)",
            scale: 0.85,
        },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            scale: 1,
            transition: {
                type: "spring",
                damping: 14,
                stiffness: 140,
            },
        },
    };

    return (
        <div className="flex flex-col items-start w-full max-w-full">
            {/* ══ 1. TOP KINETIC STATUS PILL ══ */}
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex max-w-full items-center gap-1.5 sm:gap-2.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full glass border border-sky-400/30 text-slate-200 text-[9px] xs:text-[10px] sm:text-xs font-semibold mt-1 sm:mt-3 mb-4 sm:mb-6 font-orbitron tracking-wider sm:tracking-widest bg-slate-950/80 backdrop-blur-xl shadow-[0_0_25px_rgba(56,189,248,0.2)] select-none relative overflow-hidden group"
            >
                {/* Glowing Laser Scan Across Pill */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/20 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />

                <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                </span>
                <span className="text-white tracking-[0.08em] sm:tracking-[0.2em] truncate">INNOVATION · RESEARCH · IMPACT</span>
                <span className="text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 shrink-0">
                    v3.4
                </span>
            </motion.div>

            {/* ══ 2. 3D KINETIC TITLE: "AiRA Labs" (Letter-by-Letter Cascading Animation) ══ */}
            <motion.h1
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="font-orbitron font-black text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] tracking-tight mb-3 sm:mb-6 select-none perspective-[1000px] w-full"
            >
                {/* Line 1: AiRA */}
                <div className="flex items-center overflow-hidden py-1">
                    {airaLetters.map((char, index) => (
                        <motion.span
                            key={`aira-${index}`}
                            variants={letterVariants}
                            whileHover={{
                                y: -6,
                                scale: 1.06,
                                transition: { type: "spring", stiffness: 300 },
                            }}
                            className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] cursor-default transition-all duration-200"
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                {/* Line 2: Labs (With Cyan/Ice Blue Holographic Flare) */}
                <div className="flex items-center overflow-hidden py-0.5 sm:py-1 mt-0.5 sm:mt-1">
                    {labLetters.map((char, index) => (
                        <motion.span
                            key={`lab-${index}`}
                            variants={letterVariants}
                            whileHover={{
                                y: -6,
                                scale: 1.08,
                                transition: { type: "spring", stiffness: 300 },
                            }}
                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-400 to-cyan-300 filter drop-shadow-[0_0_35px_rgba(56,189,248,0.7)] cursor-default transition-all duration-200"
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>
            </motion.h1>
        </div>
    );
}

export default HeroKineticTitle;
