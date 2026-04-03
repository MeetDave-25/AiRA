"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, FileText, TrendingUp, Trophy, Users } from "lucide-react";

type GrowthRow = {
    month: string;
    events: number;
    applications: number;
};

const monthLabel = (date: Date) =>
    date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

function createLastMonths(count: number) {
    const rows: { key: string; label: string }[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        rows.push({ key, label: monthLabel(d) });
    }

    return rows;
}

function toMonthKey(input: string | Date) {
    const d = new Date(input);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminAnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/events").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/applications").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/achievements").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/teams").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/team-members").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/task-updates?take=20").then((r) => (r.ok ? r.json() : [])),
        ])
            .then(([eventData, appData, achievementData, teamData, memberData, updatesData]) => {
                setEvents(Array.isArray(eventData) ? eventData : []);
                setApplications(Array.isArray(appData) ? appData : []);
                setAchievements(Array.isArray(achievementData) ? achievementData : []);
                setTeams(Array.isArray(teamData) ? teamData : []);
                setTeamMembers(Array.isArray(memberData) ? memberData : []);
                setTaskUpdates(Array.isArray(updatesData) ? updatesData : []);
            })
            .finally(() => setLoading(false));
    }, []);

    const upcomingCount = useMemo(
        () => events.filter((e) => new Date(e.date) > new Date()).length,
        [events]
    );

    const pipeline = useMemo(() => {
        const pending = applications.filter((a) => a.status === "PENDING").length;
        const approved = applications.filter((a) => a.status === "APPROVED").length;
        const rejected = applications.filter((a) => a.status === "REJECTED").length;
        return { pending, approved, rejected };
    }, [applications]);

    const growthData: GrowthRow[] = useMemo(() => {
        const months = createLastMonths(6);
        const eventsByMonth = new Map<string, number>();
        const applicationsByMonth = new Map<string, number>();

        events.forEach((e) => {
            const key = toMonthKey(e.date);
            eventsByMonth.set(key, (eventsByMonth.get(key) || 0) + 1);
        });

        applications.forEach((a) => {
            const key = toMonthKey(a.createdAt);
            applicationsByMonth.set(key, (applicationsByMonth.get(key) || 0) + 1);
        });

        return months.map((m) => ({
            month: m.label,
            events: eventsByMonth.get(m.key) || 0,
            applications: applicationsByMonth.get(m.key) || 0,
        }));
    }, [events, applications]);

    const maxGrowth = Math.max(
        1,
        ...growthData.map((row) => Math.max(row.events, row.applications))
    );

    const kpis = [
        { label: "Total Events", value: events.length, icon: CalendarDays, tone: "#00D4FF" },
        { label: "Upcoming Events", value: upcomingCount, icon: TrendingUp, tone: "#7C3AED" },
        { label: "Applications", value: applications.length, icon: FileText, tone: "#F59E0B" },
        { label: "Achievements", value: achievements.length, icon: Trophy, tone: "#FF006E" },
        { label: "Team Profiles", value: teamMembers.length, icon: Users, tone: "#22C55E" },
        { label: "Teams", value: teams.length, icon: Users, tone: "#38BDF8" },
    ];

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-10 -right-12 w-56 h-56 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-56 h-56 bg-aira-magenta/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-white/10">
                <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">Admin Analytics</h1>
                <p className="text-slate-400 text-sm mt-1">Real-time view of events, applications pipeline, and growth trends</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 border border-white/10 card-3d">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                <p className="font-orbitron text-3xl font-bold mt-2" style={{ color: kpi.tone }}>
                                    {loading ? "..." : kpi.value}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${kpi.tone}20`, border: `1px solid ${kpi.tone}50` }}>
                                <kpi.icon size={18} style={{ color: kpi.tone }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-2 glass rounded-2xl border border-white/10 p-5">
                    <h2 className="font-orbitron text-sm text-slate-300 uppercase tracking-widest mb-4">Growth Chart (Last 6 Months)</h2>
                    <div className="grid grid-cols-6 gap-3 items-end h-56">
                        {growthData.map((row) => {
                            const eventHeight = `${Math.max(6, (row.events / maxGrowth) * 100)}%`;
                            const appHeight = `${Math.max(6, (row.applications / maxGrowth) * 100)}%`;

                            return (
                                <div key={row.month} className="flex flex-col items-center gap-2 h-full justify-end">
                                    <div className="w-full flex items-end justify-center gap-1 h-44">
                                        <motion.div initial={{ height: 0 }} animate={{ height: eventHeight }} className="w-3 rounded-t bg-aira-cyan/90" title={`Events: ${row.events}`} />
                                        <motion.div initial={{ height: 0 }} animate={{ height: appHeight }} className="w-3 rounded-t bg-aira-magenta/90" title={`Applications: ${row.applications}`} />
                                    </div>
                                    <p className="text-[10px] text-slate-400">{row.month}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-aira-cyan/90" /> Events</span>
                        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-aira-magenta/90" /> Applications</span>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl border border-white/10 p-5">
                    <h2 className="font-orbitron text-sm text-slate-300 uppercase tracking-widest mb-4">Applications Pipeline</h2>
                    <div className="space-y-3">
                        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
                            <p className="text-[11px] text-amber-300 uppercase">Pending</p>
                            <p className="text-2xl font-orbitron font-bold text-amber-200">{pipeline.pending}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                            <p className="text-[11px] text-emerald-300 uppercase">Approved</p>
                            <p className="text-2xl font-orbitron font-bold text-emerald-200">{pipeline.approved}</p>
                        </div>
                        <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3">
                            <p className="text-[11px] text-rose-300 uppercase">Rejected</p>
                            <p className="text-2xl font-orbitron font-bold text-rose-200">{pipeline.rejected}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl border border-white/10 p-5">
                <h2 className="font-orbitron text-sm text-slate-300 uppercase tracking-widest mb-4">Latest Team Updates</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {taskUpdates.map((u) => (
                        <div key={u.id} className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
                            <div className="flex justify-between gap-2 text-[11px] text-slate-500 mb-1">
                                <span>{u.author?.name || "Unknown"} • {u.task?.team?.name || "No team"}</span>
                                <span>{new Date(u.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-aira-cyan mb-1">Task: {u.task?.title || "Untitled"}</p>
                            <p className="text-sm text-slate-200 whitespace-pre-wrap">{u.message}</p>
                        </div>
                    ))}
                    {!loading && taskUpdates.length === 0 && <p className="text-sm text-slate-500">No team updates yet.</p>}
                </div>
            </motion.div>
        </div>
    );
}
