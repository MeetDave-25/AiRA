"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Users, Calendar, Trophy } from "lucide-react";

// Particle canvas component
function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number; y: number; vx: number; vy: number;
            size: number; color: string; alpha: number;
        }> = [];

        const colors = ["#00D4FF", "#7C3AED", "#FF006E", "#F59E0B"];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.7 + 0.2,
            });
        }

        let animId: number;

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

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

                // Connect nearby particles
                particles.slice(i + 1).forEach((p2) => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 120)})`;
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
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} id="particle-canvas" className="absolute inset-0 z-0" />;
}

// Animated counter
function StatCounter({ value, label, icon: Icon, color }: {
    value: string; label: string; icon: any; color: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center card-3d glass rounded-2xl p-6 border border-white/5"
        >
            <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${color}20`, border: `1px solid ${color}40` }}
            >
                <Icon size={22} style={{ color }} />
            </div>
            <div className="font-orbitron font-bold text-3xl mb-1" style={{ color }}>
                {value}
            </div>
            <div className="text-slate-400 text-sm">{label}</div>
        </motion.div>
    );
}

export default function HomePage() {
    const [events, setEvents] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0 });
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.35]);
    const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.94]);

    useEffect(() => {
        fetch("/api/events")
            .then(r => r.ok ? r.json() : [])
            .then(d => setEvents(Array.isArray(d) ? d.slice(0, 4) : []))
            .catch(() => setEvents([]));

        fetch("/api/achievements")
            .then(r => r.ok ? r.json() : [])
            .then(d => setAchievements(Array.isArray(d) ? d.slice(0, 3) : []))
            .catch(() => setAchievements([]));
    }, []);

    return (
        <div className="relative min-h-screen">
            {/* Hero */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                onMouseMove={(e) => {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
                    setHeroPointer({ x, y });
                }}
                onMouseLeave={() => setHeroPointer({ x: 0, y: 0 })}
                className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg"
            >
                <ParticleCanvas />

                {/* Glow orbs */}
                <motion.div
                    style={{ x: heroPointer.x * 24, y: heroPointer.y * 16 }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-aira-cyan/10 blur-3xl"
                />
                <motion.div
                    style={{ x: heroPointer.x * -20, y: heroPointer.y * -14 }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-aira-magenta/10 blur-3xl"
                />

                <motion.div
                    style={{ x: heroPointer.x * 8, y: heroPointer.y * 6 }}
                    className="relative z-10 text-center px-4 max-w-5xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-aira-cyan/30 text-aira-cyan text-xs font-medium mb-8 font-orbitron tracking-widest"
                    >
                        <Zap size={12} className="text-aira-gold" />
                        INNOVATION · RESEARCH · EXCELLENCE
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="font-orbitron font-black text-6xl sm:text-7xl lg:text-8xl leading-none mb-6"
                    >
                        <span className="text-white">AIRA</span>
                        <br />
                        <span className="gradient-text text-glow-cyan">LABS</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Where innovation meets excellence. We conduct cutting-edge events,
                        workshops, and research programs that shape the next generation of
                        technology leaders.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/events"
                            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold text-sm hover:shadow-lg hover:shadow-aira-cyan/30 transition-all duration-300 hover:scale-105"
                        >
                            Explore Events
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/join"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-aira-magenta/40 text-aira-magenta font-semibold text-sm hover:bg-aira-magenta/10 hover:border-aira-magenta transition-all duration-300"
                        >
                            Join AIRA Labs
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs">
                    <span>Scroll to explore</span>
                    <div className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1">
                        <motion.div
                            className="w-1 h-2 rounded-full bg-aira-cyan"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                    </div>
                </div>
            </motion.section>

            <div className="h-20 bg-gradient-to-b from-transparent to-aira-bg pointer-events-none" />

            {/* Stats */}
            <section className="py-20 px-4 max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCounter value={`${events.length || "0"}+`} label="Events Conducted" icon={Calendar} color="#00D4FF" />
                    <StatCounter value="50+" label="Team Members" icon={Users} color="#7C3AED" />
                    <StatCounter value={`${achievements.length || "1"}+`} label="Achievements" icon={Trophy} color="#F59E0B" />
                    <StatCounter value="100+" label="Participants" icon={Zap} color="#FF006E" />
                </div>
            </section>

            {/* Recent Events Preview */}
            {events.length > 0 && (
                <section className="py-10 px-4 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-aira-cyan font-medium text-sm mb-1 font-orbitron tracking-widest uppercase">Latest</p>
                            <h2 className="font-orbitron font-bold text-3xl text-white">Recent Events</h2>
                        </div>
                        <Link href="/events" className="text-aira-cyan text-sm hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {events.map((event) => {
                            const img = event.images?.[0]?.url || "/images/event-placeholder.jpg";
                            const isUpcoming = new Date(event.date) > new Date();
                            return (
                                <Link key={event.id} href={`/events/${event.id}`}>
                                    <div className="netflix-card relative rounded-xl overflow-hidden aspect-[2/3] bg-aira-card">
                                        <img
                                            src={img}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x600/0d1526/00D4FF?text=AIRA+Labs"; }}
                                        />
                                        <div className="netflix-overlay absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 flex flex-col justify-end">
                                            <div className="mb-2">
                                                {isUpcoming ? (
                                                    <span className="badge-upcoming">Upcoming</span>
                                                ) : (
                                                    <span className="badge-completed">Completed</span>
                                                )}
                                            </div>
                                            <h3 className="font-orbitron font-bold text-sm text-white line-clamp-2">{event.title}</h3>
                                            <p className="text-xs text-slate-300 mt-1">
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

            {/* Achievements */}
            {achievements.length > 0 && (
                <section className="py-20 px-4 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-aira-gold font-medium text-sm mb-1 font-orbitron tracking-widest uppercase">Our Pride</p>
                        <h2 className="font-orbitron font-bold text-3xl text-white">Achievements</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {achievements.map((ach, i) => (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="glass rounded-2xl p-6 card-3d border border-aira-gold/20 hover:border-aira-gold/40 transition-all"
                            >
                                <div className="text-4xl mb-4">{ach.icon || "🏆"}</div>
                                <h3 className="font-semibold text-white mb-2">{ach.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{ach.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="py-20 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 border border-aira-cyan/20 glow-cyan relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-radial from-aira-cyan/10 to-transparent" />
                    <div className="relative z-10">
                        <h2 className="font-orbitron font-bold text-4xl text-white mb-4">
                            Ready to <span className="gradient-text">Innovate?</span>
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                            Join AIRA Labs and be part of a community that's building the future through technology and innovation.
                        </p>
                        <Link
                            href="/join"
                            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold hover:shadow-xl hover:shadow-aira-cyan/30 hover:scale-105 transition-all duration-300"
                        >
                            Apply to Join <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
