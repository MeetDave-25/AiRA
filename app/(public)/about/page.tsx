"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Linkedin, ExternalLink, Sparkles, Zap, Cpu, Code2, BrainCircuit, Trophy, Users, Rocket, Crown, Quote, Orbit as OrbitIcon } from "lucide-react";
import dynamic from "next/dynamic";
import LabDNA from "@/components/about/LabDNA";
import { BLOCK_COLORS, Block, Btn, Button, Card, Chip, EASE, Empty, Mask, MevySays, SearchInput, SectionHead, WRAP } from "@/components/nb/kit";

const TeamTunnelSystem = dynamic(() => import("@/components/ui/TeamTunnelSystem"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[470px] sm:h-[620px] flex items-center justify-center font-mono text-xs text-white/50 animate-pulse">
            Loading the 3D team tunnel…
        </div>
    ),
});

const avatarFallback = (name: string, size = 300) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D6CEFF&color=111111&size=${size}&bold=true`;

const externalHref = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

function MemberModal({ member, onClose }: { member: any; onClose: () => void }) {
    if (!member) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-nb-ink/60 backdrop-blur-sm overflow-y-auto overscroll-contain p-3 sm:p-6 flex items-start sm:items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 20, rotate: -1.5 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                    className="my-auto w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[26px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-nb-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b-2 border-nb-ink bg-nb-sun shrink-0">
                        <span className="inline-flex items-center gap-2 font-brico font-bold">
                            {member.isPresident ? "👑 Founder profile" : "🤝 Community member"}
                            {member.teamGroup && <span className="hidden sm:inline font-mono text-xs font-normal">· {member.teamGroup}</span>}
                        </span>
                        <button onClick={onClose} aria-label="Close profile" className="w-9 h-9 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center">
                            <X size={17} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[290px_1fr] overflow-y-auto overscroll-contain flex-1">
                        <div className="p-6 sm:p-7 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:border-r-2 border-nb-ink bg-nb-lilac">
                            <img
                                src={member.photo || avatarFallback(member.name)}
                                alt={member.name}
                                className="w-36 h-36 md:w-44 md:h-44 rounded-3xl border-2 border-nb-ink object-cover shadow-nb bg-white"
                                onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(member.name); }}
                            />
                            <div>
                                <h2 className="font-brico font-extrabold text-2xl tracking-tight break-words">{member.name}</h2>
                                <p className="font-semibold text-nb-violet">{member.role}</p>
                            </div>
                            <div className="w-full space-y-2">
                                {member.linkedin && (
                                    <a href={externalHref(member.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white px-4 py-2.5 font-bold text-sm shadow-nb-sm hover:shadow-none transition-shadow">
                                        <Linkedin size={16} /> LinkedIn <ExternalLink size={13} className="ml-auto" />
                                    </a>
                                )}
                                {member.github && (
                                    <a href={externalHref(member.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white px-4 py-2.5 font-bold text-sm shadow-nb-sm hover:shadow-none transition-shadow">
                                        <Github size={16} /> GitHub <ExternalLink size={13} className="ml-auto" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-nb-muted pb-3 border-b-2 border-nb-ink/15">
                                    <Quote size={14} /> About
                                </p>
                                {member.bio ? (
                                    <div className="mt-4 space-y-3 leading-relaxed text-nb-ink/85 break-words">
                                        {member.bio.split("\n\n").map((para: string, i: number) => <p key={i}>{para}</p>)}
                                    </div>
                                ) : (
                                    <p className="mt-4 italic text-nb-muted">No bio yet.</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="inline-flex items-center gap-2 text-sm text-nb-muted">
                                    <span className="w-2.5 h-2.5 rounded-full border-2 border-nb-ink bg-nb-mint" /> Active member
                                </span>
                                <Button onClick={onClose} tone="white" size="sm">Close profile</Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

interface TeamDivisionInfo {
    id: string;
    name: string;
    shortName: string;
    icon: any;
    accentColor: string;
    description: string;
    lead: any | null;
    members: any[];
    allMembers: any[];
}

const corePillars = [
    { icon: Code2, title: "We build software", desc: "Web apps, platforms and tools — shipped and used by real people.", color: "bg-nb-sky" },
    { icon: BrainCircuit, title: "We train AI", desc: "Vision, language and agents — from notebook experiments to deployed models.", color: "bg-nb-peach" },
    { icon: Cpu, title: "We make robots", desc: "Rovers, arms and electronics that sense, decide and move.", color: "bg-nb-mint" },
    { icon: Users, title: "We learn together", desc: "Seniors mentor juniors, teams share what they learn, everyone levels up.", color: "bg-nb-lilac" },
];

export default function AboutPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [activeGroup, setActiveGroup] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [adminTeams, setAdminTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

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

    const president = useMemo(() => {
        return members.find((m) => m.isPresident) || members[0] || null;
    }, [members]);

    // Structured team divisions — from admin teams + every member's teamGroup
    const teamDivisions = useMemo<TeamDivisionInfo[]>(() => {
        if (!members.length && !adminTeams.length) return [];

        const teamMap = new Map<string, { name: string; color?: string; description?: string }>();

        adminTeams.forEach((team) => {
            if (team.name) {
                teamMap.set(team.name.trim().toLowerCase(), {
                    name: team.name.trim(),
                    color: team.color || "#6C5CE7",
                    description: team.description || `${team.name} division at AiRA Lab`,
                });
            }
        });

        members.forEach((m) => {
            const grp = (m.teamGroup || "").trim();
            if (grp) {
                const lower = grp.toLowerCase();
                if (!teamMap.has(lower)) {
                    teamMap.set(lower, {
                        name: grp,
                        color: m.teamColor || "#6C5CE7",
                        description: m.teamDescription || `${grp} division at AiRA Lab`,
                    });
                }
            }
        });

        if (teamMap.size === 0 && members.length > 0) {
            teamMap.set("core team", {
                name: "Core Innovation Team",
                color: "#6C5CE7",
                description: "The core team at AiRA Lab",
            });
        }

        const result: TeamDivisionInfo[] = [];

        teamMap.forEach((teamInfo, lowerKey) => {
            const groupName = teamInfo.name;
            const lower = lowerKey;

            let mList = members.filter((m) => {
                const raw = (m.teamGroup || "").trim().toLowerCase();
                return raw === lower;
            });

            if (teamMap.size === 1 && mList.length === 0) {
                mList = members;
            }

            if (mList.length === 0) return;

            let icon = Users;
            if (lower.includes("founder") || lower.includes("mentor") || lower.includes("executive") || lower.includes("board")) icon = Crown;
            else if (lower.includes("robotics") || lower.includes("hardware") || lower.includes("embedded") || lower.includes("circuit")) icon = Cpu;
            else if (lower.includes("ai") || lower.includes("ml") || lower.includes("neural") || lower.includes("software") || lower.includes("cloud") || lower.includes("web") || lower.includes("tech")) icon = Code2;
            else if (lower.includes("cyber") || lower.includes("security") || lower.includes("network")) icon = Zap;
            else if (lower.includes("advisor") || lower.includes("research") || lower.includes("data") || lower.includes("science")) icon = Sparkles;
            else if (lower.includes("hackathon") || lower.includes("event") || lower.includes("council") || lower.includes("management") || lower.includes("treasurer")) icon = Trophy;

            // Division lead priority: isTeamLead > isPresident > leader-like role > sortOrder
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
            // Keep the president at the centre of the overview rather than as a team lead.
            if (lead?.id === president?.id && sorted.length > 1) {
                lead = sorted[1];
            }
            const subMembers = sorted.filter((m) => m.id !== lead?.id);

            result.push({
                id: groupName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                name: groupName,
                shortName: groupName,
                icon,
                accentColor: teamInfo.color || "#6C5CE7",
                description: teamInfo.description || `${groupName} division at AiRA Lab`,
                lead,
                members: subMembers,
                allMembers: sorted,
            });
        });

        // Hierarchy: founders/executives first, then mentors/advisors, then the tech wing, then the rest by size.
        const rank = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes("founder") || n.includes("president") || n.includes("executive") || n.includes("board")) return 0;
            if (n.includes("mentor") || n.includes("advisor") || n.includes("faculty")) return 1;
            if (n.includes("tech")) return 2;
            return 3;
        };
        result.sort((a, b) => rank(a.name) - rank(b.name) || b.allMembers.length - a.allMembers.length);

        return result;
    }, [adminTeams, members, president]);

    const activeTeamDivision = useMemo(() => {
        if (!selectedTeamId) return null;
        return teamDivisions.find((d) => d.id === selectedTeamId) || null;
    }, [selectedTeamId, teamDivisions]);

    const centerPerson = useMemo(() => {
        if (activeTeamDivision) {
            return activeTeamDivision.lead || president;
        }
        return president;
    }, [activeTeamDivision, president]);

    // Overview: one representative per team (topped up with members); focused: that team's members.
    const currentOrbitingItems = useMemo(() => {
        if (!activeTeamDivision) {
            const leads = teamDivisions
                .map((div) => div.lead)
                .filter((lead) => lead && lead.id !== president?.id);

            if (leads.length < 6) {
                const leadIds = new Set(leads.map((l) => l?.id));
                const extra = members
                    .filter((m) => m.id !== president?.id && !leadIds.has(m.id))
                    .slice(0, 8 - leads.length);
                return [...leads, ...extra];
            }
            return leads;
        }

        if (activeTeamDivision.members.length > 0) {
            return activeTeamDivision.members;
        }
        return activeTeamDivision.allMembers.filter((m) => m.id !== centerPerson?.id);
    }, [activeTeamDivision, teamDivisions, president, members, centerPerson]);

    const tunnelMembers = useMemo(() => {
        if (centerPerson && !currentOrbitingItems.some(m => m?.id === centerPerson.id)) {
            return [centerPerson, ...currentOrbitingItems];
        }
        return currentOrbitingItems.length > 0 ? currentOrbitingItems : members;
    }, [centerPerson, currentOrbitingItems, members]);

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

    return (
        <div className="min-h-screen pb-24">
            {/* Hero */}
            <header className={`${WRAP} pt-32 sm:pt-36 pb-12 grid lg:grid-cols-12 gap-10 items-end`}>
                <div className="lg:col-span-8">
                    <MevySays className="mb-8">This is us — led by LJCCA students. Let me introduce everyone!</MevySays>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">About AiRA Lab · L J College of Computer Application</p>
                    <h1 className="mt-3 font-brico font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,7vw,6rem)] break-words">
                        <Mask play>Led by LJCCA students.</Mask>
                        <Mask play delay={0.1}>
                            Built{" "}
                            <Block color="bg-nb-sun" tilt={-2}>
                                together.
                            </Block>
                        </Mask>
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-nb-muted leading-relaxed">
                        {settings.lab_about_text ||
                            "AiRA Lab is led by LJCCA students — a community at L J College of Computer Application where students team up to build software, AI and robotics — and help each other learn along the way."}
                    </p>
                </div>
                <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                    {[
                        { k: "Members", v: members.length || "—", c: "bg-nb-sky" },
                        { k: "Teams", v: teamDivisions.length || "—", c: "bg-nb-peach" },
                    ].map((s, i) => (
                        <Card key={s.k} className={`p-5 ${i ? "rotate-2" : "-rotate-2"}`} color={s.c}>
                            <p className="font-brico font-extrabold text-5xl tracking-tight">{s.v}</p>
                            <p className="font-mono text-xs uppercase tracking-[0.14em]">{s.k}</p>
                        </Card>
                    ))}
                </div>
            </header>

            {/* 3D team tunnel — kept as a dark "screen" inside the page */}
            <section id="about-content" className={WRAP}>
                <div className="-mx-2 sm:mx-0 rounded-[22px] sm:rounded-[28px] border-2 border-nb-ink bg-nb-ink shadow-nb sm:shadow-nb-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b-2 border-white/10 text-white">
                        <span className="flex items-center gap-2 font-brico font-bold text-sm sm:text-base">
                            <span className="flex gap-1.5" aria-hidden="true">
                                <span className="w-3 h-3 rounded-full bg-nb-peach" />
                                <span className="w-3 h-3 rounded-full bg-nb-sun" />
                                <span className="w-3 h-3 rounded-full bg-nb-mint" />
                            </span>
                            <OrbitIcon size={16} className="ml-2" /> The team, in 3D
                        </span>
                        {activeTeamDivision ? (
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs">
                                <span className="min-w-0 truncate">Focused: <strong>{activeTeamDivision.name}</strong> · {activeTeamDivision.allMembers.length} members</span>
                                <button onClick={() => setSelectedTeamId(null)} className="shrink-0 rounded-lg border border-white/30 px-2 py-0.5 hover:bg-white/10">
                                    Show everyone ✕
                                </button>
                            </span>
                        ) : (
                            <span className="font-mono text-xs text-white/50">Tap anyone to open their profile</span>
                        )}
                    </div>
                    <div className="px-1.5 sm:px-4">
                        <TeamTunnelSystem items={tunnelMembers} onSelectMember={(m) => setSelectedMember(m)} />
                    </div>
                </div>
            </section>

            {/* What we do */}
            <section className={`${WRAP} pt-24`}>
                <SectionHead kicker="What we do" title="Four things, every week." />
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {corePillars.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
                                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
                                whileHover={{ rotate: 0, y: -4 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
                                className={`rounded-[22px] border-2 border-nb-ink shadow-nb p-6 ${p.color}`}
                            >
                                <span className="w-12 h-12 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm">
                                    <Icon size={20} />
                                </span>
                                <h3 className="mt-5 font-brico font-extrabold text-2xl tracking-tight">{p.title}</h3>
                                <p className="mt-2 text-nb-ink/75 leading-relaxed">{p.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Lab DNA — name + three taps grow a unique helix and match you to a team */}
            <section className={`${WRAP} pt-24`}>
                <LabDNA teams={teamDivisions} />
            </section>

            {/* Meet Mevy */}
            <section className={`${WRAP} pt-24`}>
                <Card className="relative overflow-hidden p-6 sm:p-10 lg:p-14" color="bg-nb-lilac">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 order-2 lg:order-1">
                            <span className="inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-white px-3 py-1 font-brico font-bold text-sm">
                                <Sparkles size={14} /> Mascot & AI guide
                            </span>
                            <h2 className="mt-4 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2.4rem,5vw,4.5rem)]">
                                Meet Mevy.
                            </h2>
                            <p className="mt-4 text-lg text-nb-ink/80 leading-relaxed max-w-xl">
                                Our cyber-wolf mascot and AI guide. Mevy knows the lab inside out — ask about events, teams, projects or how to join.
                            </p>
                            <div className="mt-6 grid sm:grid-cols-3 gap-3">
                                {[
                                    ["01 · Vision", "A new mind"],
                                    ["02 · Drive", "A new energy"],
                                    ["03 · Legacy", "A new impact"],
                                ].map(([k, v]) => (
                                    <div key={k} className="rounded-2xl border-2 border-nb-ink bg-white p-4">
                                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-nb-violet">{k}</p>
                                        <p className="font-brico font-bold">{v}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button onClick={() => window.dispatchEvent(new CustomEvent("open-aira-chat"))}>
                                    <Sparkles size={16} /> Chat with Mevy
                                </Button>
                                <Btn href="/join" tone="white">Join the pack →</Btn>
                            </div>
                        </div>
                        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
                            <motion.img
                                src="/mevy-cutout.webp"
                                alt="Mevy, the AiRA Lab mascot"
                                initial={{ y: -60, rotate: -8, opacity: 0 }}
                                whileInView={{ y: 0, rotate: 3, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 70, damping: 12 }}
                                className="h-[340px] sm:h-[420px] w-auto drop-shadow-[6px_8px_0_rgba(17,17,17,0.9)]"
                            />
                        </div>
                    </div>
                </Card>
            </section>

            {/* Team directory */}
            <section className={`${WRAP} pt-24`}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <SectionHead kicker="Directory by team" title="Meet the teams." />
                    <div className="flex flex-wrap gap-3">
                        <Btn href="/leadership" tone="white"><Crown size={16} /> Leadership</Btn>
                        <Btn href="/join"><Rocket size={16} /> Join a team</Btn>
                    </div>
                </div>

                <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <Chip active={activeGroup === "ALL"} onClick={() => setActiveGroup("ALL")}>Everyone ({members.length})</Chip>
                        {teamDivisions.map((div) => (
                            <Chip key={div.id} active={activeGroup === div.name || activeGroup === div.id} onClick={() => setActiveGroup(div.name)}>
                                {div.shortName} <span className="opacity-60">{div.allMembers.length}</span>
                            </Chip>
                        ))}
                    </div>
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search members by name or role…" />
                </div>

                {isLoading ? (
                    <p className="py-20 text-center text-nb-muted">Loading teams…</p>
                ) : filteredDivisions.length === 0 ? (
                    <div className="mt-10">
                        <Empty icon={<Users size={24} />} title="No members found" desc="Nobody matches that filter or search.">
                            <Button onClick={() => { setActiveGroup("ALL"); setSearchQuery(""); }}>Reset filters</Button>
                        </Empty>
                    </div>
                ) : (
                    <div className="mt-10 space-y-14">
                        {filteredDivisions.map((division, dIdx) => {
                            const Icon = division.icon;
                            return (
                                <div key={division.id}>
                                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 border-nb-ink p-4 sm:p-5 shadow-nb-sm ${BLOCK_COLORS[dIdx % BLOCK_COLORS.length]}`}>
                                        <div className="flex items-center gap-3.5">
                                            <span className="w-12 h-12 shrink-0 rounded-xl border-2 border-nb-ink bg-white flex items-center justify-center">
                                                <Icon size={20} />
                                            </span>
                                            <div>
                                                <h3 className="font-brico font-extrabold text-xl sm:text-2xl flex items-center gap-2 flex-wrap">
                                                    {division.name}
                                                    <span className="rounded-full border-2 border-nb-ink bg-white px-2 py-0.5 text-xs font-bold">
                                                        {division.allMembers.length} {division.allMembers.length === 1 ? "member" : "members"}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-nb-ink/70 line-clamp-1">{division.description}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            tone="white"
                                            onClick={() => {
                                                setSelectedTeamId(division.id);
                                                document.getElementById("about-content")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                            }}
                                        >
                                            <OrbitIcon size={14} /> View in 3D ↑
                                        </Button>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {division.allMembers.map((member, i) => {
                                            const isLead = member.id === division.lead?.id || isLeaderMember(member);
                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={member.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, ease: EASE, delay: (i % 5) * 0.04 }}
                                                    onClick={() => setSelectedMember(member)}
                                                    className={`group text-center rounded-[20px] border-2 border-nb-ink p-4 shadow-nb-sm transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb ${
                                                        isLead ? "bg-nb-sun" : "bg-white"
                                                    }`}
                                                >
                                                    <div className="relative w-20 h-20 mx-auto">
                                                        <img
                                                            src={member.photo || avatarFallback(member.name, 200)}
                                                            alt={member.name}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="w-20 h-20 rounded-full border-2 border-nb-ink object-cover bg-nb-lilac"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(member.name, 200); }}
                                                        />
                                                        {member.isPresident ? (
                                                            <span className="absolute -top-1 -right-1 text-sm" title="Founder / President">👑</span>
                                                        ) : isLead ? (
                                                            <span className="absolute -top-1 -right-1 text-sm" title="Team lead">⭐</span>
                                                        ) : null}
                                                    </div>
                                                    <h4 className="mt-3 font-brico font-bold truncate group-hover:text-nb-violet transition-colors">{member.name}</h4>
                                                    <p className="text-xs text-nb-muted line-clamp-1">{member.role}</p>
                                                    {isLead && (
                                                        <span className="mt-2 inline-block rounded-full border-2 border-nb-ink bg-white px-2 py-0.5 text-[10px] font-bold">
                                                            {member.isPresident ? "Founder" : "Lead"}
                                                        </span>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
        </div>
    );
}
