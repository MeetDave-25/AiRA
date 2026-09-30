"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Volume2, VolumeX, Radio, Compass, Eye } from "lucide-react";

// Dynamic import of 3D Canvas for client-side WebGL rendering
const VRMuseumCanvas = dynamic(() => import("@/components/3d/VRMuseumCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-[#030712] flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl border border-sky-400/50 flex items-center justify-center animate-spin mb-4">
                <Sparkles size={24} className="text-sky-400" />
            </div>
            <p className="font-orbitron font-bold text-white text-sm tracking-wider">
                INITIALIZING VR MUSEUM ENVIRONMENT...
            </p>
            <p className="text-xs text-sky-400/70 font-mono mt-1">Calibrating 3D Neural Assets</p>
        </div>
    ),
});

const EXHIBIT_ZONES = [
    { title: "Mascot Guardian Pod", subtitle: "AiRA 3D Cyber Mascot", color: "#00D4FF" },
    { title: "Neural Intelligence Core", subtitle: "Deep Learning & Vision AI", color: "#8B5CF6" },
    { title: "Robotics & Hardware Delta", subtitle: "ROS2 & Swarm Kinematics", color: "#10B981" },
    { title: "Hall of Championships", subtitle: "National Hackathon Trophies", color: "#F59E0B" },
    { title: "Grand Singularity Portal", subtitle: "Frontier Entryway", color: "#00D4FF" },
];

export interface VRMuseumPreloaderProps {
    onComplete?: () => void;
    forceShow?: boolean;
}

export function VRMuseumPreloader({ onComplete, forceShow = false }: VRMuseumPreloaderProps) {
    const [isVisible, setIsVisible] = useState<boolean | null>(null);
    const [currentZone, setCurrentZone] = useState<number>(0);
    const [reachedPortal, setReachedPortal] = useState<boolean>(false);
    const [isEntering, setIsEntering] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [flashActive, setFlashActive] = useState<boolean>(false);

    useEffect(() => {
        if (!forceShow) {
            // Disabled auto-showing to drastically improve initial page load performance.
            // It will only show if the user explicitly clicks the 3D VR Tour button (forceShow = true).
            setIsVisible(false);
            if (onComplete) onComplete();
            return;
        }
        setIsVisible(true);
    }, [forceShow, onComplete]);

    const handleSkip = useCallback(() => {
        sessionStorage.setItem("aira_museum_vr_seen", "true");
        setIsVisible(false);
        if (onComplete) onComplete();
    }, [onComplete]);

    const handleEnterWorld = () => {
        setIsEntering(true);
        // Trigger hyperdrive warp flash
        setTimeout(() => {
            setFlashActive(true);
        }, 600);
    };

    const handleEnterComplete = () => {
        sessionStorage.setItem("aira_museum_vr_seen", "true");
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (isVisible === false || isVisible === null) return null;

    const zoneInfo = EXHIBIT_ZONES[currentZone] || EXHIBIT_ZONES[0];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="fixed inset-0 z-[99999999] bg-[#030712] overflow-hidden select-none font-sans"
            >
                {/* 3D WebGL VR Museum Scene */}
                <div className="absolute inset-0 z-0">
                    <VRMuseumCanvas
                        isEntering={isEntering}
                        onReachPortal={() => setReachedPortal(true)}
                        onEnterComplete={handleEnterComplete}
                        onZoneChange={(idx) => setCurrentZone(idx)}
                    />
                </div>

                {/* Cyber Scanline & Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(3,7,18,0.7)_100%)]" />

                {/* ═══════════════════════════════════════════════════════════
                   HUD HEADER (BADGE, ZONE INDICATOR, SKIP)
                   ═══════════════════════════════════════════════════════════ */}
                <div className="absolute top-0 inset-x-0 z-20 p-4 sm:p-6 md:p-8 flex items-start justify-between pointer-events-none">
                    {/* Left: Lab Badge & Current Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2 pointer-events-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-xl border border-sky-400/30 text-sky-300 text-xs font-orbitron font-bold shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                            <Radio size={12} className="text-sky-400 animate-pulse" />
                            <span>AiRA 3D VR MUSEUM</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        <div className="glass px-4 py-2 rounded-2xl border border-white/10 max-w-xs shadow-xl">
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                <span>ZONE 0{currentZone + 1} / 05</span>
                                <span>•</span>
                                <span style={{ color: zoneInfo.color }}>LIVE TELEMETRY</span>
                            </div>
                            <h3 className="font-orbitron font-bold text-sm text-white truncate">
                                {zoneInfo.title}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">
                                {zoneInfo.subtitle}
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: VR Look Hint & Skip Tour Button */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 pointer-events-auto"
                    >
                        {/* VR Look Hint */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono">
                            <Eye size={13} className="text-sky-400" />
                            <span>Drag mouse to look around</span>
                        </div>

                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-orbitron text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
                        >
                            Skip Tour →
                        </button>
                    </motion.div>
                </div>

                {/* ═══════════════════════════════════════════════════════════
                   BOTTOM PROGRESS BAR & ZONE INDICATORS
                   ═══════════════════════════════════════════════════════════ */}
                {!reachedPortal && (
                    <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 z-20 flex flex-col items-center pointer-events-none">
                        <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between gap-2 shadow-2xl">
                            {EXHIBIT_ZONES.map((zone, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div
                                        className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                                            i <= currentZone
                                                ? "bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_10px_#38bdf8]"
                                                : "bg-white/10"
                                        }`}
                                    />
                                    <span className={`text-[9px] font-mono ${i === currentZone ? "text-sky-300 font-bold" : "text-slate-500"}`}>
                                        0{i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                   CLIMAX MODAL: "WANT TO ENTER THIS WORLD?"
                   ═══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {reachedPortal && !isEntering && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-x-4 sm:inset-x-0 bottom-12 sm:bottom-16 z-30 flex items-center justify-center pointer-events-auto"
                        >
                            <div className="max-w-lg w-full text-center glass-strong p-6 sm:p-8 rounded-3xl border-2 border-sky-400/60 shadow-[0_0_60px_rgba(56,189,248,0.35)] relative overflow-hidden backdrop-blur-2xl">
                                <div className="absolute inset-0 bg-gradient-radial from-sky-400/20 via-indigo-500/10 to-transparent pointer-events-none" />

                                <div className="relative z-10 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/15 border border-sky-400/40 text-sky-300 text-xs font-orbitron font-bold uppercase tracking-widest">
                                        <Sparkles size={13} className="text-cyan-300 animate-pulse" />
                                        Singularity Gateway Active
                                    </div>

                                    <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                                        WANT TO ENTER <br />
                                        <span className="gradient-text">THIS WORLD?</span>
                                    </h2>

                                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-sm mx-auto">
                                        Step inside the innovation laboratory pioneering autonomous intelligence, robotics, and next-gen distributed systems.
                                    </p>

                                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleEnterWorld}
                                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-white text-slate-950 font-orbitron font-black text-sm tracking-wider hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xl"
                                        >
                                            <span>ENTER THE WORLD</span>
                                            <ArrowRight size={18} />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════════════════
                   HYPERDRIVE WARP LIGHT FLASH OVERLAY
                   ═══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {flashActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="fixed inset-0 z-[999999999] bg-gradient-to-t from-white via-sky-200 to-white pointer-events-none"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
}

export default VRMuseumPreloader;
