"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface LandingLogoRevealProps {
    onComplete?: () => void;
    forceShow?: boolean;
}

export function LandingLogoReveal({ onComplete, forceShow = false }: LandingLogoRevealProps) {
    const [isVisible, setIsVisible] = useState<boolean | null>(null);
    const [isEnding, setIsEnding] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [showSkipHint, setShowSkipHint] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!forceShow) {
            const hasSeen = sessionStorage.getItem("aira_landing_reveal_seen");
            if (hasSeen === "true") {
                setIsVisible(false);
                if (onComplete) onComplete();
                return;
            }
        }
        setIsVisible(true);
    }, [forceShow, onComplete]);

    // Handle seamless unmuted music playback with graceful autoplay fallback
    const startPlayback = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = 1.0;
        video.volume = 1.0;
        video.muted = false;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsMuted(false);
                    setIsVideoReady(true);
                })
                .catch(() => {
                    // Browser autoplay policy prevented unmuted sound -> start muted
                    if (video) {
                        video.muted = true;
                        setIsMuted(true);
                        video.play()
                            .then(() => setIsVideoReady(true))
                            .catch(() => setIsVideoReady(true));
                    }
                });
        }
    }, []);

    useEffect(() => {
        if (isVisible && videoRef.current) {
            const video = videoRef.current;
            if (video.readyState >= 3) {
                startPlayback();
            }
        }
    }, [isVisible, startPlayback]);

    // Show subtle controls on user interaction
    const handleUserInteraction = () => {
        setShowSkipHint(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setShowSkipHint(false);
        }, 4000);
    };

    // Toggle sound on / off
    const handleToggleSound = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            const nextMuted = !isMuted;
            videoRef.current.muted = nextMuted;
            if (!nextMuted) {
                videoRef.current.volume = 1.0;
                videoRef.current.play().catch(() => {});
            }
            setIsMuted(nextMuted);
        }
    };

    // Global tap anywhere on screen un-mutes if currently muted, otherwise skips
    const handleScreenClick = () => {
        if (isMuted && videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.volume = 1.0;
            setIsMuted(false);
            return;
        }
        finishReveal();
    };

    // Keyboard listener for Escape/Space to skip, 'M' to mute/unmute
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" || e.key === " ") {
                finishReveal();
            } else if (e.key === "m" || e.key === "M") {
                if (videoRef.current) {
                    const nextMuted = !videoRef.current.muted;
                    videoRef.current.muted = nextMuted;
                    setIsMuted(nextMuted);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [isMuted]);

    const finishReveal = () => {
        if (isEnding) return;
        setIsEnding(true);
        sessionStorage.setItem("aira_landing_reveal_seen", "true");

        // Smoothly fade out music volume
        if (videoRef.current && !videoRef.current.muted) {
            let currentVol = videoRef.current.volume;
            fadeIntervalRef.current = setInterval(() => {
                if (videoRef.current && currentVol > 0.1) {
                    currentVol -= 0.15;
                    videoRef.current.volume = Math.max(0, currentVol);
                } else {
                    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                }
            }, 50);
        }

        setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 800);
    };

    if (isVisible === null || isVisible === false) {
        return null;
    }

    return (
        <AnimatePresence>
            {!isEnding && (
                <motion.div
                    key="movie-logo-reveal"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.02,
                        filter: "brightness(1.1) blur(8px)",
                        transition: { duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }
                    }}
                    onMouseMove={handleUserInteraction}
                    onTouchStart={handleUserInteraction}
                    onClick={handleScreenClick}
                    className="fixed inset-0 z-[99999999] bg-black flex items-center justify-center overflow-hidden cursor-pointer select-none touch-manipulation"
                    style={{ minHeight: "-webkit-fill-available", isolation: "isolate" }}
                >
                    {/* ══ FULL SCREEN CINEMATIC VIDEO WITH SMOOTH HARDWARE ACCELERATION ══ */}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
                        <video
                            ref={videoRef}
                            src="/logo_revel.mp4"
                            autoPlay
                            playsInline
                            webkit-playsinline="true"
                            x5-playsinline="true"
                            preload="auto"
                            muted={isMuted}
                            controls={false}
                            disablePictureInPicture
                            disableRemotePlayback
                            onCanPlay={startPlayback}
                            onCanPlayThrough={startPlayback}
                            onLoadedData={() => setIsVideoReady(true)}
                            onEnded={finishReveal}
                            style={{
                                transform: "translate3d(0,0,0)",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                willChange: "transform, opacity",
                            }}
                            className={`w-full h-full object-contain bg-black pointer-events-none transition-opacity duration-500 ${
                                isVideoReady ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    </div>

                    {/* Subtle Cinematic Vignette at extreme edges */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.7)_100%)]" />

                    {/* ══ MUSIC / AUDIO CONTROLLER BADGE (TOP-LEFT / BOTTOM-LEFT) ══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-4 left-4 sm:bottom-8 sm:left-8 sm:top-auto z-40 pointer-events-auto"
                    >
                        <button
                            type="button"
                            onClick={handleToggleSound}
                            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full border backdrop-blur-xl transition-all shadow-xl ${
                                isMuted
                                    ? "bg-amber-500/20 border-amber-400/50 text-amber-300 animate-pulse hover:bg-amber-500/30"
                                    : "bg-black/60 hover:bg-black/80 border-sky-400/40 text-sky-300"
                            }`}
                            title={isMuted ? "Tap to enable music" : "Mute music"}
                        >
                            {isMuted ? (
                                <>
                                    <VolumeX size={15} className="text-amber-400" />
                                    <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wide">
                                        Tap for Sound 🔊
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Volume2 size={15} className="text-sky-400" />
                                    <div className="flex items-center gap-0.5 h-3 px-0.5">
                                        <span className="w-0.5 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-0.5 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-bounce" />
                                        <span className="w-0.5 h-1.5 bg-sky-300 rounded-full animate-bounce [animation-delay:-0.2s]" />
                                    </div>
                                    <span className="text-[11px] sm:text-xs font-mono font-medium tracking-wide text-slate-200">
                                        Music On
                                    </span>
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* ══ MOBILE-FRIENDLY DISCRETE SKIP CONTROL ══ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: showSkipHint ? 1 : 0.6 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 pointer-events-auto"
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                finishReveal();
                            }}
                            className="group flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white text-[11px] sm:text-sm font-mono tracking-wider uppercase backdrop-blur-xl shadow-2xl transition-all cursor-pointer"
                        >
                            <span>Skip</span>
                            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LandingLogoReveal;
