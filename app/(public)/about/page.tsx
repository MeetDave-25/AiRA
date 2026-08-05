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
    Target
} from "lucide-react";

function MemberModal({ member, onClose }: { member: any; onClose: () => void }) {
    if (!member) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 24 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="glass-strong rounded-3xl p-6 sm:p-8 max-w-lg w-full relative border border-white/15 shadow-2xl shadow-aira-cyan/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center text-slate-400 hover:text-aira-cyan hover:border-aira-cyan/40 transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="text-center mb-6">
                        <div className="relative inline-block mb-4">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-aira-cyan/60 glow-cyan mx-auto bg-slate-900">
                                <img
                                    src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=200`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=200`; 
                                    }}
                                />
                            </div>
                            {member.isPresident && (
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm shadow-md">
                                    👑
                                </div>
                            )}
                        </div>

                        <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">{member.name}</h2>
                        <p className="text-aira-cyan text-sm font-medium mt-1">{member.role}</p>
                        {member.teamGroup && (
                            <span className="inline-block px-3 py-1 mt-2 text-xs rounded-full bg-aira-purple/20 text-violet-300 border border-aira-purple/30">
                                {member.teamGroup}
                            </span>
                        )}
                    </div>

                    {member.bio && (
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 mb-6 text-slate-300 text-sm leading-relaxed text-center">
                            {member.bio}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3">
                        {member.linkedin && (
                            <a 
                                href={member.linkedin.startsWith("http") ? member.linkedin : `https://${member.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-aira-cyan/30 text-aira-cyan text-xs hover:bg-aira-cyan/15 hover:scale-105 transition-all font-semibold"
                            >
                                <Linkedin size={15} /> LinkedIn
                            </a>
                        )}
                        {member.github && (
                            <a 
                                href={member.github.startsWith("http") ? member.github : `https://${member.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/15 text-slate-200 text-xs hover:border-aira-cyan/40 hover:text-aira-cyan hover:scale-105 transition-all font-semibold"
                            >
                                <Github size={15} /> GitHub
                            </a>
                        )}
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
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border-2 border-aira-cyan/40 group-hover:border-aira-cyan group-hover:shadow-lg group-hover:shadow-aira-cyan/50 transition-all duration-300 transform group-hover:scale-125 active:scale-95 text-[10px] text-white">
                    <img
                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=120`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=120`; 
                        }}
                    />
                </div>
                {member.isPresident && (
                    <div className="absolute -top-1 -right-1 text-xs z-10">👑</div>
                )}
                {/* Floating Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-xl glass border border-white/10 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-aira-cyan text-[10px]">{(member.role || "").slice(0, 24)}</div>
                </div>
            </div>
        </button>
    );
}

const DEFAULT_PEOPLE = [
    {
        id: "member-1",
        name: "Meet Dave",
        role: "Founder & Lead Architect",
        bio: "Pioneering intelligent robotics architectures and autonomous control systems.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        teamGroup: "Core Team",
        isPresident: true,
    },
    {
        id: "member-2",
        name: "Rohan Varma",
        role: "Autonomous Navigation Researcher",
        bio: "Developing SLAM algorithms, LiDAR point cloud segmentation, and path-planning modules.",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
        teamGroup: "Robotics Division",
        isPresident: false,
    },
    {
        id: "member-3",
        name: "Ananya Iyer",
        role: "Full-Stack & Cloud Systems Engineer",
        bio: "Architecting real-time telemetry pipelines and interactive web dashboards.",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
        teamGroup: "AI & Software Division",
        isPresident: false,
    },
    {
        id: "member-4",
        name: "Dev Patel",
        role: "Computer Vision & Edge ML Engineer",
        bio: "Optimizing YOLO models and TensorRT pipelines for low-power onboard drones.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        teamGroup: "AI & Software Division",
        isPresident: false,
    },
    {
        id: "member-5",
        name: "Sneha Reddy",
        role: "Hardware & PCB Design Specialist",
        bio: "Designing multi-layer power distribution boards and STM32 sensor interfaces.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
        teamGroup: "Hardware & Embedded Systems",
        isPresident: false,
    }
];

export default function AboutPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [activeGroup, setActiveGroup] = useState<string>("ALL");
    const [isOrbitPaused, setIsOrbitPaused] = useState(false);
    const [orbitRadius, setOrbitRadius] = useState(200);

    useEffect(() => {
        fetch("/api/team-members")
            .then(r => r.ok ? r.json() : [])
            .then(d => {
                if (Array.isArray(d) && d.length > 0) {
                    setMembers(d);
                } else {
                    setMembers(DEFAULT_PEOPLE);
                }
            })
            .catch(() => setMembers(DEFAULT_PEOPLE));

        fetch("/api/settings")
            .then(r => r.ok ? r.json() : {})
            .then(d => setSettings(d))
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

    const nonPresidents = useMemo(() => members.filter(m => !m.isPresident), [members]);
    const president = useMemo(() => members.find(m => m.isPresident) || members[0], [members]);

    // Unique groups for filtering
    const teamGroups = useMemo(() => {
        const groups = new Set<string>();
        members.forEach(m => {
            if (m.teamGroup && m.teamGroup.trim()) {
                groups.add(m.teamGroup.trim());
            }
        });
        return ["ALL", ...Array.from(groups)];
    }, [members]);

    const filteredMembers = useMemo(() => {
        if (activeGroup === "ALL") return members;
        return members.filter(m => m.teamGroup === activeGroup);
    }, [members, activeGroup]);

    const corePillars = [
        {
            icon: BrainCircuit,
            title: "Autonomous Intelligence",
            desc: "Pioneering research in neural architectures, computer vision, robotics, and generative AI systems."
        },
        {
            icon: Code2,
            title: "Full-Stack Innovation",
            desc: "Engineering scalable software, distributed cloud systems, and real-time interactive experiences."
        },
        {
            icon: Trophy,
            title: "Competitive Excellence",
            desc: "Representing at national hackathons, research symposiums, and global engineering challenges."
        },
        {
            icon: Rocket,
            title: "Student-Led Impact",
            desc: "Empowering undergraduate researchers to incubate production-ready ventures and publish breakthroughs."
        }
    ];

    return (
        <div className="pt-24 pb-20 min-h-screen relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-hero-glow opacity-30 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

            {/* ══ Hero Section with Interactive Orbit ══ */}
            <section className="relative min-h-[580px] sm:min-h-[680px] flex flex-col items-center justify-center overflow-hidden px-4">
                {/* Background Typography */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-between w-full max-w-5xl pointer-events-none select-none z-0 px-4">
                    <motion.span
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-5xl sm:text-8xl md:text-9xl text-white/5 tracking-widest leading-none"
                    >
                        AB
                    </motion.span>
                    <motion.span
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-5xl sm:text-8xl md:text-9xl text-white/5 tracking-widest leading-none"
                    >
                        OUT
                    </motion.span>
                </div>

                {/* Interactive Orbit System */}
                <div 
                    className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] flex items-center justify-center z-10"
                    onMouseEnter={() => setIsOrbitPaused(true)}
                    onMouseLeave={() => setIsOrbitPaused(false)}
                >
                    {/* Orbit Ring */}
                    <div 
                        className="absolute rounded-full border border-aira-cyan/20 pointer-events-none animate-pulse"
                        style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                    />
                    <div 
                        className="absolute rounded-full border border-white/5 pointer-events-none"
                        style={{ width: orbitRadius * 2 + 40, height: orbitRadius * 2 + 40 }}
                    />

                    {/* Central Hero Card / President */}
                    <motion.div
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-20 cursor-pointer group"
                        onClick={() => president && setSelectedMember(president)}
                    >
                        <div className="relative">
                            <div className="w-36 h-48 sm:w-48 sm:h-60 md:w-52 md:h-64 rounded-3xl overflow-hidden border-2 border-aira-cyan/50 glow-cyan bg-slate-950 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                                <img
                                    src={president?.photo || settings.lab_main_image || "https://placehold.co/300x400/020817/00D4FF?text=AiRA+Lab"}
                                    alt={president?.name || "AiRA Lab"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        (e.target as HTMLImageElement).src = "https://placehold.co/300x400/020817/00D4FF?text=AiRA+Lab"; 
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass border border-aira-cyan/40 text-center whitespace-nowrap shadow-lg">
                                <p className="font-orbitron font-bold text-xs text-white">{president?.name || "AiRA Lab"}</p>
                                <p className="text-[10px] text-aira-cyan">{president?.role || "Innovation Center"}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Orbiting Members Container */}
                    {nonPresidents.length > 0 && (
                        <div 
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{ 
                                animation: isOrbitPaused ? "none" : "spin 32s linear infinite" 
                            }}
                        >
                            {nonPresidents.map((member, i) => {
                                const angle = (360 / nonPresidents.length) * i;
                                return (
                                    <div
                                        key={member.id}
                                        className="absolute left-1/2 top-1/2 -ml-6 -mt-6 sm:-ml-8 sm:-mt-8 pointer-events-auto"
                                        style={{ 
                                            transform: `rotate(${angle}deg) translate(${orbitRadius}px) rotate(-${angle}deg)` 
                                        }}
                                    >
                                        <div style={{ animation: isOrbitPaused ? "none" : "counterspin 32s linear infinite" }}>
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

                <div className="mt-8 text-center z-10">
                    <span className="text-xs text-slate-400 px-3 py-1 rounded-full glass border border-white/10 inline-flex items-center gap-1.5">
                        <Sparkles size={12} className="text-aira-cyan" /> Hover to pause orbit • Click any profile to view bio
                    </span>
                </div>
            </section>

            {/* ══ About Statement Section ══ */}
            <section className="max-w-4xl mx-auto px-4 py-12 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass p-8 sm:p-10 rounded-3xl border border-white/10 animated-border space-y-4"
                >
                    <span className="text-xs font-semibold uppercase tracking-widest text-aira-cyan">Our Purpose & Mission</span>
                    <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
                        Empowering the Next Generation of <span className="gradient-text-cyan">Innovators</span>
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
                        {settings.lab_about_text || "AiRA (Artificial Intelligence & Robotics Association) Lab is a premier innovation and research hub. We unite passionate engineers, designers, and researchers to push the frontiers of autonomous technologies, intelligence, and modern computing."}
                    </p>
                </motion.div>
            </section>

            {/* ══ Core Pillars / What We Do ══ */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">Core Pillars</span>
                    <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mt-1">
                        Driven by <span className="gradient-text">Excellence</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {corePillars.map((pillar, idx) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className="glass p-6 rounded-2xl border border-white/5 hover:border-aira-cyan/30 transition-all group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-aira-cyan/10 border border-aira-cyan/20 flex items-center justify-center text-aira-cyan group-hover:scale-110 transition-transform mb-4">
                                        <Icon size={22} />
                                    </div>
                                    <h3 className="font-orbitron font-bold text-base text-white mb-2">{pillar.title}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ══ Full Team Showcase Grid ══ */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-aira-cyan">Our People</span>
                        <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mt-1">
                            Meet the <span className="gradient-text-cyan">Team</span>
                        </h2>
                    </div>

                    <Link
                        href="/leadership"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400/20 hover:scale-105 transition-all shadow-md"
                    >
                        <Crown size={14} className="text-amber-400" />
                        <span>View Founders & Executive Board →</span>
                    </Link>

                    {/* Group Filter Buttons */}
                    {teamGroups.length > 2 && (
                        <div className="flex flex-wrap gap-2">
                            {teamGroups.map(grp => (
                                <button
                                    key={grp}
                                    onClick={() => setActiveGroup(grp)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                                        activeGroup === grp 
                                            ? "bg-aira-cyan/20 text-aira-cyan border-aira-cyan/50" 
                                            : "bg-slate-900/40 text-slate-400 border-white/5 hover:bg-white/5"
                                    }`}
                                >
                                    {grp}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMembers.map((member, i) => (
                        <motion.button
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => setSelectedMember(member)}
                            className="glass rounded-2xl p-4 text-center hover:border-aira-cyan/40 border border-white/5 transition-all card-3d group flex flex-col items-center justify-between"
                        >
                            <div className="w-full">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-aira-cyan/60 mx-auto mb-3 transition-all flex items-center justify-center bg-slate-900 text-xs text-white relative">
                                    <img
                                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=120`}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { 
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=120`; 
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
                                <span className="text-[10px] text-slate-500 mt-2 block truncate w-full">
                                    {member.teamGroup}
                                </span>
                            )}
                        </motion.button>
                    ))}

                    {filteredMembers.length === 0 && (
                        <div className="col-span-full glass p-10 rounded-2xl border border-white/5 text-center text-slate-400">
                            No team profiles found for this group.
                        </div>
                    )}
                </div>
            </section>

            {/* ══ Join Us CTA Banner ══ */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                <div className="glass p-8 sm:p-12 rounded-3xl border border-aira-cyan/30 text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-aira-cyan/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-aira-purple/20 blur-3xl rounded-full pointer-events-none" />

                    <span className="text-xs font-semibold uppercase tracking-widest text-aira-cyan">Ready to make an impact?</span>
                    <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white mt-2 mb-4">
                        Join the <span className="gradient-text-cyan">AiRA Lab</span> Team
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
                        We are constantly seeking ambitious researchers, developers, and designers to build next-generation technologies together.
                    </p>
                    <Link
                        href="/join"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold rounded-xl text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/20"
                    >
                        Apply for Membership <ArrowRight size={16} />
                    </Link>
                </div>
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
