"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, Orbit, Users, Crown, Linkedin, Github, 
    ExternalLink, Play, Pause, RefreshCw, Layers, ShieldCheck, User
} from "lucide-react";

export interface OrbitMember {
    id: string;
    name: string;
    role: string;
    photo?: string | null;
    avatar?: string | null;
    linkedin?: string | null;
    github?: string | null;
    teamGroup?: string | null;
    isPresident?: boolean;
    bio?: string | null;
}

interface TeamOrbitalSystemProps {
    members: OrbitMember[];
    onSelectMember?: (member: OrbitMember) => void;
    innerLimit?: number; // Default: 6 members in Orbit 1
}

export function TeamOrbitalSystem({ 
    members, 
    onSelectMember, 
    innerLimit = 6 
}: TeamOrbitalSystemProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [selectedWing, setSelectedWing] = useState<string>("ALL");
    const [hoveredMember, setHoveredMember] = useState<OrbitMember | null>(null);

    // Filter members by selected wing/department
    const filteredMembers = useMemo(() => {
        if (selectedWing === "ALL") return members;
        return members.filter((m) => 
            m.teamGroup?.toUpperCase().includes(selectedWing) ||
            m.role?.toUpperCase().includes(selectedWing)
        );
    }, [members, selectedWing]);

    // Split members across Orbit 1 (Inner) and Orbit 2 (Outer)
    const { orbit1Members, orbit2Members, hasSecondOrbit } = useMemo(() => {
        const total = filteredMembers.length;
        if (total <= innerLimit) {
            return {
                orbit1Members: filteredMembers,
                orbit2Members: [],
                hasSecondOrbit: false,
            };
        }

        // Put primary / core leaders on Orbit 1, and rest on Orbit 2
        const o1 = filteredMembers.slice(0, innerLimit);
        const o2 = filteredMembers.slice(innerLimit);

        return {
            orbit1Members: o1,
            orbit2Members: o2,
            hasSecondOrbit: true,
        };
    }, [filteredMembers, innerLimit]);

    // Unique wings for quick filtering
    const wings = useMemo(() => {
        const set = new Set<string>();
        members.forEach((m) => {
            if (m.teamGroup) set.add(m.teamGroup.toUpperCase());
        });
        return ["ALL", ...Array.from(set)];
    }, [members]);

    // Geometry Radii (Scaled for responsiveness)
    const R1 = 175; // Orbit 1 radius in px
    const R2 = 300; // Orbit 2 radius in px

    return (
        <div className="relative w-full overflow-hidden py-12 px-4 flex flex-col items-center select-none">
            
            {/* Ambient Background Nebulae */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-900/20 via-indigo-900/25 to-aira-cyan/15 blur-[140px] rounded-full pointer-events-none" />

            {/* Orbit Controls & Stats Bar */}
            <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 w-full max-w-4xl mb-8 p-4 rounded-2xl glass border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 border border-purple-500/40 flex items-center justify-center text-aira-cyan shadow-lg shadow-purple-900/30">
                        <Orbit size={20} className={isPaused ? "" : "animate-spin-slow"} />
                    </div>
                    <div>
                        <h3 className="font-orbitron font-bold text-white text-base flex items-center gap-2">
                            AiRA Solar Orbit Constellation
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                {hasSecondOrbit ? "2 Orbits Active" : "1 Orbit Active"}
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                            {filteredMembers.length} Active Innovators • Orbit 1: {orbit1Members.length} • Orbit 2: {orbit2Members.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Pause / Play Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsPaused(!isPaused)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isPaused 
                                ? "bg-purple-600/30 border-purple-400 text-purple-200" 
                                : "bg-slate-900 border-white/10 text-slate-300 hover:text-white"
                        }`}
                    >
                        {isPaused ? <Play size={13} /> : <Pause size={13} />}
                        {isPaused ? "Resume Orbit" : "Pause Orbit"}
                    </button>

                    {/* Wing Filter */}
                    {wings.length > 2 && (
                        <select
                            value={selectedWing}
                            onChange={(e) => setSelectedWing(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-aira-cyan/50"
                        >
                            {wings.map((w) => (
                                <option key={w} value={w}>
                                    {w === "ALL" ? "All Wings" : w}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* ══ PLANETARY DUAL ORBIT CANVAS ══ */}
            <div className="relative w-full max-w-[740px] aspect-square flex items-center justify-center">
                
                {/* 1. Orbit 1 Ring (Inner Orbit) */}
                <div 
                    style={{ width: `${R1 * 2}px`, height: `${R1 * 2}px` }}
                    className="absolute rounded-full border border-dashed border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] pointer-events-none"
                >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-orbitron font-bold tracking-widest text-purple-400/60 uppercase bg-[#06050e] px-2 rounded-full border border-purple-500/20">
                        Orbit 1 (Core)
                    </span>
                </div>

                {/* 2. Orbit 2 Ring (Outer Orbit - expands when capacity increases!) */}
                {hasSecondOrbit && (
                    <div 
                        style={{ width: `${R2 * 2}px`, height: `${R2 * 2}px` }}
                        className="absolute rounded-full border border-purple-400/25 shadow-[0_0_30px_rgba(99,102,241,0.15)] pointer-events-none"
                    >
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-orbitron font-bold tracking-widest text-indigo-400/60 uppercase bg-[#06050e] px-2 rounded-full border border-indigo-500/20">
                            Orbit 2 (Innovators)
                        </span>
                    </div>
                )}

                {/* 3. Central Core Star / AiRA Hub */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-violet-600 via-purple-900 to-slate-950 border-2 border-purple-400/80 shadow-[0_0_40px_rgba(168,85,247,0.6)] flex flex-col items-center justify-center p-2 text-center relative group cursor-pointer">
                        <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping pointer-events-none" />
                        <span className="font-orbitron font-black text-2xl text-white tracking-widest drop-shadow-[0_2px_8px_rgba(168,85,247,0.9)]">
                            ▲
                        </span>
                        <span className="font-orbitron font-bold text-[11px] text-purple-200 tracking-wider">
                            AiRA CORE
                        </span>
                        <span className="text-[9px] text-aira-cyan font-mono">
                            {filteredMembers.length} Members
                        </span>
                    </div>
                </div>

                {/* 4. Orbit 1 Members Rotating Container */}
                <div
                    style={{ 
                        width: `${R1 * 2}px`, height: `${R1 * 2}px`,
                        animationPlayState: isPaused ? 'paused' : 'running'
                    }}
                    className="absolute rounded-full pointer-events-none animate-[spin_40s_linear_infinite]"
                >
                    {orbit1Members.map((member, i) => {
                        const angle = (360 / orbit1Members.length) * i;
                        const rad = (angle * Math.PI) / 180;
                        const x = R1 + R1 * Math.cos(rad) - 28; // 28 is half node width (56/2)
                        const y = R1 + R1 * Math.sin(rad) - 28;

                        return (
                            <div
                                key={member.id}
                                style={{
                                    position: "absolute",
                                    left: `${x}px`,
                                    top: `${y}px`,
                                }}
                                className="pointer-events-auto"
                            >
                                {/* Counter-rotate node so avatar & text stay upright */}
                                <div
                                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                                    className="relative group animate-[spin_40s_linear_infinite_reverse]"
                                    onMouseEnter={() => setHoveredMember(member)}
                                    onMouseLeave={() => setHoveredMember(null)}
                                    onClick={() => onSelectMember?.(member)}
                                >
                                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-950 border-2 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.5)] cursor-pointer hover:scale-125 transition-transform overflow-hidden bg-slate-900">
                                        {member.photo || member.avatar ? (
                                            <img
                                                src={member.photo || member.avatar || ""}
                                                alt={member.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full flex items-center justify-center font-orbitron font-bold text-xs text-white bg-slate-900">
                                                {member.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {member.isPresident && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-md">
                                            👑
                                        </div>
                                    )}

                                    {/* Name Pill on Hover */}
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-950/90 border border-purple-400/40 text-[10px] font-semibold text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-30">
                                        {member.name}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 5. Orbit 2 Members Counter-Rotating Container */}
                {hasSecondOrbit && (
                    <div
                        style={{ 
                            width: `${R2 * 2}px`, height: `${R2 * 2}px`,
                            animationPlayState: isPaused ? 'paused' : 'running'
                        }}
                        className="absolute rounded-full pointer-events-none animate-[spin_65s_linear_infinite_reverse]"
                    >
                        {orbit2Members.map((member, i) => {
                            const angle = (360 / orbit2Members.length) * i;
                            const rad = (angle * Math.PI) / 180;
                            const x = R2 + R2 * Math.cos(rad) - 24; // 24 is half node width (48/2)
                            const y = R2 + R2 * Math.sin(rad) - 24;

                            return (
                                <div
                                    key={member.id}
                                    style={{
                                        position: "absolute",
                                        left: `${x}px`,
                                        top: `${y}px`,
                                    }}
                                    className="pointer-events-auto"
                                >
                                    {/* Counter-rotate so avatar stays upright */}
                                    <div
                                        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                                        className="relative group animate-[spin_65s_linear_infinite]"
                                        onMouseEnter={() => setHoveredMember(member)}
                                        onMouseLeave={() => setHoveredMember(null)}
                                        onClick={() => onSelectMember?.(member)}
                                    >
                                        <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-indigo-500 via-purple-700 to-slate-950 border border-indigo-400/70 shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer hover:scale-125 transition-transform overflow-hidden bg-slate-900">
                                            {member.photo || member.avatar ? (
                                                <img
                                                    src={member.photo || member.avatar || ""}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full flex items-center justify-center font-orbitron font-bold text-[11px] text-white bg-slate-900">
                                                    {member.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name Pill on Hover */}
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-slate-950/90 border border-indigo-400/40 text-[9px] font-semibold text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-30">
                                            {member.name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Hovered Member Quick Card HUD */}
            <AnimatePresence>
                {hoveredMember && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="relative z-30 mt-6 p-4 rounded-2xl glass border border-purple-500/40 shadow-2xl flex items-center gap-4 max-w-md w-full bg-[#0c0a1b]/90 backdrop-blur-xl"
                    >
                        {hoveredMember.photo || hoveredMember.avatar ? (
                            <img
                                src={hoveredMember.photo || hoveredMember.avatar || ""}
                                alt={hoveredMember.name}
                                className="w-12 h-12 rounded-xl object-cover border border-purple-400/60 shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-950 flex items-center justify-center font-orbitron font-bold text-white text-base shrink-0">
                                {hoveredMember.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="font-orbitron font-bold text-sm text-white truncate">
                                    {hoveredMember.name}
                                </h4>
                                {hoveredMember.teamGroup && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {hoveredMember.teamGroup}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-aira-cyan truncate">{hoveredMember.role}</p>
                            {hoveredMember.bio && (
                                <p className="text-[11px] text-slate-300 line-clamp-1 italic pt-0.5">
                                    "{hoveredMember.bio}"
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
