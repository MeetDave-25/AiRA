"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Pause, ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX } from "lucide-react";
import { startBadassCyberMusic, stopBadassCyberMusic } from "@/lib/audio";

// Stable Original Leadership & Team Profiles (Fixed photos — No swapping or flashing on load)
const DEFAULT_TEAM_PROFILES = [
    { id: "SLIDE-01", name: "PARTH D. JOSHI",      title: "PARTH D. JOSHI",      role: "FOUNDER & PRESIDENT",              tag: "👑 FOUNDER",        catalogId: "AIRA-001", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-02", name: "MEET DAVE",            title: "MEET DAVE",            role: "FOUNDER & LEAD ARCHITECT",         tag: "⚡ CORE LEAD",       catalogId: "AIRA-002", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-03", name: "PRUTHVI",              title: "PRUTHVI",              role: "LEAD ARCHITECT & RESEARCHER",      tag: "🛡️ CORE LEAD",      catalogId: "AIRA-003", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-04", name: "PRIT JIVRAJJANI",      title: "PRIT JIVRAJJANI",      role: "FULL-STACK & SYSTEMS LEAD",        tag: "⚡ TECH LEAD",       catalogId: "AIRA-004", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-05", name: "DASHRATH",             title: "DASHRATH",             role: "ROBOTICS & SENSOR FUSION LEAD",    tag: "🤖 HARDWARE LEAD",  catalogId: "AIRA-005", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-06", name: "DHYEY",                title: "DHYEY",                role: "AI VISION & NEURAL SYSTEMS LEAD",  tag: "🧠 AI RESEARCH",    catalogId: "AIRA-006", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-07", name: "JANVI",                title: "JANVI",                role: "SOFTWARE & DATA PLATFORM LEAD",    tag: "💻 SOFTWARE LEAD",  catalogId: "AIRA-007", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-08", name: "BHAVESH",              title: "BHAVESH",              role: "CYBER DEFENSE & INFRASTRUCTURE LEAD", tag: "🔬 CYBER LEAD",  catalogId: "AIRA-008", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-09", name: "HARSHIL",              title: "HARSHIL",              role: "EMBEDDED SYSTEMS & FIRMWARE LEAD", tag: "💻 FIRMWARE LEAD",  catalogId: "AIRA-009", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80" },
    { id: "SLIDE-10", name: "AIRA INNOVATION LABS", title: "AIRA INNOVATION LABS", role: "PIONEERING AUTONOMOUS AI",         tag: "🌐 CORE LAB",       catalogId: "AIRA-010", photo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80" },
];


// GLSL Vertex Shader — full viewport plane
const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

// GLSL Fragment Shader — Ultra-Smooth Cyberpunk WebGL Hyperspace Tunnel
const fragmentShader = `
uniform vec2  iResolution;
uniform float iTime;
uniform float scrollOffset;

void mainImage(out vec4 o, vec2 I) {
  vec2 uv = (I - iResolution.xy * 0.5) / iResolution.y;
  float dist = max(length(uv), 0.001);
  float angle = atan(uv.y, uv.x);

  float t = iTime * 2.5 + scrollOffset * 8.0;
  
  float spokes = sin(angle * 12.0 + t * 0.5);
  float rings = sin(18.0 / dist - t * 4.0);
  float gridPattern = spokes * rings;
  
  vec3 bgCol = vec3(0.02, 0.04, 0.08);
  vec3 cyanPulse = vec3(0.0, 0.83, 1.0) * (0.5 + 0.5 * gridPattern);
  vec3 purplePulse = vec3(0.48, 0.23, 0.93) * (1.0 / (dist * 10.0 + 1.0));
  vec3 finalColor = bgCol + (cyanPulse * 0.25 + purplePulse * 0.4) * smoothstep(0.0, 1.5, dist);
  finalColor += vec3(0.0, 0.7, 1.0) * (0.05 / dist);

  o = vec4(finalColor, 1.0);
}

void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

interface TunnelPreloaderProps {
    onComplete?: () => void;
    forceShow?: boolean;
}

export function TunnelPreloader({ onComplete, forceShow = false }: TunnelPreloaderProps) {
    const [isVisible, setIsVisible]         = useState<boolean | null>(null);
    const [isEnding, setIsEnding]           = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isMusicPlaying, setIsMusicPlaying] = useState(true);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [teamProfiles, setTeamProfiles]   = useState(DEFAULT_TEAM_PROFILES);

    const containerRef       = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slideRefs          = useRef<(HTMLDivElement | null)[]>([]);

    const progressRef        = useRef<number>(0);
    const targetProgressRef  = useRef<number>(0);

    // Check session storage
    useEffect(() => {
        if (!forceShow) {
            const hasSeen = sessionStorage.getItem("aira_tunnel_preloader_seen");
            if (hasSeen === "true") {
                setIsVisible(false);
                if (onComplete) onComplete();
                return;
            }
        }
        setIsVisible(true);
    }, [forceShow, onComplete]);

    // Optional API Sync (Direct mapping with zero picture swapping or image flashing)
    useEffect(() => {
        fetch("/api/team-members")
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const sortedData = [...data].sort((a: any, b: any) => {
                        const getRank = (name: string, isPres: boolean) => {
                            const u = (name || "").toUpperCase();
                            if (u.includes("PARTH JOSHI") || u.includes("PARTH D. JOSHI") || (u.includes("PARTH") && u.includes("JOSHI"))) return 0;
                            if (u.includes("MEET DAVE") || (u.includes("MEET") && u.includes("DAVE"))) return 1;
                            if (u.includes("PRUTHVI")) return 2;
                            if (u.includes("PRIT JIVRAJJANI") || u.includes("PRIT") || u.includes("JIVRAJJANI")) return 3;
                            if (u.includes("DASHRATH") || u.includes("JADAV")) return 4;
                            if (u.includes("DHYEY")) return 5;
                            if (u.includes("JANVI")) return 6;
                            if (u.includes("BHAVESH")) return 7;
                            if (u.includes("HARSHIL")) return 8;
                            if (isPres) return 9;
                            return 10;
                        };
                        return getRank(a.name, a.isPresident) - getRank(b.name, b.isPresident);
                    });

                    const fetchedList = sortedData.map((item: any, idx: number) => {
                        const uName = (item.name || "").toUpperCase();
                        let role = (item.role || "TEAM MEMBER").toUpperCase();
                        let tag = item.tag || "🤖 CORE TEAM";

                        if (uName.includes("PARTH JOSHI") || uName.includes("PARTH D. JOSHI") || (uName.includes("PARTH") && uName.includes("JOSHI")) || item.isPresident) {
                            tag = "👑 FOUNDER";
                            if (!role || role === "TEAM MEMBER") role = "FOUNDER & PRESIDENT";
                        } else if (uName.includes("MEET DAVE") || (uName.includes("MEET") && uName.includes("DAVE"))) {
                            tag = "⚡ CORE LEAD";
                            if (!role || role === "TEAM MEMBER") role = "FOUNDER & LEAD ARCHITECT";
                        } else if (uName.includes("PRUTHVI")) {
                            tag = "🛡️ CORE LEAD";
                            if (!role || role === "TEAM MEMBER") role = "LEAD ARCHITECT & RESEARCHER";
                        } else if (uName.includes("PRIT JIVRAJJANI") || uName.includes("PRIT") || uName.includes("JIVRAJJANI")) {
                            tag = "⚡ TECH LEAD";
                            if (!role || role === "TEAM MEMBER") role = "FULL-STACK & SYSTEMS LEAD";
                        } else if (uName.includes("DASHRATH") || uName.includes("JADAV")) {
                            tag = "🤖 HARDWARE LEAD";
                            if (!role || role === "TEAM MEMBER") role = "ROBOTICS & SENSOR FUSION LEAD";
                        } else if (uName.includes("DHYEY")) {
                            tag = "🧠 AI RESEARCH";
                            if (!role || role === "TEAM MEMBER") role = "AI VISION & NEURAL SYSTEMS LEAD";
                        } else if (uName.includes("JANVI")) {
                            tag = "💻 SOFTWARE LEAD";
                            if (!role || role === "TEAM MEMBER") role = "SOFTWARE & DATA PLATFORM LEAD";
                        } else if (uName.includes("BHAVESH")) {
                            tag = "🔬 CYBER LEAD";
                            if (!role || role === "TEAM MEMBER") role = "CYBER DEFENSE & INFRASTRUCTURE LEAD";
                        } else if (uName.includes("HARSHIL")) {
                            tag = "💻 FIRMWARE LEAD";
                            if (!role || role === "TEAM MEMBER") role = "EMBEDDED SYSTEMS & FIRMWARE LEAD";
                        } else if (item.isTeamLead) {
                            tag = "⚡ TEAM LEAD";
                        }

                        const defaultPhoto = DEFAULT_TEAM_PROFILES[idx % DEFAULT_TEAM_PROFILES.length].photo;
                        const finalPhoto = (item.photo && item.photo.trim().length > 5) ? item.photo : defaultPhoto;

                        return {
                            id:        item.id || `SLIDE-${String(idx + 1).padStart(2, "0")}`,
                            name:      uName,
                            role,
                            tag,
                            title:     uName,
                            catalogId: `AIRA-${String(idx + 1).padStart(3, "0")}`,
                            photo:     finalPhoto,
                        };
                    });

                    let combined = [...fetchedList];
                    if (combined.length < 10) {
                        for (let i = combined.length; i < 10; i++) combined.push(DEFAULT_TEAM_PROFILES[i]);
                    }
                    setTeamProfiles(combined.slice(0, 10));
                }
            })
            .catch(() => { /* Keep existing stable teamProfiles */ });
    }, []);

    // Music
    useEffect(() => {
        if (!isVisible) return;
        if (isMusicPlaying) { startBadassCyberMusic(); } else { stopBadassCyberMusic(); }
        return () => { stopBadassCyberMusic(); };
    }, [isVisible, isMusicPlaying]);

    const toggleMusic = useCallback(() => {
        setIsMusicPlaying((prev) => {
            const next = !prev;
            if (next) { startBadassCyberMusic(); } else { stopBadassCyberMusic(); }
            return next;
        });
    }, []);

    const finishReveal = useCallback(() => {
        if (isEnding) return;
        setIsEnding(true);
        stopBadassCyberMusic();
        sessionStorage.setItem("aira_tunnel_preloader_seen", "true");
        setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
        }, 850);
    }, [isEnding, onComplete]);

    const goToSlide = useCallback((index: number) => {
        targetProgressRef.current = Math.max(0, Math.min(teamProfiles.length - 1, index));
        setIsAutoPlaying(false);
    }, [teamProfiles.length]);

    // ── Three.js Shader Setup & 60FPS Smooth Lerp Loop (lazy-loaded) ────────
    useEffect(() => {
        if (!isVisible || !canvasContainerRef.current) return;

        const canvasDiv = canvasContainerRef.current;
        canvasDiv.innerHTML = "";
        let animationFrameId: number;
        let cleanupDone = false;

        import("three").then((THREE) => {
            if (cleanupDone || !canvasContainerRef.current) return;

            const isMobile  = window.innerWidth < 768;
            const scene     = new THREE.Scene();
            const camera    = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const renderer  = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance" });
            // GPU-adaptive: 1.5 on mobile, 2 on desktop
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
            renderer.setSize(window.innerWidth, window.innerHeight);
            Object.assign(renderer.domElement.style, { position: "absolute", top: "0", left: "0", zIndex: "0", pointerEvents: "none" });
            canvasDiv.appendChild(renderer.domElement);

            const geometry = new THREE.PlaneGeometry(2, 2);
            const uniforms = {
                iTime:        { value: 0 },
                iResolution:  { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                scrollOffset: { value: 0 },
            };
            const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
            scene.add(new THREE.Mesh(geometry, material));

            let lastTime   = performance.now();
            const totalCount = teamProfiles.length;
            const Z_SPACING  = 1600;

            const renderLoop = (time: number) => {
                const deltaTime = time - lastTime;
                lastTime = time;

                uniforms.iTime.value += deltaTime * 0.001;

                if (isAutoPlaying && !isEnding) {
                    targetProgressRef.current += 0.0012;
                    if (targetProgressRef.current >= totalCount - 0.1) {
                        targetProgressRef.current = totalCount - 0.1;
                    }
                }

                progressRef.current += (targetProgressRef.current - progressRef.current) * 0.055;
                const p = progressRef.current;
                uniforms.scrollOffset.value = p;

                const currentIdx = Math.max(0, Math.min(totalCount - 1, Math.round(p)));
                setActiveSlideIndex(currentIdx);

                slideRefs.current.forEach((el, idx) => {
                    if (!el) return;
                    const relativeIndex = idx - p;
                    const targetZ = relativeIndex * -Z_SPACING;
                    const isMob   = window.innerWidth < 640;
                    const xPos    = isMob ? 0 : (idx % 2 === 0 ? -120 : 120);
                    const rotateY = idx % 2 === 0 ? -4 : 4;

                    let opacity = 0, scale = 1, blur = 0;
                    if (targetZ > 600)       { opacity = 0; scale = 1.35; el.style.pointerEvents = "none"; }
                    else if (targetZ > 0)    { opacity = 1 - targetZ / 600; scale = 1 + (targetZ / 600) * 0.25; el.style.pointerEvents = "none"; }
                    else if (targetZ >= -4000) {
                        const d = Math.abs(targetZ);
                        opacity = Math.max(0, 1 - d / 3200);
                        scale   = Math.max(0.4, 1 - d / 5000);
                        blur    = Math.min(10, d / 320);
                        el.style.pointerEvents = d < 400 ? "auto" : "none";
                    } else { opacity = 0; scale = 0.3; el.style.pointerEvents = "none"; }

                    el.style.opacity   = opacity.toFixed(3);
                    el.style.filter    = blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none";
                    el.style.transform = `translate3d(calc(-50% + ${xPos}px), calc(-50% + 0px), ${targetZ.toFixed(1)}px) rotateY(${rotateY}deg) scale(${scale.toFixed(3)})`;
                });

                renderer.render(scene, camera);
                animationFrameId = requestAnimationFrame(renderLoop);
            };

            animationFrameId = requestAnimationFrame(renderLoop);

            const handleResize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight);
                uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", handleResize);

            (canvasDiv as any)._threeCleanup = () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener("resize", handleResize);
                geometry.dispose();
                material.dispose();
                renderer.dispose();
                renderer.forceContextLoss();
                if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
            };
        });

        return () => {
            cleanupDone = true;
            cancelAnimationFrame(animationFrameId);
            const cleanup = (canvasDiv as any)._threeCleanup;
            if (typeof cleanup === "function") cleanup();
        };
    }, [isVisible, isAutoPlaying, isEnding, teamProfiles.length]);

    // ── Input Handling ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!isVisible) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            setIsAutoPlaying(false);
            const delta = Math.sign(e.deltaY) * 0.14 + (e.deltaY * 0.00035);
            targetProgressRef.current = Math.max(0, Math.min(teamProfiles.length - 0.1, targetProgressRef.current + delta));
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
        const handleTouchMove  = (e: TouchEvent) => {
            const deltaY = (touchStartY - e.touches[0].clientY) * 0.0025;
            touchStartY = e.touches[0].clientY;
            setIsAutoPlaying(false);
            targetProgressRef.current = Math.max(0, Math.min(teamProfiles.length - 0.1, targetProgressRef.current + deltaY));
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown")  { e.preventDefault(); goToSlide(Math.min(teamProfiles.length - 1, activeSlideIndex + 1)); }
            else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goToSlide(Math.max(0, activeSlideIndex - 1)); }
            else if (e.key === " ")   { e.preventDefault(); setIsAutoPlaying(prev => !prev); }
            else if (e.key === "Escape") { finishReveal(); }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove",  handleTouchMove,  { passive: true });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove",  handleTouchMove);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isVisible, teamProfiles.length, activeSlideIndex, goToSlide, finishReveal]);

    if (isVisible === null || isVisible === false) return null;

    const currentProfile = teamProfiles[activeSlideIndex] || teamProfiles[0];

    return (
        <AnimatePresence>
            {!isEnding && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.06, filter: "brightness(1.2) blur(16px)", transition: { duration: 0.85, ease: [0.4, 0.0, 0.2, 1] } }}
                    className="fixed inset-0 z-[9999999] bg-[#02050B] overflow-hidden select-none text-white font-sans"
                    style={{ isolation: "isolate" }}
                >
                    {/* Background Shader Container */}
                    <div ref={canvasContainerRef} className="absolute inset-0 pointer-events-none z-0" />

                    {/* Radial Dark Vignette */}
                    <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,rgba(2,5,11,0.92)_100%)]" />

                    {/* 3D Stage Container */}
                    <div
                        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
                        style={{ perspective: "1000px", perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d" }}
                    >
                        {teamProfiles.map((profile, idx) => {
                            const isActive = idx === activeSlideIndex;
                            return (
                                <div
                                    key={profile.id || idx}
                                    ref={(el) => { slideRefs.current[idx] = el; }}
                                    className="absolute top-1/2 left-1/2 w-[340px] sm:w-[380px] h-[460px] sm:h-[490px] rounded-3xl p-1.5 transition-shadow duration-300 pointer-events-auto cursor-pointer"
                                    style={{
                                        willChange: "transform, opacity, filter",
                                        transformStyle: "preserve-3d",
                                        background: isActive
                                            ? "linear-gradient(135deg, rgba(0,212,255,0.9) 0%, rgba(124,58,237,0.7) 100%)"
                                            : "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)",
                                        boxShadow: isActive
                                            ? "0 25px 60px -10px rgba(0,212,255,0.45), 0 0 35px rgba(0,212,255,0.35)"
                                            : "0 20px 40px rgba(0,0,0,0.8)",
                                    }}
                                    onClick={() => goToSlide(idx)}
                                >
                                    <div className="relative w-full h-full rounded-[22px] bg-[#070D1B] p-5 flex flex-col justify-between overflow-hidden border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                                        <div className="flex justify-between items-center z-10">
                                            <span className="px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-[11px] font-mono font-extrabold uppercase tracking-wider shadow-lg">
                                                {profile.tag}
                                            </span>
                                            <span className="text-white/60 font-mono text-xs font-semibold tracking-widest">
                                                {profile.catalogId}
                                            </span>
                                        </div>

                                        <div className="my-3 relative w-full flex-1 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 group">
                                            <img
                                                src={profile.photo}
                                                alt={profile.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#070D1B] via-transparent to-transparent" />
                                        </div>

                                        <div className="z-10 pt-1">
                                            <h3 className="text-xl font-extrabold tracking-tight text-white font-mono uppercase truncate">
                                                {profile.name}
                                            </h3>
                                            <p className="text-cyan-400 text-xs font-mono font-bold tracking-wide mt-0.5 truncate">
                                                {profile.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ══ HEADER / TOP NAV ══ */}
                    <nav className="fixed top-0 left-0 w-full px-6 py-6 sm:px-10 sm:py-7 flex justify-between items-center mix-blend-exclusion z-50 pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-extrabold tracking-widest text-white uppercase">AIRA LABS</span>
                            <span className="text-white/40 text-xs">•</span>
                            <span className="font-mono text-xs font-medium tracking-wider text-cyan-400 uppercase">3D TUNNEL FLIGHT</span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                            <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                            <span className="font-mono text-[11px] text-white/80 tracking-wider uppercase">SCROLL OR ARROWS TO ADVANCE</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleMusic}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono tracking-wider transition-all cursor-pointer"
                            >
                                {isMusicPlaying ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} className="text-white/50" />}
                                <span>{isMusicPlaying ? "MUSIC ON" : "MUTED"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsAutoPlaying(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono tracking-wider transition-all cursor-pointer"
                            >
                                {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                                <span>{isAutoPlaying ? "PAUSE" : "AUTO FLIGHT"}</span>
                            </button>
                        </div>
                    </nav>

                    {/* ══ FOOTER HUD & PAGINATION ══ */}
                    <footer className="fixed bottom-0 left-0 w-full px-6 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-50 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-cyan-400 text-sm font-bold tracking-widest">
                                {String(activeSlideIndex + 1).padStart(2, "0")} / {String(teamProfiles.length).padStart(2, "0")}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="font-mono text-xs text-white/90 tracking-wide uppercase truncate max-w-[220px] sm:max-w-[320px]">
                                {currentProfile.name} ({currentProfile.role})
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => goToSlide(Math.max(0, activeSlideIndex - 1))}
                                disabled={activeSlideIndex === 0}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/15 text-white transition-all cursor-pointer"
                                aria-label="Previous Profile"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-1.5 px-2">
                                {teamProfiles.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => goToSlide(i)}
                                        className={`h-2 rounded-full transition-all cursor-pointer ${
                                            i === activeSlideIndex ? "w-7 bg-cyan-400 shadow-[0_0_10px_#00D4FF]" : "w-2 bg-white/30 hover:bg-white/60"
                                        }`}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => goToSlide(Math.min(teamProfiles.length - 1, activeSlideIndex + 1))}
                                disabled={activeSlideIndex === teamProfiles.length - 1}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/15 text-white transition-all cursor-pointer"
                                aria-label="Next Profile"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={finishReveal}
                            className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold tracking-widest uppercase backdrop-blur-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all cursor-pointer"
                        >
                            <span>Enter Website</span>
                            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-cyan-400" />
                        </button>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default TunnelPreloader;
