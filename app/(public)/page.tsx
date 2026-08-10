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
               HERO SECTION WITH CONTINUOUS LOOP VIDEO BACKGROUND
               ═══════════════════════════════════════════════════════════ */}
            <motion.section
                style={{ opacity: heroOpacity }}
                className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-16"
            >
                {/* Dynamic Aurora Ambient Light Beams */}
                <div className="absolute top-0 inset-x-0 h-[450px] sm:h-[500px] bg-[radial-gradient(ellipse_75%_55%_at_65%_-10%,rgba(56,189,248,0.25),rgba(6,182,212,0.14)_45%,transparent_70%)] pointer-events-none z-[1]" />
                <div className="absolute top-1/4 right-1/5 w-72 sm:w-[32rem] h-72 sm:h-[28rem] rounded-full bg-cyan-400/[0.14] blur-[100px] sm:blur-[150px] pointer-events-none z-[1]" />

                {/* 1. Deep Video Background (Continuous Full Loop - Natural Framing) */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none">
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
                        }}
                        className="w-full h-full object-cover object-center sm:object-[60%_center] lg:object-[65%_center] opacity-95 lg:opacity-100 filter contrast-[1.03] brightness-[1.02]"
                        onEnded={(e) => {
                            e.currentTarget.currentTime = 0;
                            e.currentTarget.play().catch(() => {});
                        }}
                    />

                    {/* Gradient depth masks: Balances narrative readability on the left with full cinematic panorama */}
                    <div className="absolute inset-0 bg-gradient-to-r from-aira-bg/95 via-aira-bg/50 via-40% to-transparent lg:w-[48%] w-full" />
                    
                    {/* Bottom gradient fade into main content */}
                    <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-aira-bg via-aira-bg/80 to-transparent" />
                    
                    {/* Top gradient fade under navbar */}
                    <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-aira-bg/90 via-aira-bg/30 to-transparent" />
                </div>

                {/* 2. Cyber Laser Scanning Line */}
                <motion.div
                    animate={{ y: ["-5%", "105%"] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent shadow-[0_0_20px_rgba(56,189,248,0.4)] pointer-events-none z-[2]"
                />

                {/* 3. Neural Particle Canvas */}
                <ParticleCanvas />

                {/* 4. Glowing Dynamic Ambient Aura Spheres */}
                <motion.div
                    style={{ x: pointer.x * 20, y: pointer.y * 15 }}
                    className="absolute top-1/4 left-1/4 w-72 sm:w-[36rem] h-72 sm:h-[36rem] rounded-full bg-sky-500/[0.08] blur-[100px] sm:blur-[140px] pointer-events-none z-[1]"
                />
                <motion.div
                    style={{ x: pointer.x * -18, y: pointer.y * -12 }}
                    className="absolute bottom-1/4 right-1/4 w-60 sm:w-[30rem] h-60 sm:h-[30rem] rounded-full bg-indigo-500/[0.08] blur-[80px] sm:blur-[120px] pointer-events-none z-[1]"
                />

                {/* ═══════════════════════════════════════════════════════════
                   HERO MAIN CONTENT (LEFT NARRATIVE & CTAs)
                   ═══════════════════════════════════════════════════════════ */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        style={{
                            x: pointer.x * 6,
                            y: pointer.y * 4,
                        }}
                        className="max-w-2xl flex flex-col items-start text-left"
                    >
                        {/* 3D Kinetic Animated Title & Rotating Frontier Domain Badge */}
                        <HeroKineticTitle />

                        {/* Clean Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl leading-relaxed font-light"
                        >
                            Pioneering autonomous intelligence, robotics, and next-generation systems. 
                            Empowering innovators, creators, and engineers to build the future.
                        </motion.p>

                        {/* Call to Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.45 }}
                            className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
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
                    </motion.div>
                </div>

                {/* Bottom Right: Mevy AI Guide Floating Pill */}
                <div className="absolute bottom-6 right-4 sm:bottom-10 sm:right-8 z-10 hidden xs:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-sky-400/30 bg-slate-950/75 backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.2)] select-none">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden border border-sky-400/50 shadow-[0_0_8px_#38bdf8]">
                        <img src="/mevy_1.png" alt="Mevy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-orbitron font-bold text-[11px] text-sky-300">MEVY</span>
                        <Sparkles size={11} className="text-sky-400" />
                        <span className="text-[10px] font-mono text-slate-400">AI GUIDE · v4.2</span>
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
