"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Volume2, VolumeX, FastForward, RotateCcw, Zap, Sparkles } from "lucide-react";
import { speakJarvis } from "@/lib/audio";

// Preload 3D Wolf model
if (typeof window !== "undefined") {
    useGLTF.preload("/wolf.glb");
}

// Web Audio API Synthesizer for futuristic cyber chimes
function playCyberBeep(freq = 440, type: OscillatorType = "sine", duration = 0.08, vol = 0.15) {
    if (typeof window === "undefined") return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio policy ignore
    }
}

const NOTE_FREQS: Record<string, number> = {
    C4: 261.63,
    E4: 329.63,
    G4: 392.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    G5: 783.99,
    A5: 880.0,
    B5: 987.77,
    C6: 1046.5,
    E6: 1318.51,
};

function playNote(note: string, duration = 0.08, type: OscillatorType = "sine", vol = 0.15) {
    const freq = NOTE_FREQS[note] || 440;
    playCyberBeep(freq, type, duration, vol);
}

function playSuccessChord() {
    playNote("C5", 0.35, "triangle", 0.18);
    setTimeout(() => playNote("E5", 0.35, "triangle", 0.18), 70);
    setTimeout(() => playNote("G5", 0.45, "sine", 0.22), 140);
    setTimeout(() => playNote("C6", 0.6, "sine", 0.25), 210);
}

// ══════════════════════════════════════════════════════════════════
// 3D WOLF MASCOT (MEVY) SCENE WITH EXACT CINEMATIC SEQUENCE:
// 1. WOLF COMES FROM TOP (Drops down & lands with impact)
// 2. CAMERA ZOOMS ONTO WOLF'S FACE (Close-up)
// 3. IN THAT ZOOM, 360° SPIN IN AIR
// 4. AIRA LABS REVEAL (Camera pulls back, wings & logo burst)
// 5. WOLF FACE FINAL CLOSE-UP ➔ FADE TO BLACK
// 6. LOGIN SCREEN WITH VOICE: "Welcome to AiRA Lab"
// ══════════════════════════════════════════════════════════════════
interface PreloaderWolfProps {
    currentStep: number; // 0 = Entry from top, 1 = Zoom Face, 2 = 360 Spin in Zoom, 3 = AiRA LABS Climax, 4 = Final Face Cut
}

function Preloader3DWolfScene({ currentStep }: PreloaderWolfProps) {
    const { camera } = useThree();
    const gltf = useGLTF("/wolf.glb");
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        if (gltf.scene) {
            gltf.scene.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    if (mesh.material) {
                        const mat = mesh.material as THREE.MeshStandardMaterial;
                        mat.roughness = Math.min(mat.roughness, 0.65);
                        mat.metalness = Math.max(mat.metalness, 0.2);
                        mat.envMapIntensity = 1.4;
                    }
                }
            });
        }
    }, [gltf]);

    // Exact Choreographed Camera & 3D Wolf Actions with safe framing margins
    useEffect(() => {
        if (!groupRef.current) return;

        if (currentStep === 0) {
            // ═══════════════════════════════════════════════════════════
            // 1. WOLF COMES FROM TOP (Dramatic drop from sky & land)
            // ═══════════════════════════════════════════════════════════
            gsap.fromTo(
                groupRef.current.position,
                { y: 4.5, z: -0.4 },
                { y: 0, z: 0, duration: 0.95, ease: "bounce.out" }
            );
            gsap.fromTo(
                groupRef.current.scale,
                { x: 0.35, y: 0.35, z: 0.35 },
                { x: 1, y: 1, z: 1, duration: 0.95, ease: "power2.out" }
            );
            gsap.fromTo(
                groupRef.current.rotation,
                { y: -0.8, x: 0.3 },
                { y: -0.3, x: 0, duration: 0.95, ease: "power2.out" }
            );
            gsap.to(camera.position, { x: 0, y: 0.05, z: 3.4, duration: 0.8, ease: "power2.out" });
        } else if (currentStep === 1) {
            // ═══════════════════════════════════════════════════════════
            // 2. ZOOM ON FACE (Close-up on Wolf's head with full ear clearance)
            // ═══════════════════════════════════════════════════════════
            gsap.to(groupRef.current.rotation, { y: 0.05, x: -0.04, duration: 0.75, ease: "power2.out" });
            // Camera zooms with generous breathing room so face & ears are never cut
            gsap.to(camera.position, { x: 0, y: 0.28, z: 2.15, duration: 0.85, ease: "power3.inOut" });
            gsap.fromTo(
                groupRef.current.scale,
                { x: 0.96, y: 0.96, z: 0.96 },
                { x: 1, y: 1, z: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" }
            );
        } else if (currentStep === 2) {
            // ═══════════════════════════════════════════════════════════
            // 3. IN THAT ZOOM, 360° SPIN (High-speed 360 spin in face zoom)
            // ═══════════════════════════════════════════════════════════
            gsap.to(camera.position, { x: 0, y: 0.26, z: 2.2, duration: 0.3, ease: "power2.out" });
            // 360 degree spin right inside the zoom
            gsap.to(groupRef.current.rotation, {
                y: `+=${Math.PI * 2}`,
                duration: 0.85,
                ease: "power2.inOut",
            });
            gsap.fromTo(
                groupRef.current.scale,
                { x: 0.95, y: 0.95, z: 0.95 },
                { x: 1.05, y: 1.05, z: 1.05, duration: 0.85, ease: "elastic.out(1.1, 0.4)" }
            );
        } else if (currentStep === 3) {
            // ═══════════════════════════════════════════════════════════
            // 4. AIRA LABS REVEAL (Camera pulls back, hero stance)
            // ═══════════════════════════════════════════════════════════
            gsap.to(camera.position, { x: 0, y: 0.05, z: 3.4, duration: 0.7, ease: "power2.out" });
            gsap.to(groupRef.current.rotation, { y: -0.15, x: 0, duration: 0.8, ease: "back.out(1.8)" });
            gsap.to(groupRef.current.position, { y: 0, z: 0, duration: 0.6, ease: "power2.out" });
            gsap.fromTo(
                groupRef.current.scale,
                { x: 0.9, y: 0.9, z: 0.9 },
                { x: 1.12, y: 1.12, z: 1.12, duration: 0.75, ease: "elastic.out(1.2, 0.4)" }
            );
        } else if (currentStep === 4) {
            // ═══════════════════════════════════════════════════════════
            // 5. WOLF FACE FINAL CLOSE-UP BEFORE FADE TO BLACK
            // ═══════════════════════════════════════════════════════════
            gsap.to(groupRef.current.rotation, { y: 0, x: 0, duration: 0.5, ease: "power2.out" });
            gsap.to(camera.position, { x: 0, y: 0.28, z: 1.85, duration: 0.6, ease: "power2.in" });
        }
    }, [currentStep, camera]);

    // Continuous subtle floating breathing bob
    useFrame((state) => {
        if (groupRef.current && currentStep !== 2 && currentStep !== 0) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.03;
        }
    });

    // Dynamic color shifting for pedestal
    const lightColors = ["#38BDF8", "#C084FC", "#FB7185", "#00D4FF", "#38BDF8"];
    const activeColor = lightColors[currentStep] || lightColors[0];

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Centered Wolf with safe scale margin */}
            <Center position={[0, 0.03, 0]}>
                <primitive object={gltf.scene} scale={1.12} />
            </Center>

            {/* Glowing Holographic Base Platform */}
            <mesh position={[0, -0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.95, 32]} />
                <meshBasicMaterial color={activeColor} transparent opacity={0.45} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.95, 32]} />
                <meshBasicMaterial color="#070b1a" transparent opacity={0.7} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

// ══════════════════════════════════════════════════════════════════
// 3-STAGE CHARACTER ROLLING SLOTS DATA:
// Stage 1: INNOVATION (10 chars)
// Stage 2:  RESEARCH  (10 chars: · R E S E A R C H ·)
// Stage 3:   IMPACT   (10 chars: · · I M P A C T ⚡ ·)
// ══════════════════════════════════════════════════════════════════
const topCharSlots = [
    { c1: "I", c1Class: "text-sky-400", c2: "·", c2Class: "text-purple-500/20", c3: "·", c3Class: "text-pink-500/20" },
    { c1: "N", c1Class: "text-sky-400", c2: "R", c2Class: "text-purple-300", c3: "·", c3Class: "text-pink-500/20" },
    { c1: "N", c1Class: "text-sky-300", c2: "E", c2Class: "text-purple-300", c3: "I", c3Class: "text-pink-400" },
    { c1: "O", c1Class: "text-white", c2: "S", c2Class: "text-white", c3: "M", c3Class: "text-pink-300" },
    { c1: "V", c1Class: "text-white", c2: "E", c2Class: "text-white", c3: "P", c3Class: "text-white" },
    { c1: "A", c1Class: "text-white", c2: "A", c2Class: "text-white", c3: "A", c3Class: "text-white" },
    { c1: "T", c1Class: "text-sky-300", c2: "R", c2Class: "text-purple-300", c3: "C", c3Class: "text-pink-300" },
    { c1: "I", c1Class: "text-sky-400", c2: "C", c2Class: "text-purple-300", c3: "T", c3Class: "text-pink-400" },
    { c1: "O", c1Class: "text-sky-400", c2: "H", c2Class: "text-purple-400", c3: "⚡", c3Class: "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" },
    { c1: "N", c1Class: "text-sky-400", c2: "·", c2Class: "text-purple-500/20", c3: "·", c3Class: "text-pink-500/20" },
];

const STAGE_SUBTITLES = [
    { text: "01 · A NEW MIND · NEURAL INTELLIGENCE", color: "text-sky-300 border-sky-400/30 bg-sky-950/60" },
    { text: "02 · A NEW ENERGY · ROBOTICS & HARDWARE", color: "text-purple-300 border-purple-500/30 bg-purple-950/60" },
    { text: "03 · A NEW IMPACT · 4,500+ INNOVATORS", color: "text-pink-300 border-pink-500/30 bg-pink-950/60" },
];

export interface AiraLoginPreloaderProps {
    onComplete?: () => void;
    autoStart?: boolean;
}

export function AiraLoginPreloader({ onComplete, autoStart = true }: AiraLoginPreloaderProps) {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isFadeToBlack, setIsFadeToBlack] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const blackOverlayRef = useRef<HTMLDivElement>(null);
    const ambientGlowCyan = useRef<HTMLDivElement>(null);
    const ambientGlowPurple = useRef<HTMLDivElement>(null);
    const ambientGlowPink = useRef<HTMLDivElement>(null);
    const logoSceneRef = useRef<HTMLDivElement>(null);
    const presentsSceneRef = useRef<HTMLDivElement>(null);
    const airaTitleRef = useRef<HTMLHeadingElement>(null);
    const wingsRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLParagraphElement>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    const playSound = (note: string, duration = 0.08, type: OscillatorType = "sine", vol = 0.15) => {
        if (soundEnabled) {
            playNote(note, duration, type, vol);
        }
    };

    const handleSkip = () => {
        if (timelineRef.current) {
            timelineRef.current.kill();
        }
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                opacity: 0,
                scale: 1.04,
                duration: 0.4,
                ease: "power2.inOut",
                onComplete: () => {
                    setIsFinished(true);
                    if (soundEnabled) {
                        setTimeout(() => {
                            speakJarvis("Welcome to AiRA Lab");
                        }, 250);
                    }
                    if (onComplete) onComplete();
                },
            });
        } else {
            setIsFinished(true);
            if (soundEnabled) {
                setTimeout(() => {
                    speakJarvis("Welcome to AiRA Lab");
                }, 250);
            }
            if (onComplete) onComplete();
        }
    };

    const startAnimation = () => {
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        setCurrentStepIndex(0);
        setIsFadeToBlack(false);
        if (blackOverlayRef.current) {
            blackOverlayRef.current.style.opacity = "0";
        }
        if (logoSceneRef.current) {
            logoSceneRef.current.style.display = "flex";
            logoSceneRef.current.style.opacity = "1";
        }
        if (presentsSceneRef.current) {
            presentsSceneRef.current.style.display = "none";
        }

        // Reset track positions
        gsap.set(".aira-slot-track", { yPercent: 0 });

        // Reset glow
        if (ambientGlowCyan.current && ambientGlowPurple.current && ambientGlowPink.current) {
            ambientGlowCyan.current.style.opacity = "0.9";
            ambientGlowPurple.current.style.opacity = "0";
            ambientGlowPink.current.style.opacity = "0";
        }

        const tl = gsap.timeline();
        timelineRef.current = tl;

        // ═══════════════════════════════════════════════════════════
        // PHASE 1: WOLF DROPS FROM TOP & INNOVATION
        // ═══════════════════════════════════════════════════════════
        tl.fromTo(
            "#topRollSlotsContainer .aira-roll-window",
            { opacity: 0, y: 35, rotateX: -70 },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.65,
                stagger: 0.04,
                ease: "back.out(1.8)",
                onStart: () => playSound("G4", 0.08, "triangle", 0.15),
            },
            0.2
        );

        tl.fromTo(
            "#stageSubtitlePill",
            { opacity: 0, scale: 0.88, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" },
            0.45
        );

        // Linger on INNOVATION (1.1s)
        tl.to({}, { duration: 1.1 });

        // ═══════════════════════════════════════════════════════════
        // TRANSITION 1 -> 2: ZOOM ON FACE & RESEARCH
        // ═══════════════════════════════════════════════════════════
        if (ambientGlowCyan.current && ambientGlowPurple.current) {
            tl.to(ambientGlowCyan.current, { opacity: 0.1, duration: 0.6 }, "-=0.2");
            tl.to(ambientGlowPurple.current, { opacity: 0.95, duration: 0.6 }, "<");
        }

        // Trigger Step 1 (Face Zoom)
        tl.call(() => setCurrentStepIndex(1), [], "-=0.2");

        // Roll top slots to position 2 (-33.33%)
        topCharSlots.forEach((_, idx) => {
            tl.to(
                `.aira-track-${idx}`,
                {
                    yPercent: -33.333,
                    duration: 0.6,
                    ease: "back.inOut(1.8)",
                    onStart: () => {
                        if (idx % 2 === 0) playSound("E5", 0.06, "triangle", 0.12);
                    },
                },
                `-=${idx === 0 ? 0.5 : 0.54}`
            );
        });

        // Linger on RESEARCH Face Close-Up (1.1s)
        tl.to({}, { duration: 1.1 });

        // ═══════════════════════════════════════════════════════════
        // TRANSITION 2 -> 3: IN THAT ZOOM, 360° SPIN & IMPACT ⚡
        // ═══════════════════════════════════════════════════════════
        if (ambientGlowPurple.current && ambientGlowPink.current) {
            tl.to(ambientGlowPurple.current, { opacity: 0.1, duration: 0.6 });
            tl.to(ambientGlowPink.current, { opacity: 0.95, duration: 0.6 }, "<");
        }

        // Trigger Step 2 (360 Spin in Zoom)
        tl.call(() => setCurrentStepIndex(2), [], "-=0.2");

        // Roll top slots to position 3 (-66.66%)
        topCharSlots.forEach((_, idx) => {
            tl.to(
                `.aira-track-${idx}`,
                {
                    yPercent: -66.666,
                    duration: 0.6,
                    ease: "back.out(2)",
                    onStart: () => {
                        if (idx % 2 === 0) playSound("A5", 0.06, "sine", 0.14);
                    },
                },
                `-=${idx === 0 ? 0.5 : 0.54}`
            );
        });

        // Linger on IMPACT Spin (1.1s)
        tl.to({}, { duration: 1.1 });

        // ═══════════════════════════════════════════════════════════
        // TRANSITION 3 -> 4: AIRA LABS CLIMAX
        // ═══════════════════════════════════════════════════════════
        if (ambientGlowPink.current && ambientGlowCyan.current) {
            tl.to(ambientGlowPink.current, { opacity: 0.1, duration: 0.6 });
            tl.to(ambientGlowCyan.current, { opacity: 0.95, duration: 0.6 }, "<");
        }

        if (logoSceneRef.current) {
            tl.to(
                logoSceneRef.current,
                {
                    duration: 0.45,
                    opacity: 0,
                    y: -20,
                    scale: 0.94,
                    ease: "power2.in",
                    onComplete: () => {
                        if (logoSceneRef.current) logoSceneRef.current.style.display = "none";
                        if (presentsSceneRef.current) presentsSceneRef.current.style.display = "flex";
                        setCurrentStepIndex(3);
                    },
                },
                "<"
            );
        }

        if (presentsSceneRef.current) {
            tl.fromTo(
                presentsSceneRef.current,
                { opacity: 0, scale: 0.88 },
                { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" }
            );
        }

        if (airaTitleRef.current) {
            tl.fromTo(
                airaTitleRef.current,
                { opacity: 0, scale: 0.62, filter: "blur(16px)" },
                {
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.85,
                    ease: "elastic.out(1.1, 0.45)",
                    onStart: () => {
                        if (soundEnabled) playSuccessChord();
                    },
                },
                "-=0.2"
            );
        }

        // 4 Frontier Wings chips reveal
        if (wingsRef.current) {
            tl.fromTo(
                wingsRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
                "-=0.3"
            );
        }

        if (taglineRef.current) {
            tl.fromTo(
                taglineRef.current,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
                "-=0.2"
            );
        }

        // Linger on AiRA LABS climax (1.2s)
        tl.to({}, { duration: 1.2 });

        // ═══════════════════════════════════════════════════════════
        // TRANSITION 4 -> 5: WOLF FACE FINAL CLOSE-UP & FADE TO BLACK
        // ═══════════════════════════════════════════════════════════
        tl.call(() => setCurrentStepIndex(4));

        // Fade to black
        if (blackOverlayRef.current) {
            tl.to(
                blackOverlayRef.current,
                {
                    opacity: 1,
                    duration: 0.65,
                    ease: "power2.in",
                    onComplete: () => {
                        handleSkip();
                    },
                },
                "+=0.4"
            );
        } else {
            tl.to({}, { duration: 0.7, onComplete: () => handleSkip() });
        }
    };

    useEffect(() => {
        if (autoStart) {
            const t = setTimeout(() => {
                startAnimation();
            }, 100);
            return () => clearTimeout(t);
        }
    }, [autoStart]);

    if (isFinished) return null;

    const currentSubtitle = STAGE_SUBTITLES[Math.min(currentStepIndex, 2)] || STAGE_SUBTITLES[0];

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#05070B] select-none overflow-hidden"
        >
            {/* CRT Cyber Scanline Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-25 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[size:100%_4px]" />

            {/* Dynamic Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

            {/* Dynamic Ambient Glow Backdrops for 3 Tenets + Climax */}
            <div
                ref={ambientGlowCyan}
                className="absolute w-[680px] h-[680px] rounded-full bg-sky-500/25 blur-[160px] pointer-events-none transition-opacity duration-700 opacity-90"
            />
            <div
                ref={ambientGlowPurple}
                className="absolute w-[680px] h-[680px] rounded-full bg-purple-600/25 blur-[160px] pointer-events-none transition-opacity duration-700 opacity-0"
            />
            <div
                ref={ambientGlowPink}
                className="absolute w-[680px] h-[680px] rounded-full bg-pink-500/25 blur-[160px] pointer-events-none transition-opacity duration-700 opacity-0"
            />

            {/* Corner Tech Cutouts with AiRA Cyber Brackets */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-sky-400/80 pointer-events-none" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-sky-400/80 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-purple-500/80 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-purple-500/80 pointer-events-none" />

            {/* TOP BAR CONTROLS */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2.5">
                <button
                    type="button"
                    onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        if (next) playCyberBeep(659, "triangle", 0.1);
                    }}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-slate-900/80 hover:bg-slate-800 text-[11px] sm:text-xs font-mono text-slate-300 rounded-xl border border-sky-400/30 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                >
                    {soundEnabled ? <Volume2 size={13} className="text-sky-300 animate-pulse" /> : <VolumeX size={13} className="text-slate-500" />}
                    <span>{soundEnabled ? "AUDIO ON" : "AUDIO OFF"}</span>
                </button>

                <button
                    type="button"
                    onClick={startAnimation}
                    className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-purple-950/70 hover:bg-purple-900/90 text-purple-300 border border-purple-500/40 text-[11px] sm:text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                    title="Replay Animation"
                >
                    <RotateCcw size={12} />
                    <span>REPLAY</span>
                </button>

                <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3 sm:px-4 py-1 sm:py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-400/50 text-[11px] sm:text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] backdrop-blur-md"
                >
                    <FastForward size={12} />
                    <span>ENTER PORTAL</span>
                </button>
            </div>

            {/* Top-Left Telemetry with Mascot Indicator */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-30 hidden xs:flex items-center gap-2 text-xs font-mono text-slate-400 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-orbitron font-bold text-sky-300 text-[9px] sm:text-[10px] tracking-wider">
                    MEVY 3D MASCOT · CINEMATIC AIRA
                </span>
            </div>

            {/* ══ CENTER STAGE CONTAINER (PROPER VERTICAL SPACING & NEVER OVERLAPS) ══ */}
            <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-5xl px-3 sm:px-6 my-auto pt-14 sm:pt-0">
                {/* ══ 3D WOLF MASCOT (MEVY) CENTER STAGE WITH REAL-TIME CAMERA CHOREOGRAPHY ══ */}
                <div className="relative z-20 w-[190px] h-[190px] xs:w-[230px] xs:h-[230px] sm:w-[290px] sm:h-[290px] mb-1 sm:mb-2 pointer-events-none flex items-center justify-center shrink-0">
                    <Suspense fallback={null}>
                        <Canvas
                            camera={{ position: [0, 0.05, 3.4], fov: 40 }}
                            className="w-full h-full"
                            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                            onCreated={({ gl }) => {
                                gl.toneMapping = THREE.ACESFilmicToneMapping;
                                gl.toneMappingExposure = 1.25;
                            }}
                        >
                            {/* Dynamic Studio Lighting */}
                            <ambientLight intensity={1.2} />
                            <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" />
                            <directionalLight position={[-5, 3, -2]} intensity={1.9} color={currentStepIndex === 0 ? "#38BDF8" : currentStepIndex === 1 ? "#C084FC" : "#FB7185"} />
                            <pointLight position={[0, -2, 2]} intensity={1.5} color="#A855F7" />
                            <pointLight position={[0, 4, 0]} intensity={1.2} color="#00D4FF" />

                            {/* Choreographed 3D Wolf Scene */}
                            <Preloader3DWolfScene currentStep={currentStepIndex} />
                        </Canvas>
                    </Suspense>
                </div>

                {/* ══ MAIN TYPOGRAPHY STAGE ══ */}
                <div className="relative z-20 flex flex-col items-center justify-center px-2 sm:px-4 w-full">
                    {/* ══ SCENE 1: 3-STEP ROLLING SLOTS (INNOVATION ➔ RESEARCH ➔ IMPACT) ══ */}
                    <div
                        ref={logoSceneRef}
                        className="flex flex-col items-center justify-center relative w-full"
                    >
                        <div className="inline-flex flex-col items-center relative w-full">
                            {/* 3-STEP ROLLING SLOTS CONTAINER */}
                            <div
                                id="topRollSlotsContainer"
                                className="py-0.5 sm:py-1 px-1 sm:px-2 flex items-center justify-center font-orbitron font-black uppercase tracking-tight text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl select-none"
                            >
                                {topCharSlots.map((slot, idx) => (
                                    <div
                                        key={`slot_${idx}`}
                                        className={`aira-roll-window inline-block overflow-hidden h-[1.1em] leading-[1.1em] align-top relative top-slot-${idx}`}
                                    >
                                        {/* 3-Row Vertical Track */}
                                        <div className={`aira-slot-track aira-track-${idx} flex flex-col will-change-transform`}>
                                            {/* Step 1: INNOVATION */}
                                            <div className={`flex items-center justify-center h-[1.1em] leading-[1.1em] drop-shadow-[0_0_20px_rgba(56,189,248,0.6)] ${slot.c1Class}`}>
                                                {slot.c1}
                                            </div>
                                            {/* Step 2: RESEARCH */}
                                            <div className={`flex items-center justify-center h-[1.1em] leading-[1.1em] drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] ${slot.c2Class}`}>
                                                {slot.c2}
                                            </div>
                                            {/* Step 3: IMPACT */}
                                            <div className={`flex items-center justify-center h-[1.1em] leading-[1.1em] drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] ${slot.c3Class}`}>
                                                {slot.c3}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* SUBTITLE BADGE PILL */}
                            <div
                                id="stageSubtitlePill"
                                className="mt-2 sm:mt-4 transition-all duration-300 max-w-full px-2 text-center"
                            >
                                <div className={`px-3 sm:px-6 py-1 sm:py-2 rounded-full border backdrop-blur-2xl font-orbitron font-bold text-[10px] xs:text-xs sm:text-sm tracking-wider shadow-lg transition-all duration-500 inline-flex items-center gap-1.5 sm:gap-2 ${currentSubtitle.color}`}>
                                    <Sparkles size={12} className="text-amber-400 shrink-0 animate-spin [animation-duration:8s]" />
                                    <span className="truncate max-w-[270px] xs:max-w-none">{currentSubtitle.text}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ SCENE 2: GRAND AIRA LABS PRODUCT FINALE ══ */}
                    <div
                        ref={presentsSceneRef}
                        className="hidden flex-col items-center justify-center text-center relative py-1 sm:py-2 w-full max-w-3xl px-2"
                    >
                        {/* AIRA LABS MAIN LOGO TITLE */}
                        <div className="relative overflow-hidden py-1 px-3 sm:px-6">
                            <h2
                                ref={airaTitleRef}
                                className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight font-orbitron opacity-0"
                            >
                                <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">AiRA</span>{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500 drop-shadow-[0_0_40px_rgba(56,189,248,0.8)]">
                                    LABS
                                </span>
                            </h2>
                        </div>

                        {/* 4 FRONTIER LAB WINGS BADGES */}
                        <div ref={wingsRef} className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 max-w-2xl px-2">
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[9px] sm:text-xs font-mono">
                                🧠 AI & Autonomous Agents
                            </span>
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[9px] sm:text-xs font-mono">
                                🤖 Robotics Systems
                            </span>
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[9px] sm:text-xs font-mono">
                                🌐 Web3 / Cloud Systems
                            </span>
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[9px] sm:text-xs font-mono">
                                🛡️ Cyber Defense
                            </span>
                        </div>

                        {/* SIGNATURE TAGLINE */}
                        <div className="overflow-hidden mt-3 sm:mt-4">
                            <p
                                ref={taglineRef}
                                className="text-[10px] xs:text-xs sm:text-sm md:text-base font-orbitron font-bold text-slate-200 tracking-[0.12em] sm:tracking-[0.2em] uppercase flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                                <Zap size={13} className="text-amber-400 shrink-0 animate-bounce" />
                                <span>A New Mind · A New Energy · A New Impact ⚡</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ FINAL CINEMATIC BLACK OUT CURTAIN ══ */}
            <div
                ref={blackOverlayRef}
                className="absolute inset-0 bg-[#05070B] z-50 pointer-events-none opacity-0 transition-opacity"
            />
        </div>
    );
}

export default AiraLoginPreloader;
