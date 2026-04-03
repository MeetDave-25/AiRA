"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, ListTodo, Loader2, Plus } from "lucide-react";
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

export default function TasksPage() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role || "TEAM_MEMBER";

    const [tasks, setTasks] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState<TaskForm>(baseForm);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
    const [updateMessage, setUpdateMessage] = useState("");
    const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);

    const isAdmin = role === "ADMIN";

    const fetchTasks = () =>
        fetch("/api/tasks")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTasks(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        fetch("/api/teams")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTeams(Array.isArray(d) ? d : []))
            .catch(() => setTeams([]));
    }, [isAdmin]);

    const teamMembers = useMemo(() => {
        if (!form.teamId) return [];
        const team = teams.find((t) => t.id === form.teamId);
        return team?.memberships?.map((m: any) => m.user) || [];
    }, [teams, form.teamId]);

    const todo = tasks.filter((t) => t.status === "TODO");
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
    const done = tasks.filter((t) => t.status === "DONE");

    const updateStatus = async (taskId: string, status: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to update status");
            setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
            toast.success("Task updated");
        } catch (error: any) {
            toast.error(error?.message || "Could not update task");
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
            fetchTasks();
        } catch (error: any) {
            toast.error(error?.message || "Could not create task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openTaskUpdateModal = async (task: any) => {
        setSelectedTask(task);
        setUpdateMessage("");
        try {
            const res = await fetch(`/api/tasks/${task.id}/updates`);
            const data = await res.json().catch(() => []);
            if (!res.ok) throw new Error(data.error || "Failed to load updates");
            setTaskUpdates(Array.isArray(data) ? data : []);
        } catch {
            setTaskUpdates([]);
            toast.error("Could not load task updates");
        }
    };

    const postTaskUpdate = async () => {
        if (!selectedTask) return;
        if (!updateMessage.trim()) {
            toast.error("Please write an update for admin.");
            return;
        }

        setIsUpdateSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}/updates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: updateMessage.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to post update");

            setTaskUpdates((prev) => [data, ...prev]);
            setUpdateMessage("");
            toast.success("Update sent to admin");
        } catch (error: any) {
            toast.error(error?.message || "Could not send update");
        } finally {
            setIsUpdateSubmitting(false);
        }
    };

    const TaskCard = ({ task }: { task: any }) => (
        <div className="bg-aira-card border border-white/5 p-4 rounded-xl shadow-lg hover:border-aira-cyan/30 transition-colors">
            <h4 className="font-medium text-sm text-white mb-2">{task.title}</h4>
            {task.description && <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>}
            <div className="space-y-1">
                <div className="flex justify-between items-end text-xs">
                    <span className="text-slate-500">{task.team?.name || "No Team"}</span>
                    {task.dueDate && <span className="text-aira-magenta">{new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
                {task.assignedUser && (
                    <div className="text-[11px] text-aira-cyan">Assigned: {task.assignedUser.name}</div>
                )}
            </div>

            <div className="flex gap-1.5 mt-3">
                {task.status !== "TODO" && <button onClick={() => updateStatus(task.id, "TODO")} className="text-[10px] px-2 py-1 rounded bg-slate-500/20 text-slate-300">To Do</button>}
                {task.status !== "IN_PROGRESS" && <button onClick={() => updateStatus(task.id, "IN_PROGRESS")} className="text-[10px] px-2 py-1 rounded bg-aira-cyan/20 text-aira-cyan">In Progress</button>}
                {task.status !== "DONE" && <button onClick={() => updateStatus(task.id, "DONE")} className="text-[10px] px-2 py-1 rounded bg-aira-green/20 text-aira-green">Done</button>}
            </div>

            {!isAdmin && (
                <button onClick={() => openTaskUpdateModal(task)} className="mt-2 text-[10px] px-2 py-1 rounded border border-aira-magenta/40 text-aira-magenta hover:bg-aira-magenta/10">
                    Update Admin
                </button>
            )}
        </div>
    );

    return (
        <div className="space-y-6 min-h-screen">
            <div className="flex justify-between items-center glass p-6 rounded-2xl border border-white/5">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white">Tasks Board</h1>
                    <p className="text-slate-400 text-sm">
                        {isAdmin ? "Create and assign tasks to members" : "Your team and assigned tasks"}
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-aira-cyan text-aira-bg font-medium rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/20">
                        <Plus size={16} /> New Task
                    </button>
                )}
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass rounded-2xl p-4 border-t-4 border-t-slate-500 bg-aira-surface">
                        <h3 className="font-orbitron font-bold flex items-center gap-2 mb-4 text-slate-300">
                            <ListTodo size={16} /> To Do <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{todo.length}</span>
                        </h3>
                        <div className="space-y-3">{todo.map((task) => <TaskCard key={task.id} task={task} />)}</div>
                    </div>

                    <div className="glass rounded-2xl p-4 border-t-4 border-t-aira-cyan bg-aira-surface">
                        <h3 className="font-orbitron font-bold flex items-center gap-2 mb-4 text-aira-cyan">
                            <Loader2 size={16} className="animate-spin-slow" /> In Progress <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-300">{inProgress.length}</span>
                        </h3>
                        <div className="space-y-3">{inProgress.map((task) => <TaskCard key={task.id} task={task} />)}</div>
                    </div>

                    <div className="glass rounded-2xl p-4 border-t-4 border-t-aira-green bg-aira-surface">
                        <h3 className="font-orbitron font-bold flex items-center gap-2 mb-4 text-aira-green">
                            <CheckCircle2 size={16} /> Done <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-slate-300">{done.length}</span>
                        </h3>
                        <div className="space-y-3">{done.map((task) => <TaskCard key={task.id} task={task} />)}</div>
                    </div>
                </div>
            )}

            <AnimatedModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Task"
                subtitle="Assign work to team members"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={createTask} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">{isSubmitting ? "Creating..." : "Create Task"}</button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Team</label>
                            <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value, assignedTo: "" })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">
                                <option value="">Select team</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Assign To</label>
                            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">
                                <option value="">Unassigned</option>
                                {teamMembers.map((member: any) => (
                                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                title="Task Updates"
                subtitle={selectedTask ? `Share progress on: ${selectedTask.title}` : ""}
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setSelectedTask(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Close</button>
                        <button disabled={isUpdateSubmitting} onClick={postTaskUpdate} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isUpdateSubmitting ? "Sending..." : "Send Update"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Message to admin</label>
                        <textarea
                            rows={3}
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            placeholder="Share what is completed, blockers, next steps..."
                            className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-magenta/60"
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-slate-400">Recent updates</p>
                        {taskUpdates.map((u) => (
                            <div key={u.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                                <div className="flex justify-between gap-2 text-[11px] text-slate-500 mb-1">
                                    <span>{u.author?.name || "Unknown"}</span>
                                    <span>{new Date(u.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-slate-200 whitespace-pre-wrap">{u.message}</p>
                            </div>
                        ))}
                        {taskUpdates.length === 0 && <p className="text-xs text-slate-500">No updates yet.</p>}
                    </div>
                </div>
            </AnimatedModal>
        </div>
    );
}
