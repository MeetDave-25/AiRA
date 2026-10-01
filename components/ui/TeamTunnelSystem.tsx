"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Play, Pause, User, ExternalLink } from "lucide-react";

// Default fallback team profiles if no DB members passed
const DEFAULT_PROFILES = [
    { id: "D-01", name: "PARTH D. JOSHI",     role: "FOUNDER & PRESIDENT",              tag: "👑 FOUNDER",         catalogId: "AIRA-001", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80" },
    { id: "D-02", name: "MEET DAVE",           role: "FOUNDER & LEAD ARCHITECT",         tag: "⚡ CORE LEAD",        catalogId: "AIRA-002", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80" },
    { id: "D-03", name: "PRUTHVI",             role: "LEAD ARCHITECT & RESEARCHER",      tag: "🛡️ CORE LEAD",       catalogId: "AIRA-003", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80" },
    { id: "D-04", name: "PRIT JIVRAJJANI",     role: "FULL-STACK & SYSTEMS LEAD",        tag: "⚡ TECH LEAD",        catalogId: "AIRA-004", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80" },
    { id: "D-05", name: "DASHRATH",            role: "ROBOTICS & SENSOR FUSION LEAD",    tag: "🤖 HARDWARE LEAD",   catalogId: "AIRA-005", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80" },
    { id: "D-06", name: "DHYEY",               role: "AI VISION & NEURAL SYSTEMS LEAD",  tag: "🧠 AI RESEARCH",     catalogId: "AIRA-006", photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80" },
    { id: "D-07", name: "JANVI",               role: "SOFTWARE & DATA PLATFORM LEAD",    tag: "💻 SOFTWARE LEAD",   catalogId: "AIRA-007", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80" },
    { id: "D-08", name: "BHAVESH",             role: "CYBER DEFENSE & INFRA LEAD",       tag: "🔬 CYBER LEAD",      catalogId: "AIRA-008", photo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80" },
    { id: "D-09", name: "HARSHIL",             role: "EMBEDDED SYSTEMS & FIRMWARE LEAD", tag: "💻 FIRMWARE LEAD",   catalogId: "AIRA-009", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80" },
];

const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;
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
  float rings  = sin(18.0 / dist - t * 4.0);
  float gridPattern = spokes * rings;
  vec3 bgCol      = vec3(0.02, 0.04, 0.08);
  vec3 cyanPulse  = vec3(0.0, 0.83, 1.0) * (0.5 + 0.5 * gridPattern);
  vec3 purplePulse = vec3(0.48, 0.23, 0.93) * (1.0 / (dist * 10.0 + 1.0));
  vec3 finalColor = bgCol + (cyanPulse * 0.25 + purplePulse * 0.4) * smoothstep(0.0, 1.5, dist);
  finalColor += vec3(0.0, 0.7, 1.0) * (0.05 / dist);
  o = vec4(finalColor, 1.0);
}
void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
`;

export interface TeamTunnelMember {
    id: string;
    name: string;
    role: string;
    tag?: string;
    catalogId?: string;
    photo?: string;
    bio?: string;
    linkedin?: string;
    github?: string;
    isPresident?: boolean;
    isTeamLead?: boolean;
}

interface TeamTunnelSystemProps {
    items?: TeamTunnelMember[];
    onSelectMember?: (member: any) => void;
}

export function TeamTunnelSystem({ items, onSelectMember }: TeamTunnelSystemProps) {
    const containerRef       = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slideRefs          = useRef<(HTMLDivElement | null)[]>([]);

    const progressRef       = useRef(0);
    const targetProgressRef = useRef(0);
    const autoPlayRef       = useRef(true);
    const visibleRef        = useRef(true);
    const activeIdxRef      = useRef(0);

    const [profiles, setProfiles]           = useState<TeamTunnelMember[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [threeLoaded, setThreeLoaded]     = useState(false);

    // Map items or defaults
    useEffect(() => {
        if (Array.isArray(items) && items.length > 0) {
            const mapped: TeamTunnelMember[] = items.map((item, idx) => {
                const uName = (item.name || "").toUpperCase();
                const defaultPhoto = DEFAULT_PROFILES[idx % DEFAULT_PROFILES.length].photo;
                return {
                    ...item,
                    name:      uName,
                    role:      (item.role || "TEAM MEMBER").toUpperCase(),
                    tag:       item.tag || (item.isPresident ? "👑 FOUNDER" : item.isTeamLead ? "⚡ TEAM LEAD" : "🤖 CORE TEAM"),
                    catalogId: item.catalogId || `AIRA-${String(idx + 1).padStart(3, "0")}`,
                    photo:     (item.photo && item.photo.trim().length > 5) ? item.photo : defaultPhoto,
                };
            });
            setProfiles(mapped);
            targetProgressRef.current = 0;
            progressRef.current = 0;
        } else {
            // Fallback fetch
            fetch("/api/team-members")
                .then(r => r.ok ? r.json() : [])
                .then((data: any[]) => {
                    if (!Array.isArray(data) || data.length === 0) {
                        setProfiles(DEFAULT_PROFILES);
                        return;
                    }
                    const sorted = [...data].sort((a, b) => {
                        if (a.isPresident && !b.isPresident) return -1;
                        if (!a.isPresident && b.isPresident) return 1;
                        return (a.sortOrder ?? 99) - (b.sortOrder ?? 99);
                    });
                    const mapped: TeamTunnelMember[] = sorted.slice(0, 10).map((item, idx) => {
                        const uName = (item.name || "").toUpperCase();
                        const defaultPhoto = DEFAULT_PROFILES[idx % DEFAULT_PROFILES.length].photo;
                        return {
                            ...item,
                            name:      uName,
                            role:      (item.role || "TEAM MEMBER").toUpperCase(),
                            tag:       item.tag || (item.isPresident ? "👑 FOUNDER" : item.isTeamLead ? "⚡ TEAM LEAD" : "🤖 CORE TEAM"),
                            catalogId: `AIRA-${String(idx + 1).padStart(3, "0")}`,
                            photo:     (item.photo && item.photo.trim().length > 5) ? item.photo : defaultPhoto,
                        };
                    });
                    setProfiles(mapped);
                })
                .catch(() => setProfiles(DEFAULT_PROFILES));
        }
    }, [items]);

    // Read inside the render loop, so toggling play/pause doesn't rebuild the WebGL scene.
    useEffect(() => { autoPlayRef.current = isAutoPlaying; }, [isAutoPlaying]);

    // Stop rendering while the tunnel is scrolled off-screen (saves battery on phones).
    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { rootMargin: "100px" });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Lazy-load Three.js + WebGL render loop (bounded inside container)
    useEffect(() => {
        if (!canvasContainerRef.current || profiles.length === 0) return;
        let animationFrameId: number;
        let cleanupFn: (() => void) | null = null;

        import("three").then((THREE) => {
            if (!canvasContainerRef.current) return;
            setThreeLoaded(true);

            const canvasDiv = canvasContainerRef.current;
            canvasDiv.innerHTML = "";

            const isMobile = window.innerWidth < 768;
            const W = canvasDiv.clientWidth || 800;
            const H = canvasDiv.clientHeight || 550;

            const scene    = new THREE.Scene();
            const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: "high-performance", alpha: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
            renderer.setSize(W, H);
            Object.assign(renderer.domElement.style, { position: "absolute", top: "0", left: "0", zIndex: "0", pointerEvents: "none" });
            canvasDiv.appendChild(renderer.domElement);

            const uniforms = {
                iTime:        { value: 0 },
                iResolution:  { value: new THREE.Vector2(W, H) },
                scrollOffset: { value: 0 },
            };
            const geo = new THREE.PlaneGeometry(2, 2);
            const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
            scene.add(new THREE.Mesh(geo, mat));

            const totalCount = profiles.length;
            const Z_SPACING  = 1600;
            let   lastTime   = performance.now();

            const loop = (time: number) => {
                animationFrameId = requestAnimationFrame(loop);
                const dt = Math.min(time - lastTime, 100);
                lastTime = time;
                if (!visibleRef.current) return;
                uniforms.iTime.value += dt * 0.001;

                if (autoPlayRef.current) {
                    targetProgressRef.current += 0.0012;
                    if (targetProgressRef.current >= totalCount - 0.1) {
                        targetProgressRef.current = totalCount - 0.1;
                    }
                }

                progressRef.current += (targetProgressRef.current - progressRef.current) * 0.055;
                const p = progressRef.current;
                uniforms.scrollOffset.value = p;

                const currentIdx = Math.max(0, Math.min(totalCount - 1, Math.round(p)));
                if (currentIdx !== activeIdxRef.current) {
                    activeIdxRef.current = currentIdx;
                    setActiveSlideIndex(currentIdx);
                }

                const isMob = window.innerWidth < 640;
                slideRefs.current.forEach((el, idx) => {
                    if (!el) return;
                    const relIdx  = idx - p;
                    const targetZ = relIdx * -Z_SPACING;
                    const xPos    = isMob ? 0 : (idx % 2 === 0 ? -110 : 110);
                    const rotY    = idx % 2 === 0 ? -4 : 4;

                    let opacity = 0, scale = 1, blur = 0;
                    if (targetZ > 600)       { opacity = 0; scale = 1.35; el.style.pointerEvents = "none"; }
                    else if (targetZ > 0)    { opacity = 1 - targetZ / 600; scale = 1 + (targetZ / 600) * 0.25; el.style.pointerEvents = "none"; }
                    else if (targetZ >= -4000) {
                        const d = Math.abs(targetZ);
                        opacity = Math.max(0, 1 - d / 3200);
                        scale   = Math.max(0.4, 1 - d / 5000);
                        blur    = isMob ? 0 : Math.min(10, d / 320);
                        el.style.pointerEvents = d < 400 ? "auto" : "none";
                    } else { opacity = 0; scale = 0.3; el.style.pointerEvents = "none"; }

                    el.style.opacity   = opacity.toFixed(3);
                    el.style.filter    = blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : "none";
                    el.style.transform = `translate3d(calc(-50% + ${xPos}px), -50%, ${targetZ.toFixed(1)}px) rotateY(${rotY}deg) scale(${scale.toFixed(3)})`;
                });

                renderer.render(scene, camera);
            };

            animationFrameId = requestAnimationFrame(loop);

            const onResize = () => {
                if (!canvasContainerRef.current) return;
                const nW = canvasContainerRef.current.clientWidth || W;
                const nH = canvasContainerRef.current.clientHeight || H;
                renderer.setSize(nW, nH);
                uniforms.iResolution.value.set(nW, nH);
            };
            window.addEventListener("resize", onResize);

            cleanupFn = () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener("resize", onResize);
                geo.dispose(); mat.dispose(); renderer.dispose();
                renderer.forceContextLoss();
                if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
            };
        });

        return () => { cleanupFn?.(); };
    }, [profiles.length]);

    // Input handlers
    const goToSlide = useCallback((index: number) => {
        targetProgressRef.current = Math.max(0, Math.min(profiles.length - 1, index));
        setIsAutoPlaying(false);
    }, [profiles.length]);

    // Drag and swipe navigation (non-blocking for page scroll)
    const isDraggingRef = useRef(false);
    const startXRef    = useRef(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onMouseDown = (e: MouseEvent) => {
            isDraggingRef.current = true;
            startXRef.current = e.clientX;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const dx = (startXRef.current - e.clientX) * 0.003;
            startXRef.current = e.clientX;
            setIsAutoPlaying(false);
            targetProgressRef.current = Math.max(0, Math.min(profiles.length - 0.1, targetProgressRef.current + dx));
        };

        const onMouseUp = () => {
            isDraggingRef.current = false;
        };

        let touchX = 0, touchY = 0;
        const onTouchStart = (e: TouchEvent) => {
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            const rawDx = touchX - e.touches[0].clientX;
            const rawDy = touchY - e.touches[0].clientY;
            touchX = e.touches[0].clientX;
            touchY = e.touches[0].clientY;
            // Vertical drags scroll the page; only sideways swipes move through the tunnel.
            if (Math.abs(rawDx) <= Math.abs(rawDy)) return;
            const dx = rawDx * 0.006;
            setIsAutoPlaying(false);
            targetProgressRef.current = Math.max(0, Math.min(profiles.length - 0.1, targetProgressRef.current + dx));
        };

        el.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        el.addEventListener("touchstart", onTouchStart, { passive: true });
        el.addEventListener("touchmove", onTouchMove, { passive: true });

        return () => {
            el.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            el.removeEventListener("touchstart", onTouchStart);
            el.removeEventListener("touchmove", onTouchMove);
        };
    }, [profiles.length]);


    const currentProfile = profiles[activeSlideIndex] || profiles[0] || DEFAULT_PROFILES[0];

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[470px] sm:h-[600px] md:h-[640px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-[#02050B] shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none my-2 sm:my-6"
        >
            {/* 3D WebGL Shader Canvas (bounded inside section) */}
            <div ref={canvasContainerRef} className="absolute inset-0" style={{ zIndex: 0 }} />

            {!threeLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 animate-pulse" />
            )}

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_35%,rgba(2,5,11,0.88)_100%)] pointer-events-none" style={{ zIndex: 1 }} />

            {/* 3D Cards Stage */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ perspective: "1000px", perspectiveOrigin: "50% 50%", transformStyle: "preserve-3d", zIndex: 10 }}
            >
                {profiles.map((profile, idx) => {
                    const isActive = idx === activeSlideIndex;
                    return (
                        <div
                            key={profile.id || idx}
                            ref={el => { slideRefs.current[idx] = el; }}
                            className="absolute top-1/2 left-1/2 w-[min(250px,72vw)] sm:w-[340px] h-[320px] sm:h-[430px] rounded-3xl p-1 pointer-events-auto cursor-pointer"
                            style={{
                                willChange: "transform, opacity, filter",
                                transformStyle: "preserve-3d",
                                background: isActive
                                    ? "linear-gradient(135deg,rgba(0,212,255,0.9) 0%,rgba(124,58,237,0.7) 100%)"
                                    : "linear-gradient(135deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.06) 100%)",
                                boxShadow: isActive
                                    ? "0 20px 50px -10px rgba(0,212,255,0.45),0 0 30px rgba(0,212,255,0.3)"
                                    : "0 15px 30px rgba(0,0,0,0.8)",
                            }}
                            onClick={() => {
                                goToSlide(idx);
                                if (onSelectMember) onSelectMember(profile);
                            }}
                        >
                            <div className="relative w-full h-full rounded-[22px] bg-[#070D1B] p-3 sm:p-4 flex flex-col justify-between overflow-hidden border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
                                <div className="flex justify-between items-center z-10">
                                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-lg truncate max-w-[65%]">
                                        {profile.tag}
                                    </span>
                                    <span className="text-white/60 font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest">
                                        {profile.catalogId}
                                    </span>
                                </div>

                                <div className="my-2.5 relative w-full flex-1 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 group">
                                    <img
                                        src={profile.photo}
                                        alt={profile.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#070D1B] via-transparent to-transparent" />
                                </div>

                                <div className="z-10 pt-0.5 flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm sm:text-lg font-extrabold tracking-tight text-white font-mono uppercase truncate">
                                            {profile.name}
                                        </h3>
                                        <p className="text-cyan-400 text-[10px] sm:text-[11px] font-mono font-bold tracking-wide truncate">
                                            {profile.role}
                                        </p>
                                    </div>
                                    <span className="text-xs text-white/50 hover:text-cyan-300 font-mono flex items-center gap-1 shrink-0 ml-2">
                                        Bio <ExternalLink size={11} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── TOP SECTION HEADER (Inside Container — No Overlap with Navbar) ── */}
            <div className="absolute top-0 left-0 w-full px-3 sm:px-5 py-3 sm:py-4 flex justify-between items-center gap-2 z-20 pointer-events-auto bg-gradient-to-b from-black/70 via-black/30 to-transparent">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-white tracking-widest uppercase">
                        <span className="sm:hidden">TEAM TUNNEL</span>
                        <span className="hidden sm:inline">3D TEAM HYPERSPACE TUNNEL</span>
                    </span>
                </div>
                <button
                    onClick={() => setIsAutoPlaying(p => !p)}
                    aria-label={isAutoPlaying ? "Pause tunnel" : "Play tunnel"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-mono tracking-wider transition-all cursor-pointer"
                >
                    {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                    <span className="hidden sm:inline">{isAutoPlaying ? "PAUSE" : "AUTO PLAY"}</span>
                </button>
            </div>

            {/* ── BOTTOM SECTION CONTROLS (Inside Container — No Overlap with MEVY AI) ── */}
            <div className="absolute bottom-0 left-0 w-full px-3 sm:px-5 py-3 sm:py-4 flex justify-between items-center gap-3 z-20 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* Active profile badge */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 font-mono text-cyan-400 text-xs font-bold tracking-widest">
                        {String(activeSlideIndex + 1).padStart(2, "0")} / {String(profiles.length).padStart(2, "0")}
                    </span>
                    <span className="hidden sm:inline text-white/30">•</span>
                    <span className="hidden sm:inline font-mono text-xs text-white/90 tracking-wide uppercase truncate max-w-[280px]">
                        {currentProfile?.name} ({currentProfile?.role})
                    </span>
                    <span className="sm:hidden font-mono text-[10px] text-white/50 uppercase tracking-wider truncate">
                        ← swipe →
                    </span>
                </div>

                {/* Arrow Controls & Dots */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => goToSlide(Math.max(0, activeSlideIndex - 1))}
                        disabled={activeSlideIndex === 0}
                        className="p-2.5 sm:p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/15 text-white transition-all cursor-pointer"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={15} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1 px-1">
                        {profiles.slice(0, 12).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    i === activeSlideIndex ? "w-6 bg-cyan-400 shadow-[0_0_10px_#00D4FF]" : "w-1.5 bg-white/30 hover:bg-white/60"
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => goToSlide(Math.min(profiles.length - 1, activeSlideIndex + 1))}
                        disabled={activeSlideIndex === profiles.length - 1}
                        className="p-2.5 sm:p-1.5 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/15 text-white transition-all cursor-pointer"
                        aria-label="Next"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeamTunnelSystem;
