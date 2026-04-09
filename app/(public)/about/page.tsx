"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Linkedin, ExternalLink } from "lucide-react";

function MemberModal({ member, onClose }: { member: any; onClose: () => void }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="glass-strong rounded-3xl p-8 max-w-md w-full relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 hover:text-aira-cyan transition-colors">
                        <X size={16} />
                    </button>

                    <div className="text-center mb-6">
                        <div className="relative inline-block mb-4">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-aira-cyan/50 glow-cyan mx-auto">
                                <img
                                    src={member.photo || "https://placehold.co/200x200/0d1526/00D4FF?text=" + member.name[0]}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/200x200/0d1526/00D4FF?text=${member.name[0]}`; }}
                                />
                            </div>
                            {member.isPresident && (
                                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-aira-gold to-amber-500 flex items-center justify-center text-xs">👑</div>
                            )}
                        </div>
                        <h2 className="font-orbitron font-bold text-xl text-white">{member.name}</h2>
                        <p className="text-aira-cyan text-sm mt-1">{member.role}</p>
                        {member.teamGroup && <p className="text-slate-500 text-xs mt-1">{member.teamGroup}</p>}
                    </div>

                    {member.bio && (
                        <p className="text-slate-300 text-sm leading-relaxed text-center mb-6">{member.bio}</p>
                    )}

                    <div className="flex justify-center gap-3">
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-aira-cyan/30 text-aira-cyan text-xs hover:bg-aira-cyan/10 transition-all">
                                <Linkedin size={14} /> LinkedIn
                            </a>
                        )}
                        {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-aira-border/50 text-slate-300 text-xs hover:border-aira-cyan/30 hover:text-aira-cyan transition-all">
                                <Github size={14} /> GitHub
                            </a>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Orbiting member card
function OrbitCard({ member, angle, radius, onClick }: { member: any; angle: number; radius: number; onClick: () => void }) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    return (
        <motion.button
            onClick={onClick}
            className="absolute"
            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%, -50%)" }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.95 }}
            title={member.name}
        >
            <div className="relative group">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-aira-cyan/40 group-hover:border-aira-cyan group-hover:shadow-lg group-hover:shadow-aira-cyan/50 transition-all duration-300">
                    <img
                        src={member.photo || `https://placehold.co/100x100/0d1526/00D4FF?text=${member.name[0]}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/100x100/0d1526/00D4FF?text=${member.name[0]}`; }}
                    />
                </div>
                {member.isPresident && (
                    <div className="absolute -top-1 -right-1 text-xs">👑</div>
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg glass text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-aira-cyan text-xs">{member.role}</div>
                </div>
            </div>
        </motion.button>
    );
}

export default function AboutPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [orbitAngle, setOrbitAngle] = useState(0);
    const animRef = useRef<number>();

    useEffect(() => {
        fetch("/api/team-members").then(r => r.ok ? r.json() : []).then(d => setMembers(Array.isArray(d) ? d : [])).catch(() => setMembers([]));
        fetch("/api/settings").then(r => r.ok ? r.json() : {}).then(d => setSettings(d)).catch(() => setSettings({}));
    }, []);

    // Slow orbit animation
    useEffect(() => {
        let last = performance.now();
        function tick(now: number) {
            const dt = now - last;
            last = now;
            setOrbitAngle(a => a + dt * 0.01); // degrees per ms
            animRef.current = requestAnimationFrame(tick);
        }
        animRef.current = requestAnimationFrame(tick);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, []);

    const nonPresidents = members.filter(m => !m.isPresident);
    const president = members.find(m => m.isPresident);
    const radius = 220; // orbit radius

    return (
        <div className="pt-24 pb-20 min-h-screen">
            {/* Hero title - split around center like reference */}
            <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-hero-glow opacity-40" />
                <div className="absolute inset-0 grid-bg" />

                {/* ABOUT text split */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
                    <motion.span
                        initial={{ x: -80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-[6rem] sm:text-[8rem] text-white/10 tracking-widest leading-none"
                    >
                        AB
                    </motion.span>
                    <div className="w-52 h-64 sm:w-64 sm:h-80" /> {/* Space for central image */}
                    <motion.span
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="font-orbitron font-black text-[6rem] sm:text-[8rem] text-white/10 tracking-widest leading-none"
                    >
                        OUT
                    </motion.span>
                </div>

                {/* Orbit system */}
                <div className="relative w-[500px] h-[500px] sm:w-[600px] sm:h-[600px]">
                    {/* Orbit ring */}
                    <div className="absolute inset-0 rounded-full border border-aira-cyan/10" style={{ margin: `${(500 - radius * 2) / 2}px` }} />

                    {/* Central image */}
                    <motion.div
                        animate={{ y: [-6, 6, -6] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                        <div className="relative">
                            <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-3xl overflow-hidden border-2 border-aira-cyan/50 glow-cyan">
                                <img
                                    src={president?.photo || settings.lab_main_image || "https://placehold.co/300x400/020817/00D4FF?text=AIRA+Labs"}
                                    alt="AIRA Labs"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x400/020817/00D4FF?text=AIRA+Labs"; }}
                                />
                            </div>
                            {/* Glow pulse rings */}
                            <div className="absolute inset-0 rounded-3xl border border-aira-cyan/20 animate-ping" style={{ animationDuration: "3s" }} />
                        </div>

                        {/* President info below central image */}
                        {president && (
                            <button
                                onClick={() => setSelectedMember(president)}
                                className="mt-4 text-center w-full group"
                            >
                                <p className="font-orbitron font-bold text-sm text-white group-hover:text-aira-cyan transition-colors">{president.name}</p>
                                <p className="text-aira-cyan text-xs">{president.role}</p>
                            </button>
                        )}
                    </motion.div>

                    {/* Orbiting members */}
                    {nonPresidents.map((member, i) => {
                        const base = (360 / nonPresidents.length) * i;
                        const current = (base + orbitAngle) % 360;
                        return (
                            <OrbitCard
                                key={member.id}
                                member={member}
                                angle={current}
                                radius={radius}
                                onClick={() => setSelectedMember(member)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* About text */}
            <section className="max-w-4xl mx-auto px-4 py-16 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-slate-300 text-lg leading-relaxed"
                >
                    {settings.lab_about_text || "AIRA Labs is a premier innovation and research laboratory at our college, fostering creativity, technology, and excellence."}
                </motion.p>
            </section>

            {/* Team grid - full view */}
            <section className="max-w-6xl mx-auto px-4 pb-20">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="font-orbitron font-bold text-2xl text-white text-center mb-10"
                >
                    Meet the <span className="gradient-text">Team</span>
                </motion.h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {members.map((member, i) => (
                        <motion.button
                            key={member.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedMember(member)}
                            className="glass rounded-2xl p-4 text-center hover:border-aira-cyan/40 border border-transparent transition-all card-3d group"
                        >
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-aira-cyan/50 mx-auto mb-3 transition-all">
                                <img
                                    src={member.photo || `https://placehold.co/100x100/0d1526/00D4FF?text=${member.name[0]}`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/100x100/0d1526/00D4FF?text=${member.name[0]}`; }}
                                />
                            </div>
                            {member.isPresident && <div className="text-xs mb-1">👑</div>}
                            <p className="font-semibold text-xs text-white line-clamp-1">{member.name}</p>
                            <p className="text-aira-cyan text-xs mt-0.5 line-clamp-1">{member.role}</p>
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* Member modal */}
            {selectedMember && (
                <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}
        </div>
    );
}
