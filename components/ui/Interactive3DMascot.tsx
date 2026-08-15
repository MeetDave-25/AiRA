"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, MessageSquare, Volume2, VolumeX, Shield, Radio, ArrowRight, CornerRightDown } from "lucide-react";
import { ErrorBoundary } from "./ErrorBoundary";
import { playJarvisChime, playJarvisBlip, speakJarvis, stopSpeaking } from "@/lib/audio";

// Dynamically import the Three.js 3D Wolf canvas with SSR disabled
const Wolf3DCanvas = dynamic(() => import("@/components/3d/Wolf3DCanvas"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[380px] sm:min-h-[440px] rounded-3xl bg-slate-950/90 border border-sky-500/30 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-sky-400 animate-spin [animation-duration:6s]" />
                <div className="w-8 h-8 rounded-full bg-sky-400/20 border border-sky-400 animate-pulse" />
            </div>
            <p className="mt-4 font-orbitron font-bold text-xs text-sky-300 tracking-wider">
                INITIALIZING 3D NEURAL WOLF...
            </p>
        </div>
    ),
});

interface MascotProps {
    variant?: "hero" | "card" | "compact" | "avatar";
    size?: "sm" | "md" | "lg" | "xl";
    showSpeechBubble?: boolean;
    speechText?: string;
    interactive?: boolean;
    onChatClick?: () => void;
    className?: string;
}

const AIRA_WOLF_FACTS = [
    "Hey there! I'm Mevy, your 3D AI guide for AiRA Lab. Where autonomous intelligence and robotics come to life! 🐺⚡",
    "Did you know? AiRA Lab was established at LJ University to empower young innovators to build breakthrough autonomous robotics and next-gen AI! 🚀",
    "Our 5 Frontier Wings: AI/ML, Autonomous Robotics, Web3/Cloud, Cyber Defense, and Design/Media! 🧠",
    "Over 4,500+ participants and innovators have built real-world projects with us across 28+ hackathons! 🏆",
    "Looking to join the squad or collaborate? Tap 'Chat with Mevy' to explore everything! 🚀",
];

export function Interactive3DMascot({
    variant = "hero",
    size = "lg",
    showSpeechBubble = true,
    speechText,
    interactive = true,
    onChatClick,
    className = "",
}: MascotProps) {
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
    const [sparkleBurst, setSparkleBurst] = useState(false);
    const [voiceMuted, setVoiceMuted] = useState(false);

    const activeSpeech = speechText || AIRA_WOLF_FACTS[currentFactIndex];

    // Handle interactive click on the 3D Wolf
    const handleWolfInteraction = () => {
        playJarvisChime();
        setSparkleBurst(true);
        setTimeout(() => setSparkleBurst(false), 900);

        const nextIndex = (currentFactIndex + 1) % AIRA_WOLF_FACTS.length;
        setCurrentFactIndex(nextIndex);

        const nextSpeech = speechText || AIRA_WOLF_FACTS[nextIndex];

        // If voice audio is enabled, speak with Jarvis AI synthesis
        if (!voiceMuted) {
            setIsSpeakingVoice(true);
            speakJarvis(nextSpeech, () => {
                setIsSpeakingVoice(false);
            });
        }
    };

    const handleOpenChat = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        playJarvisBlip();
        stopSpeaking();
        setIsSpeakingVoice(false);

        if (onChatClick) {
            onChatClick();
        } else if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("open-aira-chat"));
        }
    };

    const toggleVoiceMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSpeakingVoice) {
            stopSpeaking();
            setIsSpeakingVoice(false);
            setVoiceMuted(true);
        } else {
            setVoiceMuted(!voiceMuted);
            if (voiceMuted) {
                // Unmuting: speak current text
                setIsSpeakingVoice(true);
                speakJarvis(activeSpeech, () => setIsSpeakingVoice(false));
            }
        }
    };

    // Auto-cycle dialogue periodically when idle
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isSpeakingVoice) {
                setCurrentFactIndex((prev) => (prev + 1) % AIRA_WOLF_FACTS.length);
            }
        }, 8000);
        return () => clearInterval(timer);
    }, [isSpeakingVoice]);

    // Dimensions map with responsive scaling on mobile
    const sizeClasses = {
        sm: "w-full max-w-[260px] sm:max-w-[280px] h-[300px] sm:h-[340px]",
        md: "w-full max-w-[300px] sm:max-w-[360px] h-[340px] sm:h-[400px]",
        lg: "w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[440px] h-[360px] sm:h-[460px]",
        xl: "w-full max-w-[340px] xs:max-w-[400px] sm:max-w-[520px] h-[380px] sm:h-[500px]",
    }[size];

    return (
        <div className={`relative flex flex-col items-center select-none w-full max-w-full ${className}`}>
            {/* ══ INTERACTIVE 3D SPEECH BUBBLE & VOICE CONTROLS ══ */}
            {showSpeechBubble && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSpeech}
                        initial={{ opacity: 0, y: 14, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.94 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-[400px] mb-3 sm:mb-4 p-3.5 sm:p-4 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-sky-400/40 shadow-[0_10px_35px_rgba(56,189,248,0.25)] text-white relative z-30 pointer-events-auto"
                    >
                        {/* Header: AI Status & Audio Voice Toggle */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-400/20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span className="font-orbitron font-bold text-[10px] sm:text-[11px] tracking-wider text-sky-300">
                                    MEVY 3D WOLF · AI BRIEFING
                                </span>
                            </div>

                            {/* Voice Mute / Speak Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleVoiceMute}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono transition-colors ${
                                    isSpeakingVoice
                                        ? "bg-sky-500/30 border-sky-400 text-sky-200 animate-pulse"
                                        : voiceMuted
                                        ? "bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200"
                                        : "bg-purple-950/60 border-purple-500/40 text-purple-200"
                                }`}
                                title={voiceMuted ? "Enable Voice Audio" : "Voice Active (Tap to Mute)"}
                            >
                                {voiceMuted ? <VolumeX size={11} /> : <Volume2 size={11} className={isSpeakingVoice ? "animate-bounce" : ""} />}
                                <span>{voiceMuted ? "Voice Off" : isSpeakingVoice ? "Speaking..." : "Voice On"}</span>
                            </button>
                        </div>

                        {/* Speech Content */}
                        <div className="flex items-start gap-2.5">
                            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5 animate-spin [animation-duration:8s]" />
                            <p className="text-xs sm:text-sm font-sans leading-relaxed font-normal text-slate-100">
                                {activeSpeech}
                            </p>
                        </div>

                        {/* Interactive Click Tip & Engage Button */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-[10px]">
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                                <Zap size={10} className="text-amber-400" /> Tap 3D Wolf for more facts
                            </span>

                            <button
                                type="button"
                                onClick={handleOpenChat}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold font-orbitron text-[10px] tracking-wider transition-all shadow-[0_0_12px_rgba(56,189,248,0.4)] hover:scale-105 active:scale-95"
                            >
                                <span>CHAT WITH MEVY</span>
                                <ArrowRight size={11} />
                            </button>
                        </div>

                        {/* Speech Bubble Pointer */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-b border-r border-sky-400/40 transform rotate-45" />
                    </motion.div>
                </AnimatePresence>
            )}

            {/* ══ MAIN 3D WOLF CANVAS CONTAINER WITH GSAP SMOOTH DRAG INERTIA ══ */}
            <div className={`relative ${sizeClasses}`}>
                <ErrorBoundary>
                    <Wolf3DCanvas
                        onWolfClick={handleWolfInteraction}
                        interactive={interactive}
                        className="w-full h-full"
                        showControls={true}
                    />
                </ErrorBoundary>

                {/* Celebratory Sparkle Burst on Click */}
                {sparkleBurst && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                        <div className="w-32 h-32 rounded-full bg-sky-400/30 blur-2xl animate-ping" />
                    </div>
                )}
            </div>

            {/* ══ ENGAGE MEVY QUICK ACTION BUTTON ══ */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={handleOpenChat}
                    className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500/20 via-purple-600/30 to-indigo-600/20 hover:bg-sky-500/30 border border-sky-400/50 hover:border-sky-400 text-white text-xs font-orbitron font-bold tracking-wider transition-all shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:scale-105 active:scale-95"
                >
                    <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <MessageSquare size={14} className="text-sky-300 group-hover:rotate-12 transition-transform" />
                    <span>LAUNCH MEVY AI GUIDE</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

export default Interactive3DMascot;
