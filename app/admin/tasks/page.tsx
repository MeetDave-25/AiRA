"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    ListTodo,
    Loader2,
    Plus,
    Trash2,
    RefreshCw,
    Eye,
    Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";

type TaskForm = {
    title: string;
    description: string;
    dueDate: string;
    teamId: string;
    assignedTo: string;
};

const baseForm: TaskForm = {
    title: "",
    description: "",
    dueDate: "",
    teamId: "",
    assignedTo: "",
};

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTeam, setFilterTeam] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<TaskForm>(baseForm);

    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);

    const fetchTasks = async (teamId?: string) => {
        setLoading(true);
        try {
            const url = teamId ? `/api/tasks?teamId=${teamId}` : "/api/tasks";
            const res = await fetch(url);
            const data = await res.json().catch(() => []);
            setTasks(Array.isArray(data) ? data : []);
        } catch {
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetch("/api/teams")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTeams(Array.isArray(d) ? d : []))
            .catch(() => setTeams([]));
    }, []);

    const teamMembers = useMemo(() => {
        if (!form.teamId) return [];
        const team = teams.find((t) => t.id === form.teamId);
        return team?.memberships?.map((m: any) => m.user) || [];
    }, [teams, form.teamId]);

    const mainTasks = tasks.filter((t) => !t.parentTaskId);
    const todo = mainTasks.filter((t) => t.status === "TODO");
    const inProgress = mainTasks.filter((t) => t.status === "IN_PROGRESS");
    const done = mainTasks.filter((t) => t.status === "DONE");

    const updateStatus = async (taskId: string, status: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update");
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
            toast.success("Status updated");
        } catch {
            toast.error("Could not update task status");
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!window.confirm("Delete this task? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            toast.success("Task deleted");
        } catch {
            toast.error("Could not delete task");
        }
    };

    const createTask = async () => {
        if (!form.title.trim() || !form.teamId) {
            toast.error("Title and team are required.");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim(),
                    dueDate: form.dueDate || undefined,
                    teamId: form.teamId,
                    assignedTo: form.assignedTo || undefined,
                    status: "TODO",
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to create task");
            toast.success("Task created");
            setForm(baseForm);
            setIsCreateOpen(false);
            fetchTasks(filterTeam || undefined);
        } catch (error: any) {
            toast.error(error?.message || "Could not create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openUpdates = async (task: any) => {
        setSelectedTask(task);
        try {
            const res = await fetch(`/api/tasks/${task.id}/updates`);
            const data = await res.json().catch(() => []);
            setTaskUpdates(Array.isArray(data) ? data : []);
        } catch {
            setTaskUpdates([]);
        }
    };

    const TaskCard = ({ task }: { task: any }) => (
        <div className="bg-aira-card border border-white/5 p-4 rounded-xl shadow-lg hover:border-aira-cyan/30 transition-all group">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm text-white leading-snug">{task.title}</h4>
                <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20 text-red-400 shrink-0"
                    title="Delete task"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            {task.description && (
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="space-y-1 mb-3">
                <div className="flex justify-between items-end text-xs">
                    <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
                        {task.team?.name || task.Team?.name || "No Team"}
                    </span>
                    {task.dueDate && (
                        <span className="text-aira-magenta text-[11px]">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
                {task.assignedUser && (
                    <div className="text-[11px] text-aira-cyan">
                        Assigned: {task.assignedUser.name}
                    </div>
                )}
            </div>

            <div className="flex gap-1.5 flex-wrap items-center">
                {task.status !== "TODO" && (
                    <button onClick={() => updateStatus(task.id, "TODO")} className="text-[10px] px-2 py-1 rounded bg-slate-500/20 text-slate-300 hover:bg-slate-500/40 transition-colors">
                        To Do
                    </button>
                )}
                {task.status !== "IN_PROGRESS" && (
                    <button onClick={() => updateStatus(task.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/40 transition-colors">
                        In Progress
                    </button>
                )}
                {task.status !== "DONE" && (
                    <button onClick={() => updateStatus(task.id, "DONE")} className="text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/40 transition-colors">
                        Done
                    </button>
                )}
                <button
                    onClick={() => openUpdates(task)}
                    className="ml-auto text-[10px] px-2 py-1 rounded border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10 transition-colors flex items-center gap-1"
                >
                    <Eye size={10} /> Updates
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 glass p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white">Tasks Board</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage and assign tasks across all teams</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={filterTeam}
                            onChange={(e) => {
                                setFilterTeam(e.target.value);
                                fetchTasks(e.target.value || undefined);
                            }}
                            className="text-sm rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-white outline-none focus:border-aira-cyan/60"
                        >
                            <option value="">All Teams</option>
                            {teams.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => fetchTasks(filterTeam || undefined)}
                        className="p-2 rounded-lg border border-white/15 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-aira-cyan text-aira-bg font-semibold rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/20"
                    >
                        <Plus size={16} /> New Task
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "To Do", count: todo.length, color: "text-slate-300", border: "border-slate-600/40" },
                    { label: "In Progress", count: inProgress.length, color: "text-aira-cyan", border: "border-aira-cyan/30" },
                    { label: "Done", count: done.length, color: "text-green-400", border: "border-green-500/30" },
                ].map((s) => (
                    <div key={s.label} className={`glass rounded-xl p-4 border ${s.border} text-center`}>
                        <p className={`text-2xl font-orbitron font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Kanban */}
            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "To Do", items: todo, color: "border-t-slate-500", icon: ListTodo },
                        { label: "In Progress", items: inProgress, color: "border-t-aira-cyan", icon: Loader2 },
                        { label: "Done", items: done, color: "border-t-green-500", icon: CheckCircle2 },
                    ].map((col) => (
                        <div key={col.label} className={`glass rounded-2xl p-4 border-t-4 ${col.color} bg-aira-surface`}>
                            <h3 className="font-orbitron font-bold flex items-center gap-2 mb-4 text-slate-300">
                                <col.icon size={16} />
                                {col.label}
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-1">{col.items.length}</span>
                            </h3>
                            <div className="space-y-3">
                                {col.items.map((task) => <TaskCard key={task.id} task={task} />)}
                                {col.items.length === 0 && (
                                    <p className="text-xs text-slate-600 text-center py-8">No tasks here</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Task Modal */}
            <AnimatedModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Task"
                subtitle="Assign work to team members"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={createTask} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title *</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title..." className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Team *</label>
                            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value, assignedTo: "" })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">
                                <option value="">Select team</option>
                                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Assign To</label>
                            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} disabled={!form.teamId} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 disabled:opacity-40">
                                <option value="">Unassigned</option>
                                {teamMembers.map((member: any) => <option key={member.id} value={member.id}>{member.name} ({member.email})</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                </div>
            </AnimatedModal>

            {/* Task Updates Modal */}
            <AnimatedModal
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                title="Task Updates"
                subtitle={selectedTask ? `Updates for: ${selectedTask.title}` : ""}
                footer={
                    <button onClick={() => setSelectedTask(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Close</button>
                }
            >
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {taskUpdates.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-8">No updates posted yet.</p>
                    ) : (
                        taskUpdates.map((u) => (
                            <div key={u.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                                <div className="flex justify-between gap-2 text-[11px] text-slate-500 mb-1">
                                    <span className="text-aira-cyan font-medium">{u.author?.name || "Unknown"}</span>
                                    <span>{new Date(u.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-200 whitespace-pre-wrap">{u.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </AnimatedModal>
        </div>
    );
}
