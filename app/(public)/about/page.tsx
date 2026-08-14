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
    RotateCcw,
    Play,
    Pause,
    ChevronLeft,
    Layers,
    UserCheck,
    Orbit as OrbitIcon,
    ArrowLeft,
    Search
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
                        <div className="flex items-center gap-2 flex-wrap">
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
                                <span className="text-[11px] text-slate-400 font-mono">
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

                    {/* Modal Main Body */}
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

// Orbiting planet card with glowing aura and tooltip
function OrbitPlanetCard({
    member,
    isLeaderView,
    teamBadge,
    onClick,
}: {
    member: any;
    isLeaderView: boolean;
    teamBadge?: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group block relative focus:outline-none cursor-pointer"
            title={member.name}
        >
            <div className="relative">
                {/* Glowing Aura Ring */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 border-2 transition-all duration-300 transform group-hover:scale-125 active:scale-95 text-[10px] text-white shadow-xl ${
                    isLeaderView
                        ? "border-amber-400/80 group-hover:border-amber-300 shadow-amber-400/20 group-hover:shadow-[0_0_25px_#f59e0b]"
                        : "border-aira-cyan/70 group-hover:border-aira-cyan shadow-aira-cyan/20 group-hover:shadow-[0_0_25px_#00D4FF]"
                }`}>
                    <img
                        src={
                            member.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                member.name
                            )}&background=0d1526&color=${isLeaderView ? "F59E0B" : "00D4FF"}&size=140`
                        }
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                member.name
                            )}&background=0d1526&color=${isLeaderView ? "F59E0B" : "00D4FF"}&size=140`;
                        }}
                    />
                </div>

                {/* Badge Crown/Lead indicator */}
                {isLeaderView && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 border border-slate-950 flex items-center justify-center text-[10px] shadow-lg z-10">
                        👑
                    </div>
                )}

                {/* Hover Action Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3.5 py-2 rounded-2xl glass-strong border border-white/20 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-40 shadow-2xl scale-90 group-hover:scale-100 min-w-[140px] text-center">
                    <div className="font-bold text-white font-orbitron text-xs flex items-center justify-center gap-1.5">
                        {member.name}
                    </div>
                    <div className="text-aira-cyan text-[10px] font-mono truncate max-w-[180px]">
                        {member.role || "Team Member"}
                    </div>
                    {teamBadge && (
                        <div className="text-[9px] text-violet-300 font-semibold mt-0.5 px-2 py-0.5 rounded-full bg-white/10 w-fit mx-auto">
                            {teamBadge}
                        </div>
                    )}
                    {isLeaderView ? (
                        <div className="text-[10px] text-amber-300 font-semibold mt-1 flex items-center justify-center gap-1">
                            <span>✨ Focus team orbit</span>
                        </div>
                    ) : (
                        <div className="text-[10px] text-slate-300 font-normal mt-1">
                            <span>Click to view bio</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}

interface TeamDivisionInfo {
    id: string;
    name: string;
    shortName: string;
    icon: any;
    accentColor: string;
    badgeClass: string;
    borderColor: string;
    glowClass: string;
    description: string;
    lead: any | null;
    members: any[];
    allMembers: any[];
}

export default function AboutPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [activeGroup, setActiveGroup] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [adminTeams, setAdminTeams] = useState<any[]>([]);
    
    // ── Solar Orbital State ──
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [isOrbitPaused, setIsOrbitPaused] = useState(false);
    const [orbitSpeed, setOrbitSpeed] = useState<"normal" | "slow" | "fast">("normal");
    const [orbitRadius, setOrbitRadius] = useState(210);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch("/api/team-members").then((r) => (r.ok ? r.json() : [])).catch(() => []),
            fetch("/api/settings").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
            fetch("/api/teams").then((r) => (r.ok ? r.json() : [])).catch(() => [])
        ]).then(([membersData, settingsData, teamsData]) => {
            setMembers(Array.isArray(membersData) ? membersData : []);
            setSettings(settingsData || {});
            setAdminTeams(Array.isArray(teamsData) ? teamsData : []);
            setIsLoading(false);
        }).catch(() => {
            setMembers([]);
            setAdminTeams([]);
            setIsLoading(false);
        });

        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) {
                setOrbitRadius(135);
            } else if (width < 1024) {
                setOrbitRadius(185);
            } else {
                setOrbitRadius(230);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Helper: Determine if a member is a Team Leader
    const isLeaderMember = (m: any) => {
        if (!m) return false;
        if (m.isPresident || m.isTeamLead) return true;
        const role = (m.role || "").toLowerCase();
        return (
            role.includes("lead") ||
            role.includes("head") ||
            role.includes("leader") ||
            role.includes("director") ||
            role.includes("captain") ||
            role.includes("coordinator") ||
            role.includes("president") ||
            role.includes("chief") ||
            role.includes("founder") ||
            role.includes("manager")
        );
    };

    // Overall President / Founder
    const president = useMemo(() => {
        return members.find((m) => m.isPresident) || members[0] || null;
    }, [members]);

    // Structured Team Divisions mapping - ONLY FROM ADMIN TEAMS
    const teamDivisions = useMemo<TeamDivisionInfo[]>(() => {
        if (!adminTeams.length) return [];

        const result: TeamDivisionInfo[] = [];

        adminTeams.forEach((team) => {
            const groupName = team.name;
            const lower = groupName.toLowerCase();
            
            // Get all members who belong to this exact team
            const mList = members.filter((m) => {
                const raw = (m.teamGroup || "").trim().toLowerCase();
                return raw === lower;
            });

            let icon = Users;
            if (lower.includes("founder") || lower.includes("executive") || lower.includes("board")) icon = Crown;
            else if (lower.includes("robotics") || lower.includes("hardware")) icon = Cpu;
            else if (lower.includes("ai") || lower.includes("software") || lower.includes("cloud")) icon = Code2;
            else if (lower.includes("embedded") || lower.includes("circuit")) icon = Zap;
            else if (lower.includes("advisor") || lower.includes("research")) icon = Sparkles;

            const accentColor = team.color || "#00D4FF";
            const customDesc = team.description;

            // Identify division lead (Strict Priority: isTeamLead from Admin > isPresident > isLeaderMember > sortOrder)
            const sorted = [...mList].sort((a, b) => {
                if (a.isTeamLead && !b.isTeamLead) return -1;
                if (!a.isTeamLead && b.isTeamLead) return 1;
                if (a.isPresident && !b.isPresident) return -1;
                if (!a.isPresident && b.isPresident) return 1;
                const aLead = isLeaderMember(a);
                const bLead = isLeaderMember(b);
                if (aLead && !bLead) return -1;
                if (!aLead && bLead) return 1;
                return (a.sortOrder || 0) - (b.sortOrder || 0);
            });

            let lead = sorted[0] || null;
            // Prevent the President from absorbing the team lead role if someone else can represent the team,
            // because the President is already the Center and gets filtered out of the orbit.
            if (lead?.id === president?.id && sorted.length > 1) {
                lead = sorted[1];
            }
            // Members are strictly everyone EXCEPT the lead
            const subMembers = sorted.filter((m) => m.id !== lead?.id);

            result.push({
                id: groupName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                name: groupName,
                shortName: groupName,
                icon,
                accentColor,
                badgeClass: "", 
                borderColor: "",
                glowClass: "",
                description: customDesc || "AiRA Lab Team Division",
                lead,
                members: subMembers,
                allMembers: sorted,
            });
        });

        // Ensure Executive/Leadership comes first
        result.sort((a, b) => {
            const aIsExec = a.name.toLowerCase().includes("founder") || a.name.toLowerCase().includes("executive");
            const bIsExec = b.name.toLowerCase().includes("founder") || b.name.toLowerCase().includes("executive");
            if (aIsExec && !bIsExec) return -1;
            if (!aIsExec && bIsExec) return 1;
            return b.allMembers.length - a.allMembers.length;
        });

        return result;
    }, [adminTeams, members, president]);

    // Active selected team for Orbit
    const activeTeamDivision = useMemo(() => {
        if (!selectedTeamId) return null;
        return teamDivisions.find((d) => d.id === selectedTeamId) || null;
    }, [selectedTeamId, teamDivisions]);

    // Center Display Person in the Solar Orbit
    const centerPerson = useMemo(() => {
        if (activeTeamDivision) {
            return activeTeamDivision.lead || president;
        }
        return president;
    }, [activeTeamDivision, president]);

    // Orbiting satellites depending on selected team
    // Mode 1: All Teams View -> Orbiting items are Team Leads of each respective team
    // Mode 2: Specific Team View -> Orbiting items are the members belonging STRICTLY to that selected team!
    const currentOrbitingItems = useMemo(() => {
        if (!activeTeamDivision) {
            // Mode 1: Representative lead for each team
            return teamDivisions
                .map((div) => div.lead)
                .filter((lead) => lead && lead.id !== president?.id);
        }

        // Mode 2: Members of this team. If there are no assigned members, it stays completely blank!
        return activeTeamDivision.members;
    }, [activeTeamDivision, teamDivisions, president]);

    // Filtered members for directory showcase
    const filteredDivisions = useMemo(() => {
        let list = teamDivisions;

        if (activeGroup !== "ALL") {
            list = list.filter((div) => div.name === activeGroup || div.id === activeGroup);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list
                .map((div) => {
                    const matchedMembers = div.allMembers.filter(
                        (m) =>
                            (m.name || "").toLowerCase().includes(q) ||
                            (m.role || "").toLowerCase().includes(q) ||
                            (m.bio || "").toLowerCase().includes(q)
                    );
                    if (matchedMembers.length === 0) return null;
                    return {
                        ...div,
                        allMembers: matchedMembers,
                        lead: matchedMembers.find((m) => m.id === div.lead?.id) || matchedMembers[0],
                        members: matchedMembers.filter((m) => m.id !== div.lead?.id),
                    };
                })
                .filter(Boolean) as TeamDivisionInfo[];
        }

        return list;
    }, [teamDivisions, activeGroup, searchQuery]);

    // Orbit Animation Speed
    const spinDuration = orbitSpeed === "fast" ? "20s" : orbitSpeed === "slow" ? "48s" : "32s";
    const outerSpinDuration = orbitSpeed === "fast" ? "30s" : orbitSpeed === "slow" ? "70s" : "48s";

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
                1. CINEMATIC INTERACTIVE 3D SOLAR / ORBIT SYSTEM (BY TEAM)
               ═══════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[680px] sm:min-h-[820px] flex flex-col items-center justify-center overflow-hidden px-4 pt-4">
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

                {/* Active Team Orbit Status Indicator (Shown only when a team orbit is isolated) */}
                {activeTeamDivision && (
                    <div className="z-30 mb-6 flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950/80 px-4 py-1.5 rounded-full border border-amber-500/30 shadow-lg shadow-black/50">
                        <span className="text-amber-300 font-bold">✨ Team Orbit:</span>
                        <span className="text-white font-semibold">{activeTeamDivision.name}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-aira-cyan">{activeTeamDivision.allMembers.length} Members</span>
                        <button
                            onClick={() => setSelectedTeamId(null)}
                            className="ml-2 px-2 py-0.5 rounded bg-white/10 text-[10px] text-amber-300 hover:bg-white/20 transition-colors"
                        >
                            Reset to All Leads ✕
                        </button>
                    </div>
                )}

                {/* Interactive Orbit System Container */}
                <div
                    className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] md:w-[620px] md:h-[620px] flex items-center justify-center z-10"
                >
                    {/* Concentric Glowing Orbit Rings */}
                    <div
                        className="absolute rounded-full border border-aira-cyan/40 pointer-events-none shadow-[0_0_30px_rgba(0,212,255,0.2)] animate-pulse"
                        style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                    />
                    <div
                        className="absolute rounded-full border border-dashed border-white/15 pointer-events-none"
                        style={{ width: orbitRadius * 2 + 36, height: orbitRadius * 2 + 36 }}
                    />

                    {/* Orbit 2 Outer Ring for Teams with > 6 members */}
                    {currentOrbitingItems.length > 6 && (
                        <>
                            <div
                                className="absolute rounded-full border border-dashed border-purple-500/40 pointer-events-none shadow-[0_0_35px_rgba(168,85,247,0.2)]"
                                style={{ width: orbitRadius * 2.8, height: orbitRadius * 2.8 }}
                            />
                            <div
                                className="absolute rounded-full border border-white/10 pointer-events-none"
                                style={{ width: orbitRadius * 2.8 + 40, height: orbitRadius * 2.8 + 40 }}
                            />
                        </>
                    )}

                    {/* ══ CENTRAL HERO / LEADER CARD (Smooth spring swap) ══ */}
                    <motion.div
                        key={centerPerson?.id || "center"}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, y: [-4, 4, -4] }}
                        transition={{
                            scale: { type: "spring", stiffness: 300, damping: 25 },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative z-20 cursor-pointer group"
                        onClick={() => {
                            if (centerPerson) setSelectedMember(centerPerson);
                        }}
                    >
                        <div className="relative">
                            {/* Card Frame with Glowing Aura */}
                            <div className={`w-36 h-48 sm:w-48 sm:h-60 md:w-56 md:h-68 rounded-3xl overflow-hidden border-2 bg-slate-950 shadow-2xl transition-all duration-300 group-hover:scale-105 ${
                                activeTeamDivision
                                    ? "border-amber-400/80 shadow-amber-500/25 ring-2 ring-amber-400/30"
                                    : "border-aira-cyan/80 glow-cyan ring-2 ring-aira-cyan/30"
                            }`}>
                                <img
                                    src={
                                        centerPerson?.photo ||
                                        settings.lab_main_image ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            centerPerson?.name || "AiRA Lead"
                                        )}&background=0d1526&color=00D4FF&size=400`
                                    }
                                    alt={centerPerson?.name || "Leader"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            "https://placehold.co/300x400/020817/00D4FF?text=AiRA+Lab";
                                    }}
                                />

                                {/* Center Floating Badge Tag */}
                                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[10px] font-orbitron font-bold text-white flex items-center gap-1 shadow-lg">
                                    {centerPerson?.isPresident ? "👑 Founder" : "⭐ Team Lead"}
                                </div>
                            </div>

                            {/* Label under center card */}
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-2xl glass-strong border border-white/20 text-center whitespace-nowrap shadow-2xl min-w-[140px]">
                                <p className="font-orbitron font-bold text-xs sm:text-sm text-white">
                                    {centerPerson?.name || "AiRA Lab"}
                                </p>
                                <p className="text-[10px] text-aira-cyan font-medium truncate max-w-[160px]">
                                    {centerPerson?.role || "Core Lead"}
                                </p>
                                {activeTeamDivision && (
                                    <p className="text-[9px] text-amber-300 font-semibold font-mono">
                                        {activeTeamDivision.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ ORBIT 1: INNER RING MEMBERS/LEADERS ══ */}
                    {currentOrbitingItems.length > 0 && (
                        <div
                            key={`orbit-inner-${selectedTeamId || "all-leaders"}`}
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{
                                animation: isOrbitPaused ? "none" : `spin ${spinDuration} linear infinite`,
                            }}
                        >
                            {(currentOrbitingItems.length <= 6
                                ? currentOrbitingItems
                                : currentOrbitingItems.slice(0, 6)
                            ).map((member: any, i: number, arr: any[]) => {
                                const angle = (360 / arr.length) * i;
                                const isAllTeamsMode = selectedTeamId === null;
                                const memberDiv = teamDivisions.find((d) => d.lead?.id === member.id || d.allMembers.some((m) => m.id === member.id));

                                return (
                                    <div
                                        key={member.id}
                                        className="absolute left-1/2 top-1/2 -ml-7 -mt-7 sm:-ml-8 sm:-mt-8 md:-ml-10 md:-mt-10 pointer-events-auto"
                                        style={{
                                            transform: `rotate(${angle}deg) translate(${orbitRadius}px) rotate(-${angle}deg)`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                animation: isOrbitPaused
                                                    ? "none"
                                                    : `counterspin ${spinDuration} linear infinite`,
                                            }}
                                        >
                                            <OrbitPlanetCard
                                                member={member}
                                                isLeaderView={isAllTeamsMode}
                                                teamBadge={memberDiv?.shortName}
                                                onClick={() => {
                                                    if (isAllTeamsMode && memberDiv) {
                                                        // In all teams mode: clicking a team leader switches orbit to that team!
                                                        setSelectedTeamId(memberDiv.id);
                                                    } else {
                                                        // In team mode: clicking member opens full bio modal
                                                        setSelectedMember(member);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ══ ORBIT 2: OUTER RING (IF > 6 MEMBERS) ══ */}
                    {currentOrbitingItems.length > 6 && (
                        <div
                            key={`orbit-outer-${selectedTeamId || "all-leaders"}`}
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{
                                animation: isOrbitPaused ? "none" : `counterspin ${outerSpinDuration} linear infinite`,
                            }}
                        >
                            {currentOrbitingItems.slice(6).map((member: any, i: number, arr: any[]) => {
                                const angle = (360 / arr.length) * i;
                                const radius2 = orbitRadius * 1.42;
                                const isAllTeamsMode = selectedTeamId === null;
                                const memberDiv = teamDivisions.find((d) => d.lead?.id === member.id || d.allMembers.some((m) => m.id === member.id));

                                return (
                                    <div
                                        key={member.id}
                                        className="absolute left-1/2 top-1/2 -ml-7 -mt-7 sm:-ml-8 sm:-mt-8 md:-ml-10 md:-mt-10 pointer-events-auto"
                                        style={{
                                            transform: `rotate(${angle}deg) translate(${radius2}px) rotate(-${angle}deg)`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                animation: isOrbitPaused
                                                    ? "none"
                                                    : `spin ${outerSpinDuration} linear infinite`,
                                            }}
                                        >
                                            <OrbitPlanetCard
                                                member={member}
                                                isLeaderView={isAllTeamsMode}
                                                teamBadge={memberDiv?.shortName}
                                                onClick={() => {
                                                    if (isAllTeamsMode && memberDiv) {
                                                        setSelectedTeamId(memberDiv.id);
                                                    } else {
                                                        setSelectedMember(member);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ══ ORBIT CONTROLS & HINTS ══ */}
                <div className="mt-10 text-center z-20 w-full max-w-2xl px-4">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                        <span className="px-3.5 py-1.5 rounded-full glass border border-white/10 inline-flex items-center gap-1.5 shadow-lg shadow-black/40">
                            <Sparkles size={13} className="text-aira-cyan animate-pulse" /> 
                            {activeTeamDivision 
                                ? `Spinning ${currentOrbitingItems.length} team members belonging strictly to ${activeTeamDivision.name}`
                                : "Click any Team Leader to isolate their team orbit!"}
                        </span>

                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setIsOrbitPaused(!isOrbitPaused)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
                                title={isOrbitPaused ? "Resume Orbit" : "Pause Orbit"}
                            >
                                {isOrbitPaused ? <Play size={13} className="text-emerald-400" /> : <Pause size={13} />}
                            </button>
                            <button
                                onClick={() => {
                                    setOrbitSpeed((curr) => (curr === "normal" ? "fast" : curr === "fast" ? "slow" : "normal"));
                                }}
                                className="px-2 py-1 rounded-lg hover:bg-white/10 text-[11px] font-mono text-slate-300"
                                title="Change orbit speed"
                            >
                                Speed: <strong className="text-aira-cyan uppercase">{orbitSpeed}</strong>
                            </button>
                        </div>
                    </div>
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
                4. 3D CYBER MASCOT SHOWCASE (MEET MEVY)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
                <ScrollReveal direction="up">
                    <SpotlightCard
                        spotlightColor="rgba(168, 85, 247, 0.22)"
                        className="p-4 xs:p-6 sm:p-8 lg:p-12 border-purple-500/30 rounded-3xl"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                            {/* Left: 3D Parallax Mascot Card */}
                            <div className="lg:col-span-5 flex justify-center w-full overflow-hidden">
                                <Interactive3DMascot
                                    size="lg"
                                    showSpeechBubble={true}
                                    speechText="A New Mind. A New Energy. A New Impact. ⚡"
                                    className="mx-auto w-full"
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
                5. FULL TEAM SHOWCASE DIRECTORY (STRUCTURED BY TEAM)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 space-y-12">
                {/* Header & Filter Controls */}
                <ScrollReveal direction="up">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-[0.25em] text-aira-cyan font-orbitron">
                                Directory by Division &amp; Wing
                            </span>
                            <h2 className="font-orbitron font-bold text-3xl sm:text-4xl text-white mt-1">
                                Meet Our <span className="gradient-text-cyan">Teams</span>
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                                Explore our talented researchers, engineers, and creators organized by their specialized laboratory divisions.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/leadership"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold hover:bg-amber-400/20 hover:scale-105 transition-all shadow-md"
                            >
                                <Crown size={15} className="text-amber-400" />
                                <span>Founders &amp; Executive Board →</span>
                            </Link>

                            <Link
                                href="/join"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aira-cyan text-slate-950 text-xs font-orbitron font-bold hover:scale-105 transition-all shadow-md shadow-aira-cyan/20"
                            >
                                <Rocket size={14} />
                                <span>Join a Team</span>
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Search & Team Filter Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Team Filter Pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <button
                            onClick={() => setActiveGroup("ALL")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all border ${
                                activeGroup === "ALL"
                                    ? "bg-aira-cyan text-slate-950 border-aira-cyan shadow-md shadow-aira-cyan/20"
                                    : "bg-slate-900/60 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            All Divisions ({members.length})
                        </button>

                        {teamDivisions.map((div) => {
                            const isSelected = activeGroup === div.name || activeGroup === div.id;
                            const Icon = div.icon;
                            return (
                                <button
                                    key={div.id}
                                    onClick={() => setActiveGroup(div.name)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                                        isSelected
                                            ? "bg-white/15 text-white border-white/40 shadow-md shadow-white/10"
                                            : "bg-slate-900/60 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200"
                                    }`}
                                >
                                    <Icon size={13} style={{ color: div.accentColor }} />
                                    <span>{div.shortName}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                                        {div.allMembers.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative min-w-[240px] sm:w-72">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search members by name..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs outline-none focus:border-aira-cyan transition-all"
                        />
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ══ TEAM-BY-TEAM SECTIONS SHOWCASE ══ */}
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-2 border-aira-cyan/30 border-t-aira-cyan rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 font-orbitron">Loading laboratory divisions &amp; team members...</p>
                    </div>
                ) : filteredDivisions.length === 0 ? (
                    <div className="glass p-12 rounded-3xl border border-white/10 text-center max-w-md mx-auto space-y-3">
                        <Users size={36} className="mx-auto text-slate-500" />
                        <h3 className="font-orbitron font-bold text-white text-base">No Team Members Found</h3>
                        <p className="text-xs text-slate-400">
                            No team members match your current filter or search criteria.
                        </p>
                        <button
                            onClick={() => {
                                setActiveGroup("ALL");
                                setSearchQuery("");
                            }}
                            className="px-4 py-2 rounded-xl bg-aira-cyan text-slate-950 font-bold text-xs hover:scale-105 transition-transform"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {filteredDivisions.map((division) => {
                            const Icon = division.icon;
                            return (
                                <div key={division.id} className="space-y-6">
                                    {/* Division Header Banner */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent border border-white/10">
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                                                style={{
                                                    background: `radial-gradient(circle at top left, ${division.accentColor}30, ${division.accentColor}10)`,
                                                    border: `1px solid ${division.accentColor}40`,
                                                    boxShadow: `0 0 20px ${division.accentColor}20`,
                                                }}
                                            >
                                                <Icon size={20} style={{ color: division.accentColor }} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-orbitron font-bold text-lg sm:text-xl text-white">
                                                        {division.name}
                                                    </h3>
                                                    <span 
                                                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-white/10 text-white border-white/20"
                                                        style={{ 
                                                            color: division.accentColor, 
                                                            borderColor: `${division.accentColor}40`, 
                                                            backgroundColor: `${division.accentColor}15` 
                                                        }}
                                                    >
                                                        {division.allMembers.length} {division.allMembers.length === 1 ? "Member" : "Members"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                                    {division.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Orbit Focus Button */}
                                        <button
                                            onClick={() => {
                                                setSelectedTeamId(division.id);
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-orbitron font-semibold text-aira-cyan hover:text-white flex items-center gap-1.5 transition-all w-fit self-start sm:self-center shrink-0"
                                        >
                                            <OrbitIcon size={12} className="text-aira-cyan" />
                                            <span>Spin in 3D Orbit ↑</span>
                                        </button>
                                    </div>

                                    {/* Division Members Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {division.allMembers.map((member, i) => {
                                            const isLead = member.id === division.lead?.id || isLeaderMember(member);
                                            return (
                                                <ScrollReveal key={member.id} delay={i * 0.03} direction="up">
                                                    <SpotlightCard
                                                        spotlightColor={isLead ? "rgba(245, 158, 11, 0.2)" : "rgba(0, 212, 255, 0.16)"}
                                                        className={`p-4 text-center cursor-pointer transition-all duration-300 hover:scale-[1.03] ${
                                                            isLead
                                                                ? "border-amber-400/40 bg-slate-900/80 shadow-lg shadow-amber-500/5 hover:border-amber-400"
                                                                : "border-white/[0.08] hover:border-aira-cyan/50"
                                                        }`}
                                                    >
                                                        <button
                                                            onClick={() => setSelectedMember(member)}
                                                            className="w-full text-center flex flex-col items-center justify-between h-full"
                                                        >
                                                            <div className="w-full">
                                                                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 mx-auto mb-3 transition-all flex items-center justify-center bg-slate-900 text-xs text-white relative shadow-lg ${
                                                                    isLead
                                                                        ? "border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/20"
                                                                        : "border-white/10 group-hover:border-aira-cyan/60"
                                                                }`}>
                                                                    <img
                                                                        src={
                                                                            member.photo ||
                                                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                                member.name
                                                                            )}&background=0d1526&color=${isLead ? "F59E0B" : "00D4FF"}&size=200`
                                                                        }
                                                                        alt={member.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                                member.name
                                                                            )}&background=0d1526&color=${isLead ? "F59E0B" : "00D4FF"}&size=200`;
                                                                        }}
                                                                    />
                                                                    {member.isPresident ? (
                                                                        <div className="absolute -top-1 -right-1 text-xs" title="Founder / President">
                                                                            👑
                                                                        </div>
                                                                    ) : isLead ? (
                                                                        <div className="absolute -top-1 -right-1 text-xs" title="Team Lead">
                                                                            ⭐
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                                <h3 className="font-orbitron font-bold text-xs sm:text-sm text-white truncate">
                                                                    {member.name}
                                                                </h3>
                                                                <p className={`font-medium text-[11px] mt-0.5 line-clamp-1 ${
                                                                    isLead ? "text-amber-300 font-semibold" : "text-aira-cyan"
                                                                }`}>
                                                                    {member.role}
                                                                </p>
                                                            </div>

                                                            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap">
                                                                {isLead && (
                                                                    <span className="text-[9px] font-bold font-orbitron px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                                        {member.isPresident ? "Founder" : "Lead"}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                                                                    {division.shortName}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </SpotlightCard>
                                                </ScrollReveal>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Member Profile Modal */}
            <MemberModal
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
            />
        </div>
    );
}
