"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
    ArrowRight, Zap, Users, Calendar, Trophy, Sparkles 
} from "lucide-react";
import { isVideoMedia } from "@/lib/media";
import LandingLogoReveal from "@/components/ui/LandingLogoReveal";
import HeroKineticTitle from "@/components/ui/HeroKineticTitle";

// Interactive Particle canvas component (Mobile battery & CPU optimized)
function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isMobile = window.innerWidth < 768;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; color: string; alpha: number;
        }> = [];

        const colors = ["#00D4FF", "#7C3AED", "#4F46E5", "#8B5CF6", "#06B6D4"];
        const particleCount = isMobile ? 35 : 85;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
                vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
                size: Math.random() * 2 + 0.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.2,
            });
        }

        let animId: number;

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const maxDistance = isMobile ? 80 : 110;
            const maxConnections = isMobile ? 4 : 7;

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
                ctx.fill();

                // Subtle neural connections between nearby particles
                particles.slice(i + 1, i + maxConnections).forEach((p2) => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.07 * (1 - dist / maxDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            animId = requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} id="particle-canvas" className="absolute inset-0 z-0 pointer-events-none" />;
}

// Smooth Count-Up Animated Number
function AnimatedNumber({ target, suffix = "+" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const num = Number(target);
        if (isNaN(num) || num <= 0) {
            setCount(0);
            return;
        }

        let start = 0;
        const duration = 1400; // ms
        const startTime = performance.now();

        const updateCount = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOutProgress * num);
            setCount(current);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                setCount(num);
            }
        };

        requestAnimationFrame(updateCount);
    }, [target]);

    return (
        <span>
            {count.toLocaleString()}
            {target > 0 ? suffix : ""}
        </span>
    );
}

// Responsive Statistics Counter Card
function StatCounter({ value, label, icon: Icon, color, loading }: {
    value: number; label: string; icon: any; color: string; loading?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center card-3d glass rounded-2xl p-4 sm:p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all"
        >
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${color}18 0%, transparent 70%)` }}
            />
            <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl mx-auto mb-2.5 sm:mb-3 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}
            >
                <Icon size={20} className="sm:w-[22px] sm:h-[22px]" style={{ color }} />
            </div>
            <div className="font-orbitron font-bold text-2xl sm:text-3xl lg:text-4xl mb-1 drop-shadow-[0_0_12px_rgba(0,212,255,0.3)] tracking-tight" style={{ color }}>
                {loading ? (
                    <span className="inline-block w-16 h-7 bg-white/10 rounded-md animate-pulse align-middle" />
                ) : (
                    <AnimatedNumber target={value} />
                )}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm font-medium line-clamp-1">{label}</div>
        </motion.div>
    );
}

export default function HomePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [stats, setStats] = useState({ events: 0, members: 0, achievements: 0, participants: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const [isRevealDone, setIsRevealDone] = useState(false);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.35]);

    const handleRevealComplete = () => {
        setIsRevealDone(true);
        if (heroVideoRef.current) {
            heroVideoRef.current.play().catch(() => {});
        }
    };

    useEffect(() => {
        // Fetch public events
        fetch("/api/events")
            .then(r => r.ok ? r.json() : [])
            .then(d => setEvents(Array.isArray(d) ? d.slice(0, 4) : []))
            .catch(() => setEvents([]));

        // Fetch public achievements
        fetch("/api/achievements")
            .then(r => r.ok ? r.json() : [])
            .then(d => setAchievements(Array.isArray(d) ? d.slice(0, 3) : []))
            .catch(() => setAchievements([]));

        // Fetch real public statistics
        setStatsLoading(true);
        fetch("/api/public/stats")
            .then(r => r.ok ? r.json() : { events: 0, members: 0, achievements: 0, participants: 0 })
            .then(d => {
                setStats({
                    events: Number(d.events) || 0,
                    members: Number(d.members) || 0,
                    achievements: Number(d.achievements) || 0,
                    participants: Number(d.participants) || 0
                });
                setStatsLoading(false);
            })
            .catch(() => {
                setStatsLoading(false);
            });
    }, []);

    return (
        <div className="relative min-h-screen bg-aira-bg text-white selection:bg-aira-cyan/30 selection:text-white overflow-x-hidden">
            {/* Cinematic Logo Reveal Video Intro */}
            <LandingLogoReveal onComplete={handleRevealComplete} />

            {/* ═══════════════════════════════════════════════════════════
               HERO SECTION: TWO-COLUMN CYBER STAGE (WOLF SPOTLIGHT & NARRATIVE)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section
                style={{ opacity: heroOpacity }}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                    setPointer({ x, y });
                }}
                onMouseLeave={() => setPointer({ x: 0, y: 0 })}
                className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:py-0"
            >
                {/* 1. Ambient Background Aurora & Glows */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.22),rgba(99,102,241,0.12)_45%,transparent_75%)] pointer-events-none z-[1]" />
                <div className="absolute top-1/3 right-1/4 w-[28rem] sm:w-[34rem] h-[24rem] sm:h-[30rem] rounded-full bg-cyan-500/[0.12] blur-[120px] sm:blur-[150px] pointer-events-none z-[1]" />
                <div className="absolute bottom-1/4 left-1/4 w-[24rem] sm:w-[30rem] h-[24rem] sm:h-[30rem] rounded-full bg-indigo-600/[0.1] blur-[120px] sm:blur-[140px] pointer-events-none z-[1]" />

                {/* 2. Cyber Laser Scanning Line */}
                <motion.div
                    animate={{ y: ["-5%", "105%"] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent shadow-[0_0_20px_rgba(56,189,248,0.4)] pointer-events-none z-[2]"
                />

                {/* 3. Neural Particle Canvas */}
                <ParticleCanvas />

                {/* ═══════════════════════════════════════════════════════════
                   HERO MAIN CONTENT (TWO-COLUMN GRID: NARRATIVE & WOLF STAGE)
                   ═══════════════════════════════════════════════════════════ */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
                        
                        {/* ══ LEFT COLUMN: NARRATIVE, KINETIC TITLE & CTAs (lg:col-span-7) ══ */}
                        <motion.div
                            style={{
                                x: pointer.x * 5,
                                y: pointer.y * 3,
                            }}
                            className="lg:col-span-7 flex flex-col items-start text-left order-2 lg:order-1"
                        >
                            {/* 3D Kinetic Animated Title & Rotating Frontier Domain Badge */}
                            <HeroKineticTitle />

                            {/* Clean Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.25 }}
                                className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl leading-relaxed font-light"
                            >
                                Pioneering autonomous intelligence, robotics, and next-generation systems. 
                                Empowering innovators, creators, and engineers to build the future.
                            </motion.p>

                            {/* Call to Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-8"
                            >
                                <Link
                                    href="/events"
                                    className="group relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-slate-100 text-slate-950 font-bold text-xs sm:text-sm hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden text-center"
                                >
                                    <span className="relative z-10">Explore Events</span>
                                    <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                                
                                <Link
                                    href="/join"
                                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl glass border border-white/20 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-center"
                                >
                                    <Sparkles size={15} className="text-sky-400" />
                                    <span>Join AiRA Lab</span>
                                </Link>
                            </motion.div>

                            {/* Micro-Features / Trust Ribbon */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.55 }}
                                className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 border-t border-white/10 text-[11px] sm:text-xs font-mono text-slate-400"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                                    <span className="text-slate-300 font-semibold">Live AI Lab</span>
                                </div>
                                <div className="h-3 w-px bg-white/10 hidden sm:block" />
                                <div className="text-slate-400">
                                    <span className="text-sky-400 font-semibold">5</span> Frontier Wings
                                </div>
                                <div className="h-3 w-px bg-white/10 hidden sm:block" />
                                <div className="text-slate-400">
                                    Autonomous Systems & Research
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* ══ RIGHT COLUMN: 3D CYBER WOLF SPOTLIGHT STAGE (lg:col-span-5) ══ */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.2 }}
                            style={{
                                x: pointer.x * -8,
                                y: pointer.y * -6,
                            }}
                            className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2 w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none relative"
                        >
                            {/* Ambient Wolf Backlight Halo */}
                            <div className="absolute inset-0 -inset-x-4 -inset-y-4 bg-gradient-to-tr from-sky-500/25 via-indigo-500/20 to-cyan-400/25 rounded-3xl blur-3xl opacity-75 pointer-events-none" />

                            {/* Futuristic Cyber Frame Capsule */}
                            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-strong border border-sky-400/35 shadow-[0_0_45px_rgba(56,189,248,0.22)] group">
                                
                                {/* Top Cyber HUD Bar */}
                                <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-950/85 border-b border-sky-400/25 backdrop-blur-xl text-[10px] sm:text-[11px] font-mono select-none">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                                        </span>
                                        <span className="text-sky-300 font-semibold tracking-wider">MEVY · 3D AI MASCOT</span>
                                    </div>
                                    <span className="text-slate-400 text-[9px] sm:text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                        LIVE PREVIEW
                                    </span>
                                </div>

                                {/* Video Canvas Viewport - 100% Clear Wolf View */}
                                <div className="relative aspect-[16/11] xs:aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                    <video
                                        ref={heroVideoRef}
                                        src="/hero-loop.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                        poster="/mevy_1.png"
                                        style={{
                                            transform: "translate3d(0,0,0)",
                                            backfaceVisibility: "hidden",
                                            WebkitBackfaceVisibility: "hidden",
                                            willChange: "transform",
                                        }}
                                        className="w-full h-full object-contain sm:object-cover object-center filter contrast-[1.05] brightness-[1.03] group-hover:scale-105 transition-transform duration-700 bg-slate-950"
                                        onEnded={(e) => {
                                            e.currentTarget.currentTime = 0;
                                            e.currentTarget.play().catch(() => {});
                                        }}
                                    />

                                    {/* Soft Vignette Border Fade inside the capsule */}
                                    <div className="absolute inset-0 pointer-events-none border border-white/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.55)]" />

                                    {/* Futuristic Corner Tech Accents */}
                                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sky-400 pointer-events-none" />
                                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sky-400 pointer-events-none" />
                                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sky-400 pointer-events-none" />
                                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sky-400 pointer-events-none" />
                                </div>

                                {/* Bottom Cyber Status Strip */}
                                <div className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
                                    <span className="text-slate-400">AiRA Autonomous Neural Engine</span>
                                    <span className="text-cyan-400 font-semibold">60 FPS · ACTIVE</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Transition gradient */}
            <div className="h-12 sm:h-16 bg-gradient-to-b from-transparent to-aira-bg pointer-events-none" />

            {/* ═══════════════════════════════════════════════════════════
               STATISTICS SECTION (REAL LIVE DATABASE DATA)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto relative z-10 bg-aira-bg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    <StatCounter 
                        value={stats.events} 
                        label="Events Conducted" 
                        icon={Calendar} 
                        color="#38BDF8" 
                        loading={statsLoading} 
                    />
                    <StatCounter 
                        value={stats.members} 
                        label="Team Members" 
                        icon={Users} 
                        color="#E2E8F0" 
                        loading={statsLoading} 
                    />
                    <StatCounter 
                        value={stats.achievements} 
                        label="Achievements" 
                        icon={Trophy} 
                        color="#F59E0B" 
                        loading={statsLoading} 
                    />
                    <StatCounter 
                        value={stats.participants} 
                        label="Participants" 
                        icon={Zap} 
                        color="#60A5FA" 
                        loading={statsLoading} 
                    />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
               RECENT EVENTS PREVIEW
               ═══════════════════════════════════════════════════════════ */}
            {events.length > 0 && (
                <section className="py-8 sm:py-12 px-4 max-w-7xl mx-auto relative z-10 bg-aira-bg">
                    <div className="flex items-end justify-between mb-6 sm:mb-8">
                        <div>
                            <p className="text-aira-cyan font-medium text-xs sm:text-sm mb-1 font-orbitron tracking-widest uppercase">Latest</p>
                            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white">Recent Events</h2>
                        </div>
                        <Link href="/events" className="text-aira-cyan text-xs sm:text-sm hover:underline flex items-center gap-1 font-semibold group">
                            <span>View All</span> 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {events.map((event) => {
                            const primaryMedia = event.images?.find((img: any) => img.isPrimary) || event.images?.[0];
                            const img = primaryMedia?.url || "/images/event-placeholder.jpg";
                            const isUpcoming = new Date(event.date) > new Date();
                            return (
                                <Link key={event.id} href={`/events/${event.id}`} className="group block">
                                    <div className="netflix-card relative rounded-xl overflow-hidden aspect-[4/5] xs:aspect-[2/3] bg-aira-card group border border-white/5 hover:border-aira-cyan/40 transition-all duration-300 shadow-xl">
                                        {isVideoMedia(primaryMedia) ? (
                                            <video
                                                src={img}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={img}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x600/0d1526/00D4FF?text=AiRA+Lab"; }}
                                            />
                                        )}
                                        <div className="netflix-overlay absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex flex-col justify-end">
                                            <div className="mb-2">
                                                {isUpcoming ? (
                                                    <span className="badge-upcoming text-[11px]">Upcoming</span>
                                                ) : (
                                                    <span className="badge-completed text-[11px]">Completed</span>
                                                )}
                                            </div>
                                            <h3 className="font-orbitron font-bold text-sm sm:text-base text-white line-clamp-2">{event.title}</h3>
                                            <p className="text-xs text-slate-300 mt-1 font-mono">
                                                {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════
               ACHIEVEMENTS SECTION
               ═══════════════════════════════════════════════════════════ */}
            {achievements.length > 0 && (
                <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto relative z-10 bg-aira-bg">
                    <div className="text-center mb-8 sm:mb-12">
                        <p className="text-aira-gold font-medium text-xs sm:text-sm mb-1 font-orbitron tracking-widest uppercase">Our Pride</p>
                        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white">Achievements</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                        {achievements.map((ach, i) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass rounded-2xl p-5 sm:p-6 card-3d border border-aira-gold/20 hover:border-aira-gold/40 transition-all group"
                            >
                                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-300">{ach.icon || "🏆"}</div>
                                <h3 className="font-semibold text-white text-base sm:text-lg mb-2">{ach.title}</h3>
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{ach.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════
               CTA BANNER
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-12 sm:py-20 px-4 relative z-10 bg-aira-bg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center glass-strong rounded-3xl p-6 sm:p-10 md:p-14 border border-sky-400/25 shadow-2xl shadow-sky-950/40 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-radial from-sky-400/10 via-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-3 sm:mb-4">
                            Ready to <span className="gradient-text">Innovate?</span>
                        </h2>
                        <p className="text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto text-sm sm:text-base md:text-lg">
                            Join AiRA Lab and be part of a community that's building the future through technology and innovation.
                        </p>
                        <Link
                            href="/join"
                            className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-slate-100 text-slate-950 font-bold text-xs sm:text-sm hover:shadow-xl hover:shadow-sky-400/40 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <span>Apply to Join</span> 
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
