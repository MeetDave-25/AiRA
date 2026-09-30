"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { 
    ArrowRight, Zap, Users, Calendar, Trophy, Sparkles,
    Bot, Cpu, Code2, Shield, Radio, Layers, CheckCircle2, ChevronRight, Star
} from "lucide-react";
import { isVideoMedia } from "@/lib/media";
import HeroKineticTitle from "@/components/ui/HeroKineticTitle";
import LandingLogoReveal from "@/components/ui/LandingLogoReveal";

// Interactive Particle canvas component (Mobile battery & CPU optimized)
function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const isMobile = window.innerWidth < 768;
        let running = true;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; color: string; alpha: number;
        }> = [];

        const colors = ["#00D4FF", "#7C3AED", "#4F46E5", "#8B5CF6", "#06B6D4"];
        const particleCount = isMobile ? 30 : 70;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.35),
                vy: (Math.random() - 0.5) * (isMobile ? 0.2 : 0.35),
                size: Math.random() * 2 + 0.6,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.6 + 0.2,
            });
        }

        let animId: number;

        function animate() {
            if (!ctx || !canvas || !running) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const maxDistance = isMobile ? 70 : 100;
            const maxConnections = isMobile ? 3 : 5;

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

                // Subtle neural connections
                particles.slice(i + 1, i + maxConnections).forEach((p2) => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - dist / maxDistance)})`;
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

        const setRunning = (next: boolean) => {
            if (next === running) return;
            running = next;
            if (running) animate();
            else cancelAnimationFrame(animId);
        };
        const observer = new IntersectionObserver(([e]) => setRunning(e.isIntersecting && !document.hidden));
        observer.observe(canvas);
        const handleVisibility = () => setRunning(!document.hidden);
        document.addEventListener("visibilitychange", handleVisibility);

        const handleResize = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            running = false;
            cancelAnimationFrame(animId);
            observer.disconnect();
            document.removeEventListener("visibilitychange", handleVisibility);
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
            className="text-center card-3d glass rounded-2xl p-4 sm:p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all shadow-xl"
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

// Four Frontier Research Pillars
const FRONTIER_PILLARS = [
    {
        id: "robotics",
        title: "Autonomous Robotics",
        tagline: "ROS2, Kinematics & Swarm Systems",
        description: "Designing self-navigating rovers, multi-axis robotic manipulators, and real-time sensor fusion using LiDAR and computer vision.",
        icon: Bot,
        color: "#38BDF8",
        tags: ["ROS2", "LiDAR SLAM", "C++", "Kinematics", "Micro-ROS"],
        metric: "Frontier Hardware Lab",
    },
    {
        id: "ai-ml",
        title: "AI & Neural Architectures",
        tagline: "Deep Learning & Generative Models",
        description: "Engineering high-accuracy neural vision pipelines, autonomous decision agents, and domain-tuned LLMs for real-time edge processing.",
        icon: Cpu,
        color: "#818CF8",
        tags: ["PyTorch", "YOLOv8", "TensorRT", "Edge AI", "Transformers"],
        metric: "Neural Inference",
    },
    {
        id: "fullstack",
        title: "Distributed Platforms",
        tagline: "High-Throughput Web & Cloud",
        description: "Architecting zero-latency microservices, telemetry dashboards, and scalable distributed backends powering our entire research ecosystem.",
        icon: Code2,
        color: "#34D399",
        tags: ["Next.js", "TypeScript", "gRPC", "Docker", "PostgreSQL"],
        metric: "Scalable Infrastructure",
    },
    {
        id: "cyber-embedded",
        title: "Cyber & Embedded IoT",
        tagline: "Firmware Defense & Hardware Security",
        description: "Hardening IoT communication protocols, designing custom embedded PCB controllers, and performing rigorous security audits.",
        icon: Shield,
        color: "#F59E0B",
        tags: ["ESP32", "ARM Cortex", "Hardware Sec", "MQTT", "Rust"],
        metric: "Secure Firmware",
    },
];

// Interactive Journey Milestones
const LAB_MILESTONES = [
    {
        year: "2023",
        title: "Inception of AiRA Lab",
        subtitle: "The Genesis",
        desc: "Founded by passionate student technologists and mentors to bridge theoretical curriculum with frontier autonomous engineering.",
        badge: "Genesis",
        icon: Sparkles,
        color: "#38BDF8",
    },
    {
        year: "2024",
        title: "First Autonomous Hardware & Hackathons",
        subtitle: "Competitive Triumphs",
        desc: "Engineered our first custom rover prototype and dominated regional hackathons with breakthrough real-time computer vision systems.",
        badge: "Champions",
        icon: Trophy,
        color: "#F59E0B",
    },
    {
        year: "2025",
        title: "40+ Innovators & National Symposia",
        subtitle: "Ecosystem Expansion",
        desc: "Scaled into multiple specialized wings (Tech, Robotics, Management, Cyber) and hosted collegiate AI workshops for over 500+ participants.",
        badge: "Community",
        icon: Users,
        color: "#818CF8",
    },
    {
        year: "2026",
        title: "Autonomous AI Guide & Digital Periodical",
        subtitle: "The Next Era",
        desc: "Unveiled Mevy AI autonomous guide, launched the worldwide digital AiRA Magazine, and incubated production research projects.",
        badge: "Frontier",
        icon: Zap,
        color: "#34D399",
    },
];

export default function HomePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [stats, setStats] = useState({ events: 0, members: 0, achievements: 0, participants: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const pointerX = useMotionValue(0);
    const pointerY = useMotionValue(0);
    const parallaxX = useSpring(useTransform(pointerX, [-1, 1], [-14, 14]), { stiffness: 80, damping: 20 });
    const parallaxY = useSpring(useTransform(pointerY, [-1, 1], [-10, 10]), { stiffness: 80, damping: 20 });
    const videoX = useSpring(useTransform(pointerX, [-1, 1], [18, -18]), { stiffness: 60, damping: 20 });
    const videoY = useSpring(useTransform(pointerY, [-1, 1], [10, -10]), { stiffness: 60, damping: 20 });
    const [isRevealDone, setIsRevealDone] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.35]);

    const handleRevealComplete = () => {
        setIsRevealDone(true);
        setShowReveal(false);
        if (heroVideoRef.current) {
            heroVideoRef.current.play().catch(() => {});
        }
    };

    useEffect(() => {
        // Fetch public events
        fetch("/api/events")
            .then(r => r.ok ? r.json() : [])
            .then(d => setEvents(Array.isArray(d) ? d.slice(0, 3) : []))
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
            {/* Cinematic Landing Logo Reveal Preloader */}
            <LandingLogoReveal 
                onComplete={handleRevealComplete} 
                forceShow={showReveal} 
            />

            {/* ═══════════════════════════════════════════════════════════
               ACT 1: ARRIVAL (CINEMATIC HERO)
               ═══════════════════════════════════════════════════════════ */}
            <motion.section
                style={{ opacity: heroOpacity }}
                onPointerMove={(e) => {
                    if (e.pointerType !== "mouse") return;
                    const r = e.currentTarget.getBoundingClientRect();
                    pointerX.set(((e.clientX - r.left) / r.width) * 2 - 1);
                    pointerY.set(((e.clientY - r.top) / r.height) * 2 - 1);
                }}
                className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-16"
            >
                {/* Dynamic Aurora Ambient Light Beams */}
                <div className="absolute top-0 inset-x-0 h-[450px] sm:h-[500px] bg-[radial-gradient(ellipse_75%_55%_at_65%_-10%,rgba(56,189,248,0.25),rgba(6,182,212,0.14)_45%,transparent_70%)] pointer-events-none z-[1]" />
                <div className="absolute top-1/4 right-1/5 w-72 sm:w-[32rem] h-72 sm:h-[28rem] rounded-full bg-cyan-400/[0.14] blur-[100px] sm:blur-[150px] pointer-events-none z-[1]" />

                {/* Deep Video Background (Continuous Full Loop) */}
                <motion.div style={{ x: videoX, y: videoY, scale: 1.05 }} className="absolute inset-0 z-0 pointer-events-none select-none">
                    <video
                        ref={heroVideoRef}
                        src="/hero-loop.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
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

                    {/* Gradient depth masks */}
                    <div className="absolute inset-0 bg-gradient-to-r from-aira-bg/95 via-aira-bg/50 via-40% to-transparent lg:w-[48%] w-full" />
                    <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-aira-bg via-aira-bg/80 to-transparent" />
                    <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-aira-bg/90 via-aira-bg/30 to-transparent" />
                </motion.div>

                {/* Cyber Laser Scanning Line */}
                <motion.div
                    animate={{ y: ["-5%", "105%"] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/30 to-transparent shadow-[0_0_20px_rgba(56,189,248,0.4)] pointer-events-none z-[2]"
                />

                {/* Neural Particle Canvas */}
                <ParticleCanvas />

                {/* Hero Narrative Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        style={{ x: parallaxX, y: parallaxY }}
                        className="max-w-2xl flex flex-col items-start text-left"
                    >
                        {/* 3D Kinetic Animated Title */}
                        <HeroKineticTitle />

                        {/* Clean Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl leading-relaxed font-light"
                        >
                            Pioneering autonomous intelligence, robotics, and next-generation systems. 
                            Empowering student innovators, creators, and engineers to build the future.
                        </motion.p>

                        {/* Call to Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.45 }}
                            className="flex flex-col xs:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
                        >
                            <Link
                                href="/projects"
                                className="group relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-slate-100 text-slate-950 font-bold text-xs sm:text-sm hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden text-center font-orbitron"
                            >
                                <span className="relative z-10">Explore Projects</span>
                                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1.5 transition-transform" />
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                            
                            <Link
                                href="/join"
                                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl glass border border-white/20 text-white font-semibold text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 text-center font-orbitron"
                            >
                                <Sparkles size={15} className="text-sky-400" />
                                <span>Join AiRA Lab</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setShowReveal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-400 hover:text-sky-300 text-xs font-orbitron font-semibold transition-colors text-center cursor-pointer"
                                title="Replay Cinematic Intro"
                            >
                                <span>▶ Play Intro</span>
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
                <motion.a
                    href="#frontiers"
                    aria-label="Scroll to explore"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 text-[10px] font-orbitron tracking-[0.3em] uppercase text-slate-400 hover:text-sky-300 transition-colors"
                >
                    Scroll
                    <span className="w-5 h-8 rounded-full border border-current flex justify-center pt-1.5">
                        <motion.span
                            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                            className="w-1 h-1.5 rounded-full bg-sky-400"
                        />
                    </span>
                </motion.a>
            </motion.section>

            {/* Transition gradient */}
            <div className="h-12 sm:h-16 bg-gradient-to-b from-transparent to-aira-bg pointer-events-none" />

            {/* ═══════════════════════════════════════════════════════════
               ACT 2: THE FOUR FRONTIER PILLARS (WHAT WE DO)
               ═══════════════════════════════════════════════════════════ */}
            <section id="frontiers" className="scroll-mt-24 py-16 sm:py-24 px-4 max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aira-cyan/10 border border-aira-cyan/30 text-aira-cyan text-xs font-orbitron font-bold uppercase tracking-widest mb-3">
                        <Layers size={13} className="text-aira-cyan animate-pulse" />
                        Frontier Disciplines
                    </div>
                    <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-4">
                        What We <span className="gradient-text">Engineer</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                        AiRA Lab unites multi-disciplinary student researchers across four core technological pillars to build production-grade innovations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {FRONTIER_PILLARS.map((pillar, i) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div
                                key={pillar.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative rounded-3xl glass-strong border border-white/10 p-6 sm:p-8 hover:border-sky-400/40 transition-all duration-500 overflow-hidden hover:shadow-[0_0_35px_rgba(56,189,248,0.15)] flex flex-col justify-between"
                            >
                                <div 
                                    className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                                    style={{ background: pillar.color }}
                                />

                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-300 shadow-lg"
                                            style={{ 
                                                background: `${pillar.color}15`, 
                                                borderColor: `${pillar.color}40`,
                                                color: pillar.color 
                                            }}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                            {pillar.metric}
                                        </span>
                                    </div>

                                    <h3 className="font-orbitron font-bold text-xl sm:text-2xl text-white mb-1.5 group-hover:text-sky-300 transition-colors">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-xs font-mono text-sky-400/90 mb-3">
                                        {pillar.tagline}
                                    </p>
                                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
                                        {pillar.description}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                                    {pillar.tags.map((tag) => (
                                        <span 
                                            key={tag}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
               ACT 3: THE NUMBERS (LIVE DATABASE STATS)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-12 sm:py-20 px-4 max-w-6xl mx-auto relative z-10">
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
               ACT 4: CHRONICLES & MILESTONES (STORY TIMELINE)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-16 sm:py-24 px-4 max-w-5xl mx-auto relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-orbitron font-bold uppercase tracking-widest mb-3">
                        <Radio size={13} className="text-amber-400 animate-pulse" />
                        Our Trajectory
                    </div>
                    <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-tight mb-4">
                        The <span className="gradient-text">Chronicles</span> of AiRA
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                        From a modest cohort of hardware tinkerers to an award-winning innovation powerhouse.
                    </p>
                </div>

                <div className="relative border-l-2 border-sky-400/25 ml-4 sm:ml-32 space-y-12 sm:space-y-16 pl-6 sm:pl-10">
                    {LAB_MILESTONES.map((mile, i) => {
                        const Icon = mile.icon;
                        return (
                            <motion.div
                                key={mile.year}
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative group"
                            >
                                {/* Glowing Dot Node on Timeline */}
                                <div 
                                    className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-transform group-hover:scale-125 duration-300 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                                    style={{ borderColor: mile.color }}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ background: mile.color }} />
                                </div>

                                {/* Year Ribbon on Desktop */}
                                <div className="hidden sm:block absolute -left-36 top-1 font-orbitron font-extrabold text-lg text-sky-300 text-right w-24">
                                    {mile.year}
                                </div>

                                {/* Milestone Card */}
                                <div className="glass-strong p-6 sm:p-7 rounded-3xl border border-white/10 hover:border-sky-400/40 transition-all duration-300 shadow-xl group-hover:shadow-[0_0_30px_rgba(56,189,248,0.12)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="sm:hidden font-orbitron font-extrabold text-sm text-sky-300">
                                                {mile.year} •
                                            </span>
                                            <span 
                                                className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold border"
                                                style={{ 
                                                    background: `${mile.color}15`, 
                                                    borderColor: `${mile.color}40`,
                                                    color: mile.color 
                                                }}
                                            >
                                                {mile.badge}
                                            </span>
                                        </div>
                                        <Icon size={18} style={{ color: mile.color }} />
                                    </div>

                                    <h3 className="font-orbitron font-bold text-lg sm:text-xl text-white mb-1">
                                        {mile.title}
                                    </h3>
                                    <p className="text-xs font-mono text-slate-400 mb-2">
                                        {mile.subtitle}
                                    </p>
                                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                                        {mile.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
               ACT 5: THE WORK (RECENT EVENTS & HACKATHONS)
               ═══════════════════════════════════════════════════════════ */}
            {events.length > 0 && (
                <section className="py-16 sm:py-24 px-4 max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aira-cyan/10 border border-aira-cyan/30 text-aira-cyan text-xs font-orbitron font-bold uppercase tracking-widest mb-2">
                                <Calendar size={13} className="text-aira-cyan" />
                                Interactive Archive
                            </div>
                            <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white">Recent Lab Events</h2>
                        </div>
                        <Link href="/events" className="text-aira-cyan text-xs sm:text-sm hover:underline flex items-center gap-1 font-semibold group font-orbitron">
                            <span>Explore All Events</span> 
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => {
                            const primaryMedia = event.images?.find((img: any) => img.isPrimary) || event.images?.[0];
                            const img = primaryMedia?.url || "/images/event-placeholder.jpg";
                            const isUpcoming = new Date(event.date) > new Date();
                            return (
                                <Link key={event.id} href={`/events/${event.id}`} className="group block">
                                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-aira-card group border border-white/10 hover:border-aira-cyan/50 transition-all duration-300 shadow-xl group-hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] flex flex-col justify-end">
                                        {isVideoMedia(primaryMedia) ? (
                                            <video
                                                src={img}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <img
                                                src={img}
                                                alt={event.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x600/0d1526/00D4FF?text=AiRA+Lab"; }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-5 flex flex-col justify-end">
                                            <div className="mb-2">
                                                {isUpcoming ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-orbitron font-bold">Upcoming</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-orbitron font-bold">Completed</span>
                                                )}
                                            </div>
                                            <h3 className="font-orbitron font-bold text-base text-white line-clamp-2 mb-1 group-hover:text-sky-300 transition-colors">{event.title}</h3>
                                            <p className="text-xs text-slate-300 font-mono">
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
               ACT 6: OUR PRIDE (ACHIEVEMENTS)
               ═══════════════════════════════════════════════════════════ */}
            {achievements.length > 0 && (
                <section className="py-16 sm:py-20 px-4 max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-10 sm:mb-14">
                        <p className="text-aira-gold font-medium text-xs sm:text-sm mb-1 font-orbitron tracking-widest uppercase">Recognition & Honors</p>
                        <h2 className="font-orbitron font-black text-3xl sm:text-4xl text-white">Our Pride</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {achievements.map((ach, i) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-strong rounded-3xl p-6 card-3d border border-amber-400/20 hover:border-amber-400/50 transition-all group shadow-xl"
                            >
                                <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">{ach.icon || "🏆"}</div>
                                <h3 className="font-orbitron font-bold text-white text-base sm:text-lg mb-2">{ach.title}</h3>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">{ach.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ═══════════════════════════════════════════════════════════
               ACT 7: THE PORTAL (JOIN THE FRONTIER)
               ═══════════════════════════════════════════════════════════ */}
            <section className="py-16 sm:py-24 px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center glass-strong rounded-3xl p-8 sm:p-12 md:p-16 border border-sky-400/30 shadow-[0_0_50px_rgba(56,189,248,0.2)] relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />
                    
                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-400/15 border border-sky-400/30 text-sky-300 text-xs font-orbitron font-bold uppercase tracking-widest">
                            <Sparkles size={13} className="text-sky-400 animate-pulse" />
                            Next Cohort Open
                        </div>

                        <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white">
                            Ready to <span className="gradient-text">Innovate?</span>
                        </h2>

                        <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-sans">
                            Join AiRA Lab and collaborate with passionate engineers building next-generation robotics, autonomous AI, and distributed software systems.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link
                                href="/join"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-slate-100 text-slate-950 font-orbitron font-bold text-xs sm:text-sm hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                <span>Apply to Join AiRA</span> 
                                <ArrowRight size={16} />
                            </Link>

                            <Link
                                href="/about"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-xl glass border border-white/20 text-white font-orbitron font-semibold text-xs sm:text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                            >
                                <span>Meet Our Team</span> 
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
