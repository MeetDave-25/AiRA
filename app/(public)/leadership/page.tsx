"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Linkedin, Github, ExternalLink, X, ArrowUpRight, Quote, RefreshCw } from "lucide-react";
import { BLOCK_COLORS, Btn, Button, Card, Chip, EASE, Empty, PageHero, WRAP } from "@/components/nb/kit";

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

const avatarFallback = (name: string, size = 300) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F3EFE4&color=111111&size=${size}&bold=true`;

const externalHref = (url: string) => (url.startsWith("http") ? url : `https://${url}`);

function Photo({ leader, className }: { leader: LeaderProfile; className: string }) {
    return (
        <img
            src={leader.photo || avatarFallback(leader.name)}
            alt={leader.name}
            loading="lazy"
            decoding="async"
            className={className}
            onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(leader.name); }}
        />
    );
}

function LeaderDetailModal({ leader, onClose }: { leader: LeaderProfile | null; onClose: () => void }) {
    if (!leader) return null;

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
                            {leader.isPresident ? <><Crown size={16} /> Executive board</> : "Leadership profile"}
                            {leader.teamGroup && <span className="hidden sm:inline font-mono text-xs font-normal">· {leader.teamGroup}</span>}
                        </span>
                        <button onClick={onClose} aria-label="Close profile" className="w-9 h-9 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center">
                            <X size={17} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[290px_1fr] overflow-y-auto overscroll-contain flex-1">
                        <div className="p-6 sm:p-7 flex flex-col items-center md:items-start text-center md:text-left gap-4 md:border-r-2 border-nb-ink bg-nb-lilac">
                            <div className="relative">
                                <Photo leader={leader} className="w-36 h-36 md:w-44 md:h-44 rounded-3xl border-2 border-nb-ink object-cover shadow-nb bg-white" />
                                {leader.isPresident && (
                                    <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-nb-sun px-2.5 py-0.5 text-[11px] font-bold rotate-6">
                                        <Crown size={11} /> Founder
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="font-brico font-extrabold text-2xl tracking-tight">{leader.name}</h2>
                                <p className="font-semibold text-nb-violet">{leader.role}</p>
                            </div>
                            <div className="w-full space-y-2">
                                {leader.linkedin && (
                                    <a href={externalHref(leader.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white px-4 py-2.5 font-bold text-sm shadow-nb-sm hover:shadow-none transition-shadow">
                                        <Linkedin size={16} /> LinkedIn <ExternalLink size={13} className="ml-auto" />
                                    </a>
                                )}
                                {leader.github && (
                                    <a href={externalHref(leader.github)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white px-4 py-2.5 font-bold text-sm shadow-nb-sm hover:shadow-none transition-shadow">
                                        <Github size={16} /> GitHub <ExternalLink size={13} className="ml-auto" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
                            <div>
                                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-nb-muted pb-3 border-b-2 border-nb-ink/15">
                                    <Quote size={14} /> In their words
                                </p>
                                {leader.bio ? (
                                    <div className="mt-4 space-y-3 leading-relaxed text-nb-ink/85 break-words">
                                        {leader.bio.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
                                    </div>
                                ) : (
                                    <p className="mt-4 italic text-nb-muted">No bio yet.</p>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={onClose} tone="white" size="sm">Close profile</Button>
                            </div>
                        </div>
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
            if (Array.isArray(membersData)) {
                // Filter only leaders/presidents/board/directors from the database
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
                setLeaders(dbLeaders);
            }
            setSettings(settingsData || {});
            setIsLoading(false);
        });
    }, []);

    const categories = useMemo(() => {
        const groups = new Set<string>();
        leaders.forEach(l => {
            if (l.teamGroup) groups.add(l.teamGroup);
        });
        return ["ALL", ...Array.from(groups)];
    }, [leaders]);

    const executiveSpotlight = useMemo(() => {
        return leaders.filter(l => l.isPresident || l.sortOrder === 1 || (l.role || "").toLowerCase().includes("founder") || (l.role || "").toLowerCase().includes("president"));
    }, [leaders]);

    const filteredLeaders = useMemo(() => {
        if (activeTab === "ALL") return leaders;
        return leaders.filter(l => l.teamGroup === activeTab);
    }, [leaders, activeTab]);

    return (
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Leadership & team"
                title="The people behind it."
                says="These are the students and mentors who keep our community running. Tap anyone to read their story!"
                desc={settings.leadership_hero_subtitle || "AiRA Lab is student-led. Meet the founders, leads and mentors who organise the teams, run the events and help everyone build."}
            />

            <div className={`${WRAP} space-y-16`}>
                {isLoading && (
                    <p className="flex items-center justify-center gap-2 py-16 text-nb-muted">
                        <RefreshCw size={18} className="animate-spin" /> Loading the team…
                    </p>
                )}

                {!isLoading && leaders.length === 0 && (
                    <Empty icon={<Crown size={24} />} title="Leadership profiles coming soon" desc="Our directory is being updated — check back shortly.">
                        <Btn href="/about" tone="white">About us</Btn>
                        <Btn href="/join">Join AiRA Lab</Btn>
                    </Empty>
                )}

                {!isLoading && executiveSpotlight.length > 0 && (
                    <section>
                        <h2 className="font-brico font-extrabold text-3xl tracking-tight flex items-center gap-2">
                            <Crown size={24} /> Founders & executive council
                        </h2>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {executiveSpotlight.map((leader, index) => (
                                <motion.button
                                    type="button"
                                    key={leader.id}
                                    initial={{ opacity: 0, y: 30, rotate: index % 2 ? 2 : -2 }}
                                    whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 1 : -1 }}
                                    whileHover={{ rotate: 0, y: -6 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.55, ease: EASE, delay: index * 0.08 }}
                                    onClick={() => setSelectedLeader(leader)}
                                    className="text-left rounded-[24px] border-2 border-nb-ink shadow-nb-lg overflow-hidden bg-white"
                                >
                                    <div className="relative m-3 mb-0 aspect-[4/5] rounded-[18px] border-2 border-nb-ink bg-nb-paper overflow-hidden">
                                        <Photo leader={leader} className="w-full h-full object-cover object-[50%_20%]" />
                                        <span aria-hidden="true" className={`absolute bottom-0 inset-x-0 h-2 border-t-2 border-nb-ink ${BLOCK_COLORS[index % BLOCK_COLORS.length]}`} />
                                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-nb-sun px-2.5 py-0.5 text-[11px] font-bold">
                                            <Crown size={11} /> Executive lead
                                        </span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-brico font-extrabold text-2xl tracking-tight">{leader.name}</h3>
                                        <p className="font-semibold text-nb-ink/75">{leader.role}</p>
                                        {leader.bio && <p className="mt-3 text-sm text-nb-ink/75 line-clamp-3">&ldquo;{leader.bio}&rdquo;</p>}
                                        <div className="mt-4 pt-3 border-t-2 border-nb-ink/15 flex items-center justify-between">
                                            <span className="flex gap-2">
                                                {leader.linkedin && <Linkedin size={16} />}
                                                {leader.github && <Github size={16} />}
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-brico font-bold text-sm">
                                                View profile <ArrowUpRight size={15} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </section>
                )}

                {!isLoading && filteredLeaders.length > 0 && (
                    <section>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <h2 className="font-brico font-extrabold text-3xl tracking-tight">Leads & team directory</h2>
                            {categories.length > 2 && (
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <Chip key={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)}>
                                            {cat === "ALL" ? "Everyone" : cat}
                                        </Chip>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {filteredLeaders.map((leader, idx) => (
                                <motion.button
                                    type="button"
                                    key={leader.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, ease: EASE, delay: (idx % 4) * 0.05 }}
                                    onClick={() => setSelectedLeader(leader)}
                                    className="group text-left rounded-[22px] border-2 border-nb-ink bg-white shadow-nb p-5 transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg"
                                >
                                    <div className="relative w-20 h-20">
                                        <Photo leader={leader} className="w-20 h-20 rounded-2xl border-2 border-nb-ink object-cover object-[50%_20%] bg-nb-paper" />
                                        {leader.isPresident && <span className="absolute -top-2 -right-2 text-lg">👑</span>}
                                    </div>
                                    <h3 className="mt-4 font-brico font-extrabold text-lg leading-tight truncate group-hover:text-nb-violet transition-colors">{leader.name}</h3>
                                    <p className="text-sm text-nb-muted truncate">{leader.role}</p>
                                    {leader.teamGroup && (
                                        <span className="mt-2 inline-block rounded-full border-2 border-nb-ink bg-nb-paper px-2 py-0.5 text-[10px] font-bold">{leader.teamGroup}</span>
                                    )}
                                    {leader.bio && <p className="mt-3 text-xs text-nb-muted line-clamp-2">{leader.bio}</p>}
                                </motion.button>
                            ))}
                        </div>
                    </section>
                )}

                <Card className="p-8 sm:p-12 text-center" color="bg-nb-violet">
                    <div className="text-white max-w-2xl mx-auto">
                        <h2 className="font-brico font-extrabold text-3xl sm:text-4xl tracking-tight">Want to lead something?</h2>
                        <p className="mt-3 text-white/80">Every lead here started as a member. Join the community, build things, and step up when you&apos;re ready.</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Btn href="/join" tone="sun">Join AiRA Lab →</Btn>
                            <Btn href="/about" tone="white">About the community</Btn>
                        </div>
                    </div>
                </Card>
            </div>

            <LeaderDetailModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
        </div>
    );
}
