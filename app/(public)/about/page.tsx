"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Github,
    Linkedin,
    ExternalLink,
    Sparkles,
    Zap,
    Cpu,
    Code2,
    BrainCircuit,
    Globe2,
    Trophy,
    Users,
    Compass,
    Rocket,
    ArrowRight,
    Crown,
    Target,
    Quote,
    Flame,
    ShieldCheck,
} from "lucide-react";
import { Interactive3DMascot } from "@/components/ui/Interactive3DMascot";
import {
    SpotlightCard,
    MagneticButton,
    SplitText,
    GradientMesh,
    AuroraBackground,
    FloatingParticles,
    ScrollReveal,
    ShimmerBorder,
} from "@/components/ui/PremiumEffects";

function MemberModal({ member, onClose }: { member: any; onClose: () => void }) {
    if (!member) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-xl overflow-y-auto overscroll-contain p-3 sm:p-6 md:p-8 flex items-start sm:items-center justify-center min-h-screen"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="glass-strong rounded-3xl border border-white/20 shadow-2xl shadow-aira-cyan/20 w-full max-w-4xl max-h-[90vh] sm:max-h-[86vh] flex flex-col relative overflow-hidden my-auto z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background glow orbs */}
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-aira-cyan/15 blur-[90px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-aira-purple/15 blur-[90px] rounded-full pointer-events-none" />

                    {/* Top Bar with Badge & Close button */}
                    <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 border-b border-white/10 bg-slate-950/40 shrink-0 relative z-20">
                        <div className="flex items-center gap-2">
                            {member.isPresident ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-orbitron font-bold">
                                    👑 Executive Leader Profile
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aira-cyan/15 text-aira-cyan border border-aira-cyan/30 text-[11px] font-orbitron font-bold">
                                    🤖 AiRA Lab Member Profile
                                </span>
                            )}
                            {member.teamGroup && (
                                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                                    • {member.teamGroup}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full glass border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
                            aria-label="Close modal"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Modal Main Body (2 Columns on Laptop / 1 Column on Mobile) */}
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-y-auto overscroll-contain flex-1">
                        {/* Left Sidebar: Photo, Identity & Social Links */}
                        <div className="p-5 sm:p-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4 bg-slate-950/20">
                            {/* Profile Photo */}
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-2 border-aira-cyan/60 glow-cyan bg-slate-900 shadow-2xl">
                                    <img
                                        src={
                                            member.photo ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                member.name
                                            )}&background=0d1526&color=00D4FF&size=300`
                                        }
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                member.name
                                            )}&background=0d1526&color=00D4FF&size=300`;
                                        }}
                                    />
                                </div>
                                {member.isPresident && (
                                    <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center gap-1 text-[10px] font-bold text-slate-950 shadow-lg ring-2 ring-slate-950">
                                        👑 FOUNDER
                                    </div>
                                )}
                            </div>

                            {/* Name & Title */}
                            <div className="w-full">
                                <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white tracking-tight break-words">
                                    {member.name}
                                </h2>
                                <p className="text-aira-cyan font-semibold text-xs sm:text-sm mt-1 leading-snug">
                                    {member.role}
                                </p>
                                {member.teamGroup && (
                                    <span className="inline-block px-3 py-1 mt-2 text-[11px] font-semibold rounded-full bg-aira-purple/25 text-violet-300 border border-aira-purple/40">
                                        {member.teamGroup}
                                    </span>
                                )}
                            </div>

                            {/* Social Buttons */}
                            <div className="flex flex-col gap-2 w-full pt-2">
                                {member.linkedin && (
                                    <a
                                        href={
                                            member.linkedin.startsWith("http")
                                                ? member.linkedin
                                                : `https://${member.linkedin}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center md:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/50 text-blue-300 text-xs font-semibold hover:bg-[#0077b5]/30 hover:scale-[1.02] transition-all shadow-md w-full"
                                    >
                                        <Linkedin size={15} className="shrink-0" />
                                        <span className="truncate">LinkedIn Profile</span>
                                    </a>
                                )}
                                {member.github && (
                                    <a
                                        href={
                                            member.github.startsWith("http")
                                                ? member.github
                                                : `https://${member.github}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center md:justify-start gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 hover:scale-[1.02] transition-all shadow-md w-full"
                                    >
                                        <Github size={15} className="shrink-0" />
                                        <span className="truncate">GitHub Workspace</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Right Main Content: Bio Statement & Background */}
                        <div className="p-5 sm:p-8 flex flex-col justify-between space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-orbitron font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-white/10">
                                    <Quote size={15} className="text-aira-cyan" />
                                    <span>About & Vision</span>
                                </div>

                                {member.bio ? (
                                    <div className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed font-sans space-y-3 break-words">
                                        {member.bio.split("\n\n").map((para: string, i: number) => (
                                            <p key={i} className="leading-relaxed text-slate-300">
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic">
                                        No bio statement provided yet.
                                    </p>
                                )}
                            </div>

                            {/* Bottom Metadata */}
                            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Active AiRA Labs Contributor</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
                                >
                                    Close Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Orbiting member card with hover tooltip
function OrbitCard({ member, onClick }: { member: any; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group block relative focus:outline-none"
            title={member.name}
        >
            <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border-2 border-aira-cyan/40 group-hover:border-aira-cyan group-hover:shadow-[0_0_20px_#00D4FF] transition-all duration-300 transform group-hover:scale-125 active:scale-95 text-[10px] text-white">
                    <img
                        src={
                            member.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                member.name
                            )}&background=0d1526&color=00D4FF&size=120`
                        }
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                member.name
                            )}&background=0d1526&color=00D4FF&size=120`;
                        }}
                    />
                </div>
                {member.isPresident && (
                    <div className="absolute -top-1 -right-1 text-xs z-10">👑</div>
                )}
                {/* Floating Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-xl glass border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-aira-cyan text-[10px]">
                        {(member.role || "").slice(0, 24)}
                    </div>
                </div>
            </div>
        </button>
    );
}

export default function AboutPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [activeGroup, setActiveGroup] = useState<string>("ALL");
    const [isOrbitPaused, setIsOrbitPaused] = useState(false);
    const [orbitRadius, setOrbitRadius] = useState(200);

    useEffect(() => {
        fetch("/api/team-members")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setMembers(Array.isArray(d) ? d : []))
            .catch(() => setMembers([]));

        fetch("/api/settings")
            .then((r) => (r.ok ? r.json() : {}))
            .then((d) => setSettings(d))
            .catch(() => setSettings({}));

        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setOrbitRadius(125);
            } else if (width < 1024) {
                setOrbitRadius(175);
            } else {
                setOrbitRadius(215);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const nonPresidents = useMemo(() => members.filter((m) => !m.isPresident), [members]);
    const president = useMemo(() => members.find((m) => m.isPresident) || members[0], [members]);

    // Unique groups for filtering
    const teamGroups = useMemo(() => {
        const groups = new Set<string>();
        members.forEach((m) => {
            if (m.teamGroup && m.teamGroup.trim()) {
                groups.add(m.teamGroup.trim());
            }
        });
        return ["ALL", ...Array.from(groups)];
    }, [members]);

    const filteredMembers = useMemo(() => {
        if (activeGroup === "ALL") return members;
        return members.filter((m) => m.teamGroup === activeGroup);
    }, [members, activeGroup]);

    const corePillars = [
        {
            icon: BrainCircuit,
            title: "Autonomous Intelligence",
            desc: "Pioneering neural architectures, computer vision models, robotic kinematics, and generative systems.",
            color: "#38BDF8",
        },
        {
            icon: Code2,
            title: "Full-Stack Innovation",
            desc: "Engineering high-throughput software, distributed cloud systems, and real-time computing stacks.",
            color: "#6366F1",
        },
        {
            icon: Trophy,
            title: "Competitive Excellence",
            desc: "Dominating national hackathons, publishing collegiate research papers, and global challenges.",
            color: "#F59E0B",
        },
        {
            icon: Rocket,
            title: "Student-Led Impact",
            desc: "Empowering undergraduate researchers to incubate production ventures and patent inventions.",
            color: "#F43F5E",
        },
    ];

    return (
        <div className="pt-24 pb-20 min-h-screen bg-aira-bg text-white relative overflow-hidden">
            {/* Background 3D Aurora Mesh */}
            <GradientMesh />
            <AuroraBackground />
            <FloatingParticles count={30} />
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

            {/* ═══════════════════════════════════════════════════════════
                1. CINEMATIC HERO SECTION WITH INTERACTIVE 3D ORBIT SYSTEM
               ═══════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[580px] sm:min-h-[700px] flex flex-col items-center justify-center overflow-hidden px-4">
                {/* Background 3D Typography */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-between w-full max-w-5xl pointer-events-none select-none z-0 px-4 opacity-10">
                    <motion.span
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-6xl sm:text-8xl md:text-9xl text-white tracking-widest leading-none"
                    >
                        AB
                    </motion.span>
                    <motion.span
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-6xl sm:text-8xl md:text-9xl text-white tracking-widest leading-none"
                    >
                        OUT
                    </motion.span>
                </div>

                {/* Interactive Orbit System */}
                <div
                    className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[580px] md:h-[580px] flex items-center justify-center z-10"
                    onMouseEnter={() => setIsOrbitPaused(true)}
                    onMouseLeave={() => setIsOrbitPaused(false)}
                >
                    {/* Concentric Glowing Orbit Rings */}
                    <div
                        className="absolute rounded-full border border-aira-cyan/30 pointer-events-none shadow-[0_0_25px_rgba(0,212,255,0.15)] animate-pulse"
                        style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                    />
                    <div
                        className="absolute rounded-full border border-white/10 pointer-events-none"
                        style={{ width: orbitRadius * 2 + 30, height: orbitRadius * 2 + 30 }}
                    />

                    {/* Orbit 2 Ring */}
                    {nonPresidents.length > 6 && (
                        <>
                            <div
                                className="absolute rounded-full border border-dashed border-purple-500/35 pointer-events-none shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                style={{ width: orbitRadius * 2.8, height: orbitRadius * 2.8 }}
                            />
                            <div
                                className="absolute rounded-full border border-white/10 pointer-events-none"
                                style={{ width: orbitRadius * 2.8 + 35, height: orbitRadius * 2.8 + 35 }}
                            />
                        </>
                    )}

                    {/* Central Hero Card / President with 3D Float */}
                    <motion.div
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-20 cursor-pointer group"
                        onClick={() => president && setSelectedMember(president)}
                    >
                        <div className="relative">
                            <div className="w-36 h-48 sm:w-48 sm:h-60 md:w-52 md:h-64 rounded-3xl overflow-hidden border-2 border-aira-cyan/60 glow-cyan bg-slate-950 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                                <img
                                    src={
                                        president?.photo ||
                                        settings.lab_main_image ||
                                        "https://placehold.co/300x400/020817/00D4FF?text=AiRA+Lab"
                                    }
                                    alt={president?.name || "AiRA Lab"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/300x400/020817/00D4FF?text=AiRA+Lab";
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full glass-panel-glow border border-aira-cyan/40 text-center whitespace-nowrap shadow-xl">
                                <p className="font-orbitron font-bold text-xs text-white">
                                    {president?.name || "AiRA Lab"}
                                </p>
                                <p className="text-[10px] text-aira-cyan font-medium">
                                    {president?.role || "Innovation Center"}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Orbit 1: Inner Orbit */}
                    {nonPresidents.length > 0 && (
                        <div
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{
                                animation: isOrbitPaused ? "none" : "spin 32s linear infinite",
                            }}
                        >
                            {(nonPresidents.length <= 6
                                ? nonPresidents
                                : nonPresidents.slice(0, 6)
                            ).map((member, i, arr) => {
                                const angle = (360 / arr.length) * i;
                                return (
                                    <div
                                        key={member.id}
                                        className="absolute left-1/2 top-1/2 -ml-6 -mt-6 sm:-ml-8 sm:-mt-8 pointer-events-auto"
                                        style={{
                                            transform: `rotate(${angle}deg) translate(${orbitRadius}px) rotate(-${angle}deg)`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                animation: isOrbitPaused
                                                    ? "none"
                                                    : "counterspin 32s linear infinite",
                                            }}
                                        >
                                            <OrbitCard
                                                member={member}
                                                onClick={() => setSelectedMember(member)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Orbit 2: Outer Orbit */}
                    {nonPresidents.length > 6 && (
                        <div
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{
                                animation: isOrbitPaused ? "none" : "counterspin 50s linear infinite",
                            }}
                        >
                            {nonPresidents.slice(6).map((member, i, arr) => {
                                const angle = (360 / arr.length) * i;
                                const radius2 = orbitRadius * 1.4;
                                return (
                                    <div
                                        key={member.id}
                                        className="absolute left-1/2 top-1/2 -ml-6 -mt-6 sm:-ml-8 sm:-mt-8 pointer-events-auto"
                                        style={{
                                            transform: `rotate(${angle}deg) translate(${radius2}px) rotate(-${angle}deg)`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                animation: isOrbitPaused
                                                    ? "none"
                                                    : "spin 50s linear infinite",
                                            }}
                                        >
                                            <OrbitCard
                                                member={member}
                                                onClick={() => setSelectedMember(member)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-10 text-center z-10 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-xs text-slate-300 px-3.5 py-1.5 rounded-full glass border border-white/10 inline-flex items-center gap-1.5 shadow-lg shadow-black/40">
                        <Sparkles size={13} className="text-aira-cyan animate-pulse" /> Hover to pause orbit • Click profile for bio
                    </span>
                    {nonPresidents.length > 6 && (
                        <span className="text-xs text-purple-300 px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 inline-flex items-center gap-1.5 font-mono">
                            ⚡ 2 Orbits Active ({nonPresidents.length} Members)
                        </span>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                2. MISSION & PURPOSE STATEMENT (SPOTLIGHT CARD)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center relative z-10">
                <ScrollReveal direction="up">
                    <SpotlightCard
                        spotlightColor="rgba(0, 212, 255, 0.18)"
                        className="p-8 sm:p-12 rounded-3xl border-white/10 space-y-4"
                    >
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-aira-cyan font-orbitron">
                            Our Purpose & Mission
                        </span>
                        <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-white">
                            Empowering the Next Generation of{" "}
                            <span className="gradient-text-animated">Innovators</span>
                        </h2>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-sans font-normal">
                            {settings.lab_about_text ||
                                "AiRA (Artificial Intelligence & Robotics Association) Lab is a premier innovation and research hub. We unite passionate engineers, designers, and researchers to push the frontiers of autonomous technologies, intelligence, and modern computing."}
                        </p>
                    </SpotlightCard>
                </ScrollReveal>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                3. CORE PILLARS / WHAT WE DO (SPOTLIGHT CARDS)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <ScrollReveal direction="up">
                    <div className="text-center mb-12">
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400 font-orbitron">
                            DNA Pillars
                        </span>
                        <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mt-1">
                            Driven by <span className="gradient-text-animated">Excellence</span>
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {corePillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        return (
                            <ScrollReveal key={idx} delay={idx * 0.1} direction="up">
                                <SpotlightCard
                                    spotlightColor={`${pillar.color}25`}
                                    className="p-7 h-full flex flex-col justify-between border-white/[0.08] hover:border-white/[0.2] transition-all duration-300"
                                >
                                    <div>
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-lg"
                                            style={{
                                                background: `radial-gradient(circle at top left, ${pillar.color}30, ${pillar.color}10)`,
                                                border: `1px solid ${pillar.color}45`,
                                                boxShadow: `0 0 20px ${pillar.color}25`,
                                            }}
                                        >
                                            <Icon size={22} style={{ color: pillar.color }} />
                                        </div>
                                        <h3 className="font-orbitron font-bold text-lg text-white mb-2">
                                            {pillar.title}
                                        </h3>
                                        <p className="text-sm text-slate-300 leading-relaxed font-sans font-normal">
                                            {pillar.desc}
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </ScrollReveal>
                        );
                    })}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                4. 3D CYBER MASCOT SHOWCASE (MEET MD)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <ScrollReveal direction="up">
                    <SpotlightCard
                        spotlightColor="rgba(168, 85, 247, 0.22)"
                        className="p-8 sm:p-12 border-purple-500/30 rounded-3xl"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                            {/* Left: 3D Parallax Mascot Card */}
                            <div className="lg:col-span-5 flex justify-center">
                                <Interactive3DMascot
                                    size="lg"
                                    showSpeechBubble={true}
                                    speechText="A New Mind. A New Energy. A New Impact. ⚡"
                                    className="mx-auto"
                                />
                            </div>

                            {/* Right: Mascot Story, Traits & Interactive Badges */}
                            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-orbitron font-bold uppercase tracking-wider">
                                    <Sparkles size={13} className="text-amber-400" />
                                    OFFICIAL LAB MASCOT & AI GUIDE
                                </div>

                                <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white tracking-tight">
                                    Meet <span className="gradient-text-animated">Mevy</span> · 3D Cyber Wolf
                                </h2>

                                <p className="text-slate-300 text-base leading-relaxed font-sans">
                                    Engineered at the intersection of robotics, generative AI, and autonomous systems, Mevy the 3D Cyber Wolf embodies the fierce curiosity, pack spirit, and fearless innovation of AiRA Lab.
                                </p>

                                {/* 3 Core Mascot Tenets */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                                    <div className="p-4 rounded-2xl glass-panel-3d text-left">
                                        <span className="text-[10px] font-orbitron text-aira-cyan font-bold block mb-1">
                                            01 · VISION
                                        </span>
                                        <p className="text-xs text-white font-semibold font-orbitron">A New Mind</p>
                                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                            Neural curiosity and fearless learning.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl glass-panel-3d text-left">
                                        <span className="text-[10px] font-orbitron text-purple-400 font-bold block mb-1">
                                            02 · DRIVE
                                        </span>
                                        <p className="text-xs text-white font-semibold font-orbitron">A New Energy</p>
                                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                            High-voltage hackathon momentum.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl glass-panel-3d text-left">
                                        <span className="text-[10px] font-orbitron text-pink-400 font-bold block mb-1">
                                            03 · LEGACY
                                        </span>
                                        <p className="text-xs text-white font-semibold font-orbitron">A New Impact</p>
                                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                                            Human-centered engineering breakthroughs.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                    <MagneticButton
                                        onClick={() => {
                                            if (typeof window !== "undefined") {
                                                window.dispatchEvent(new CustomEvent("open-aira-chat"));
                                            }
                                        }}
                                        magnetStrength={0.25}
                                    >
                                        <span className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-500 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-aira-cyan/25 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform font-orbitron">
                                            <Sparkles size={16} /> Chat with Mevy AI Guide
                                        </span>
                                    </MagneticButton>

                                    <MagneticButton href="/join" magnetStrength={0.25}>
                                        <span className="px-7 py-3.5 rounded-xl glass-panel-3d border border-white/15 text-slate-200 hover:text-white text-sm hover:border-aira-cyan/40 transition-all font-semibold flex items-center gap-2 font-orbitron">
                                            Join the Pack <ArrowRight size={15} />
                                        </span>
                                    </MagneticButton>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </ScrollReveal>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                5. FULL TEAM SHOWCASE GRID (SPOTLIGHT CARDS)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <ScrollReveal direction="up">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-aira-cyan font-orbitron">
                                Our Collective
                            </span>
                            <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mt-1">
                                Meet the <span className="gradient-text-cyan">Team</span>
                            </h2>
                        </div>

                        <Link
                            href="/leadership"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400/20 hover:scale-105 transition-all shadow-md"
                        >
                            <Crown size={15} className="text-amber-400" />
                            <span>View Founders & Executive Board →</span>
                        </Link>

                        {/* Group Filter Buttons */}
                        {teamGroups.length > 2 && (
                            <div className="flex flex-wrap gap-2">
                                {teamGroups.map((grp) => (
                                    <button
                                        key={grp}
                                        onClick={() => setActiveGroup(grp)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                            activeGroup === grp
                                                ? "bg-aira-cyan/20 text-aira-cyan border-aira-cyan/50 shadow-md shadow-aira-cyan/20"
                                                : "bg-slate-900/40 text-slate-400 border-white/5 hover:bg-white/5"
                                        }`}
                                    >
                                        {grp}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMembers.map((member, i) => (
                        <ScrollReveal key={member.id} delay={i * 0.03} direction="up">
                            <SpotlightCard
                                spotlightColor="rgba(0, 212, 255, 0.16)"
                                className="p-4 text-center cursor-pointer border-white/[0.08] hover:border-aira-cyan/50 transition-all duration-300 hover:scale-[1.03]"
                            >
                                <button
                                    onClick={() => setSelectedMember(member)}
                                    className="w-full text-center flex flex-col items-center justify-between h-full"
                                >
                                    <div className="w-full">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-aira-cyan/60 mx-auto mb-3 transition-all flex items-center justify-center bg-slate-900 text-xs text-white relative shadow-lg">
                                            <img
                                                src={
                                                    member.photo ||
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        member.name
                                                    )}&background=0d1526&color=00D4FF&size=120`
                                                }
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                        member.name
                                                    )}&background=0d1526&color=00D4FF&size=120`;
                                                }}
                                            />
                                            {member.isPresident && (
                                                <div className="absolute top-0 right-0 text-xs">👑</div>
                                            )}
                                        </div>
                                        <p className="font-semibold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-aira-cyan transition-colors">
                                            {member.name}
                                        </p>
                                        <p className="text-aira-cyan text-[11px] mt-0.5 line-clamp-1">
                                            {member.role}
                                        </p>
                                    </div>

                                    {member.teamGroup && (
                                        <span className="text-[10px] text-slate-400 mt-2.5 block truncate w-full font-mono">
                                            {member.teamGroup}
                                        </span>
                                    )}
                                </button>
                            </SpotlightCard>
                        </ScrollReveal>
                    ))}

                    {filteredMembers.length === 0 && (
                        <div className="col-span-full glass p-10 rounded-2xl border border-white/5 text-center text-slate-400">
                            No team profiles found for this group.
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                6. JOIN US CTA BANNER (SHIMMER BORDER + MAGNETIC BUTTON)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <ScrollReveal direction="up">
                    <ShimmerBorder borderRadius="1.5rem">
                        <div className="relative p-10 sm:p-14 text-center overflow-hidden rounded-[inherit]">
                            <div className="absolute inset-0 bg-gradient-radial from-aira-cyan/15 via-aira-purple/10 to-transparent pointer-events-none" />

                            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
                                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-aira-cyan/30 text-aira-cyan text-xs font-orbitron font-bold tracking-widest uppercase">
                                    <Flame size={14} className="text-aira-magenta" /> Ready to make an impact?
                                </span>

                                <h2 className="font-orbitron font-black text-3xl sm:text-5xl text-white leading-tight">
                                    Join the <span className="gradient-text-animated">AiRA Lab</span> Team
                                </h2>

                                <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                                    We are constantly seeking ambitious researchers, developers, and designers to build next-generation technologies together.
                                </p>

                                <div className="pt-3 flex justify-center">
                                    <MagneticButton href="/join" magnetStrength={0.3}>
                                        <span className="inline-flex items-center gap-3 px-10 py-4.5 rounded-xl bg-gradient-to-r from-aira-cyan via-aira-purple to-aira-magenta text-white font-semibold text-base shadow-2xl shadow-aira-cyan/30 hover:shadow-aira-cyan/50 hover:scale-105 transition-all duration-300">
                                            Apply for Membership
                                            <ArrowRight size={18} />
                                        </span>
                                    </MagneticButton>
                                </div>
                            </div>
                        </div>
                    </ShimmerBorder>
                </ScrollReveal>
            </section>

            {/* ══ Member Profile Details Modal ══ */}
            {selectedMember && (
                <MemberModal
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
}
