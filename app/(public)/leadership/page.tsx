"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Crown, 
    Sparkles, 
    Linkedin, 
    Github, 
    ExternalLink, 
    X, 
    Shield, 
    BrainCircuit, 
    Rocket, 
    Zap, 
    Users, 
    ArrowRight,
    Target,
    Award,
    Mail,
    Globe2,
    Layers,
    Quote
} from "lucide-react";

interface LeaderProfile {
    id: string;
    name: string;
    role: string;
    bio?: string | null;
    photo?: string | null;
    linkedin?: string | null;
    github?: string | null;
    teamGroup?: string | null;
    sortOrder?: number;
    isPresident?: boolean;
}

// Fallback initial leaders if none seeded yet
const DEFAULT_LEADERS: LeaderProfile[] = [
    {
        id: "founder-1",
        name: "Meet Dave",
        role: "Founder & Lead Architect",
        bio: "Pioneering intelligent robotics architectures, generative AI integration, and autonomous control systems. Leading AiRA Lab's core vision and technological frontiers.",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        teamGroup: "Founders & Executive Board",
        sortOrder: 1,
        isPresident: true,
    },
    {
        id: "lead-2",
        name: "Aarav Sharma",
        role: "Co-Founder & AI Research Director",
        bio: "Specializing in deep reinforcement learning, neural scene representations, and edge AI deployment on embedded autonomous systems.",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        github: "https://github.com",
        teamGroup: "Founders & Executive Board",
        sortOrder: 2,
        isPresident: true,
    },
    {
        id: "lead-3",
        name: "Dr. Rajesh Patel",
        role: "Chief Faculty Mentor & Dean of Research",
        bio: "Advising lab initiatives, peer-reviewed publications, and strategic industry collaborations across robotics and automation domains.",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
        linkedin: "https://linkedin.com",
        teamGroup: "Advisors & Mentors",
        sortOrder: 3,
        isPresident: false,
    },
    {
        id: "lead-4",
        name: "Priya Nair",
        role: "Lead Systems & Hardware Engineer",
        bio: "Directing PCB design, micro-actuation systems, sensor fusion arrays, and real-time embedded communication pipelines.",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        teamGroup: "Domain & Tech Leads",
        sortOrder: 4,
        isPresident: false,
    }
];

function LeaderDetailModal({ leader, onClose }: { leader: LeaderProfile | null; onClose: () => void }) {
    if (!leader) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99995] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="glass-strong rounded-3xl p-6 sm:p-8 max-w-xl w-full relative border border-white/20 shadow-2xl shadow-aira-cyan/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background glow orb */}
                    <div className="absolute -top-16 -right-16 w-52 h-52 bg-aira-cyan/20 blur-3xl rounded-full pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-aira-magenta/20 blur-3xl rounded-full pointer-events-none" />

                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-aira-cyan/50 transition-all z-10"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="text-center relative z-10 mb-6">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 border-aira-cyan glow-cyan mx-auto bg-slate-950 shadow-2xl">
                                <img
                                    src={leader.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=00D4FF&size=300`}
                                    alt={leader.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=00D4FF&size=300`; 
                                    }}
                                />
                            </div>
                            {leader.isPresident && (
                                <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center gap-1 text-[11px] font-bold text-slate-950 shadow-lg ring-2 ring-slate-950">
                                    <Crown size={12} className="fill-slate-950" /> FOUNDER / LEAD
                                </div>
                            )}
                        </div>

                        <h2 className="font-orbitron font-bold text-2xl text-white tracking-tight">{leader.name}</h2>
                        <p className="text-aira-cyan font-medium text-sm mt-1">{leader.role}</p>

                        {leader.teamGroup && (
                            <span className="inline-block px-3.5 py-1 mt-2.5 text-xs font-semibold rounded-full bg-aira-purple/25 text-violet-300 border border-aira-purple/40">
                                {leader.teamGroup}
                            </span>
                        )}
                    </div>

                    {leader.bio && (
                        <div className="p-5 bg-slate-900/80 rounded-2xl border border-white/10 mb-6 text-slate-200 text-sm leading-relaxed text-center relative font-sans">
                            <Quote size={20} className="text-aira-cyan/40 mb-2 mx-auto" />
                            <p className="italic">"{leader.bio}"</p>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {leader.linkedin && (
                            <a 
                                href={leader.linkedin.startsWith("http") ? leader.linkedin : `https://${leader.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/50 text-blue-300 text-xs font-semibold hover:bg-[#0077b5]/30 hover:scale-105 transition-all shadow-md"
                            >
                                <Linkedin size={16} /> LinkedIn Profile
                            </a>
                        )}
                        {leader.github && (
                            <a 
                                href={leader.github.startsWith("http") ? leader.github : `https://${leader.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 hover:scale-105 transition-all shadow-md"
                            >
                                <Github size={16} /> GitHub Workspace
                            </a>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function LeadershipPage() {
    const [leaders, setLeaders] = useState<LeaderProfile[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [selectedLeader, setSelectedLeader] = useState<LeaderProfile | null>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/team-members").then(r => r.ok ? r.json() : []).catch(() => []),
            fetch("/api/settings").then(r => r.ok ? r.json() : {}).catch(() => ({}))
        ]).then(([membersData, settingsData]) => {
            if (Array.isArray(membersData) && membersData.length > 0) {
                // Filter only leaders/presidents/board/directors
                const dbLeaders = membersData.filter((m: any) => {
                    const grp = (m.teamGroup || "").toLowerCase();
                    return (
                        m.isPresident === true ||
                        grp.includes("founder") ||
                        grp.includes("executive") ||
                        grp.includes("director") ||
                        grp.includes("advisor") ||
                        grp.includes("mentor") ||
                        grp.includes("lead")
                    );
                });
                setLeaders(dbLeaders.length > 0 ? dbLeaders : membersData);
            } else {
                setLeaders(DEFAULT_LEADERS);
            }
            setSettings(settingsData || {});
            setIsLoading(false);
        });
    }, []);

    // Filter categories
    const categories = useMemo(() => {
        const groups = new Set<string>();
        leaders.forEach(l => {
            if (l.teamGroup) groups.add(l.teamGroup);
        });
        return ["ALL", ...Array.from(groups)];
    }, [leaders]);

    // Executive/Founders vs Grid list
    const executiveSpotlight = useMemo(() => {
        return leaders.filter(l => l.isPresident || l.sortOrder === 1 || (l.role || "").toLowerCase().includes("founder") || (l.role || "").toLowerCase().includes("president"));
    }, [leaders]);

    const filteredLeaders = useMemo(() => {
        if (activeTab === "ALL") return leaders;
        return leaders.filter(l => l.teamGroup === activeTab);
    }, [leaders, activeTab]);

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-br from-aira-cyan/15 via-aira-purple/15 to-transparent blur-[140px] pointer-events-none rounded-full" />
            <div className="absolute top-3/4 right-0 w-[450px] h-[450px] bg-aira-magenta/10 blur-[130px] pointer-events-none rounded-full" />

            {/* ══ HERO SECTION ══ */}
            <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 max-w-3xl mx-auto relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 shadow-lg shadow-amber-500/10">
                    <Crown size={15} className="text-amber-400 animate-pulse" />
                    <span>Executive Board & Leadership</span>
                </div>

                <h1 className="font-orbitron font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                    Visionaries Steering <br />
                    <span className="gradient-text-cyan">AiRA Lab</span> Tomorrow
                </h1>

                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-sans font-normal">
                    {settings.leadership_hero_subtitle || 
                     "Meet the founders, research directors, and student leaders pioneering cutting-edge artificial intelligence and autonomous robotics systems."}
                </p>

                {/* Quick stats ribbon */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Rocket size={16} className="text-aira-cyan" />
                        <span>Student-Led Innovation</span>
                    </div>
                    <span className="text-slate-700">•</span>
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={16} className="text-aira-purple" />
                        <span>Autonomous Intelligence</span>
                    </div>
                    <span className="text-slate-700">•</span>
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-amber-400" />
                        <span>National Hackathon Champions</span>
                    </div>
                </div>
            </motion.div>

            {/* ══ FOUNDER & EXECUTIVE SPOTLIGHT CARDS ══ */}
            {executiveSpotlight.length > 0 && (
                <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
                        <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
                            Founders & Executive Council
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {executiveSpotlight.map((leader, index) => (
                            <motion.div
                                key={leader.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedLeader(leader)}
                                className="group relative rounded-3xl p-[2px] bg-gradient-to-b from-amber-400/40 via-aira-cyan/20 to-aira-purple/30 hover:from-amber-400 hover:via-aira-cyan hover:to-aira-magenta transition-all duration-500 cursor-pointer shadow-xl hover:shadow-amber-400/20"
                            >
                                <div className="bg-slate-950/90 backdrop-blur-2xl rounded-[22px] p-6 h-full flex flex-col justify-between space-y-6 relative overflow-hidden">
                                    {/* Top badge */}
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                                            <Crown size={12} className="text-amber-400" /> Executive Lead
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-mono">#{leader.sortOrder || index + 1}</span>
                                    </div>

                                    {/* Center Image & Bio */}
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-xl group-hover:scale-105 transition-transform duration-300 bg-slate-900">
                                            <img
                                                src={leader.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=F59E0B&size=200`}
                                                alt={leader.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { 
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=F59E0B&size=200`; 
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                                                {leader.name}
                                            </h3>
                                            <p className="text-xs font-semibold text-aira-cyan mt-0.5">
                                                {leader.role}
                                            </p>
                                        </div>

                                        {leader.bio && (
                                            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                                                "{leader.bio}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Footer Links & Read More */}
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            {leader.linkedin && (
                                                <span className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-blue-400 transition-colors">
                                                    <Linkedin size={14} />
                                                </span>
                                            )}
                                            {leader.github && (
                                                <span className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors">
                                                    <Github size={14} />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-semibold text-aira-cyan group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                            View Profile <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══ ALL LEADERS & DOMAIN LEADS SECTION ══ */}
            <div className="space-y-6 relative z-10 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-aira-cyan to-aira-purple" />
                        <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
                            Domain Leads & Team Directory
                        </h2>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    activeTab === cat
                                        ? "bg-aira-cyan text-slate-950 font-bold shadow-md shadow-aira-cyan/30"
                                        : "glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                                }`}
                            >
                                {cat === "ALL" ? "All Profiles" : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid of All Leaders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filteredLeaders.map((leader, idx) => (
                        <motion.div
                            key={leader.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedLeader(leader)}
                            className="group glass p-5 rounded-2xl border border-white/10 hover:border-aira-cyan/40 hover:shadow-xl hover:shadow-aira-cyan/10 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-white/15 bg-slate-900 group-hover:scale-105 transition-transform">
                                    <img
                                        src={leader.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=00D4FF&size=150`}
                                        alt={leader.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { 
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=0d1526&color=00D4FF&size=150`; 
                                        }}
                                    />
                                    {leader.isPresident && (
                                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px]">
                                            👑
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-aira-cyan transition-colors truncate">
                                        {leader.name}
                                    </h3>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{leader.role}</p>

                                    {leader.teamGroup && (
                                        <span className="inline-block px-2 py-0.5 mt-2 text-[10px] font-medium rounded-full bg-white/5 text-slate-300 border border-white/10">
                                            {leader.teamGroup}
                                        </span>
                                    )}
                                </div>

                                {leader.bio && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2 text-center font-sans leading-relaxed">
                                        {leader.bio}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                                <span>View bio</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform text-aira-cyan" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ══ CALL TO ACTION ══ */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-strong rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border border-white/15 shadow-2xl"
            >
                <div className="max-w-2xl mx-auto space-y-5 relative z-10">
                    <h2 className="font-orbitron font-bold text-2xl sm:text-3xl text-white">
                        Want to Lead Autonomous Innovations?
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base font-sans">
                        AiRA Lab is always looking for passionate student researchers, robotics builders, and software engineers ready to push the frontiers of technology.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <Link
                            href="/join"
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-white font-orbitron font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl shadow-aira-cyan/25 flex items-center gap-2"
                        >
                            Apply to Join AiRA <ArrowRight size={16} />
                        </Link>
                        <Link
                            href="/about"
                            className="px-6 py-3 rounded-2xl glass border border-white/20 text-white font-orbitron font-bold text-xs sm:text-sm hover:bg-white/10 transition-colors"
                        >
                            Explore Our Mission
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Detail Modal */}
            <LeaderDetailModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
        </div>
    );
}
