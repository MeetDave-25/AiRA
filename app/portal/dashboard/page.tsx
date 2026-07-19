"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Award, Calendar, CheckSquare, Clock3, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "TEAM_MEMBER";

    const [tasks, setTasks] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/tasks")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTasks(Array.isArray(d) ? d : []))
            .catch(() => setTasks([]));

        fetch("/api/events")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setEvents(Array.isArray(d) ? d : []))
            .catch(() => setEvents([]));
    }, []);

    const taskStats = useMemo(() => {
        const todo = tasks.filter((t) => t.status === "TODO").length;
        const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
        const done = tasks.filter((t) => t.status === "DONE").length;
        const mine = tasks.filter((t) => t.isAssignedToMe).length;
        return { todo, inProgress, done, mine };
    }, [tasks]);

    const profileStats = useMemo(() => {
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === "DONE").length;
        const now = new Date();
        const overdue = tasks.filter((t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        const completedDays = Array.from(
            new Set(
                tasks
                    .filter((t) => t.status === "DONE")
                    .map((t) => new Date(t.updatedAt).toISOString().slice(0, 10))
            )
        );

        let streak = 0;
        const dayCursor = new Date();
        while (true) {
            const key = dayCursor.toISOString().slice(0, 10);
            if (completedDays.includes(key)) {
                streak += 1;
                dayCursor.setDate(dayCursor.getDate() - 1);
            } else {
                break;
            }
        }

        return { progress, overdue, streak };
    }, [tasks]);

    const upcomingEvents = useMemo(
        () => events.filter((e) => new Date(e.date) > new Date()).slice(0, 4),
        [events]
    );

    const stats = [
        { label: "My Tasks", value: String(taskStats.mine), icon: CheckSquare, color: "#00D4FF" },
        { label: "In Progress", value: String(taskStats.inProgress), icon: Clock3, color: "#7C3AED" },
        { label: "Completed", value: String(taskStats.done), icon: Award, color: "#10B981" },
        { label: "Upcoming Events", value: String(upcomingEvents.length), icon: Calendar, color: "#F59E0B" },
    ];

    return (
        <div className="space-y-6">
            <div className="glass rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-aira-cyan/10 rounded-full blur-3xl pointer-events-none" />
                <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                    Welcome back, <span className="gradient-text-cyan">{session?.user?.name}</span>
                </h1>
                <p className="text-slate-400">Role: <span className="text-aira-cyan">{role.replace("_", " ")}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}20`, color: s.color }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold font-orbitron text-white">{s.value}</p>
                            <p className="text-xs text-slate-400">{s.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass rounded-2xl p-6 border border-white/5">
                    <h2 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2"><CheckSquare size={16} className="text-aira-cyan" /> My Tasks</h2>
                    <div className="space-y-3">
                        {tasks.slice(0, 5).map((task) => (
                            <div key={task.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-center text-sm">
                                <span className="text-slate-300 line-clamp-1">{task.title}</span>
                                <span className={`px-2 py-1 rounded text-xs ${task.status === "DONE" ? "bg-aira-green/20 text-aira-green" : task.status === "IN_PROGRESS" ? "bg-aira-cyan/20 text-aira-cyan" : "bg-slate-500/20 text-slate-300"}`}>
                                    {task.status.replace("_", " ")}
                                </span>
                            </div>
                        ))}
                        {tasks.length === 0 && <p className="text-xs text-slate-500">No tasks assigned yet.</p>}
                        <Link href="/portal/tasks" className="text-xs text-aira-cyan block mt-4 hover:underline">Open tasks board →</Link>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/5">
                    <h2 className="font-orbitron font-bold text-white mb-4 flex items-center gap-2"><Calendar size={16} className="text-aira-magenta" /> Upcoming Events</h2>
                    <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="p-3 rounded-lg bg-white/5 flex justify-between items-center text-sm">
                                <span className="text-slate-300 line-clamp-1">{event.title}</span>
                                <span className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {upcomingEvents.length === 0 && <p className="text-xs text-slate-500">No upcoming events.</p>}
                        <Link href="/portal/events" className="text-xs text-aira-cyan block mt-4 hover:underline">View all events →</Link>
                    </div>
                </div>
            </div>

            {role !== "ADMIN" && (
                <div className="glass rounded-2xl p-6 border border-aira-cyan/20">
                    <h2 className="font-orbitron font-bold text-white mb-4">My Mini Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-aira-cyan/10 border border-aira-cyan/30 p-4">
                            <p className="text-xs text-aira-cyan uppercase">Progress</p>
                            <p className="font-orbitron text-3xl text-white mt-2">{profileStats.progress}%</p>
                            <div className="w-full h-2 rounded bg-white/10 mt-3 overflow-hidden">
                                <div className="h-full bg-aira-cyan" style={{ width: `${profileStats.progress}%` }} />
                            </div>
                        </div>

                        <div className="rounded-xl bg-aira-magenta/10 border border-aira-magenta/30 p-4">
                            <p className="text-xs text-aira-magenta uppercase">Overdue Tasks</p>
                            <p className="font-orbitron text-3xl text-white mt-2">{profileStats.overdue}</p>
                            <p className="text-xs text-slate-400 mt-2">Tasks pending past due date</p>
                        </div>

                        <div className="rounded-xl bg-aira-gold/10 border border-aira-gold/30 p-4">
                            <p className="text-xs text-aira-gold uppercase">Completion Streak</p>
                            <p className="font-orbitron text-3xl text-white mt-2">{profileStats.streak} day{profileStats.streak === 1 ? "" : "s"}</p>
                            <p className="text-xs text-slate-400 mt-2">Consecutive completion days</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
