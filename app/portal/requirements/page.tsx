"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import toast from "react-hot-toast";

export default function RequirementsPage() {
    const { data: session } = useSession();
    const user: any = session?.user;
    
    const [tasks, setTasks] = useState<any[]>([]);
    
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [updateMessage, setUpdateMessage] = useState("");
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/tasks")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setTasks(Array.isArray(d) ? d : []))
            .catch(() => setTasks([]));
    }, []);

    const requirements = useMemo(
        () => tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS"),
        [tasks]
    );

    const openTaskUpdateModal = async (task: any) => {
        setSelectedTask(task);
        setUpdateMessage("");
        setIsUpdateOpen(true);
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

    const handleTaskUpdate = async () => {
        if (!selectedTask || !updateMessage.trim()) {
            toast.error("Please add an update message");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}/updates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: updateMessage.trim() }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to post update");

            setTaskUpdates((prev) => [data, ...prev]);
            toast.success("Update posted!");
            setUpdateMessage("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to post update");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-2">
                    <ClipboardList size={20} className="text-aira-cyan" /> Requirement Board
                </h1>
                <p className="text-slate-400 text-sm mt-1">Current requirements and deliverables assigned to your scope</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((task) => (
                    <div key={task.id} className="glass p-5 rounded-2xl border border-white/10">
                        <h3 className="text-white font-semibold mb-2">{task.title}</h3>
                        {task.description && <p className="text-sm text-slate-400 mb-3">{task.description}</p>}
                        <div className="text-xs text-slate-500 space-y-1">
                            <p>Team: {task.team?.name || "No Team"}</p>
                            <p>Status: {task.status.replace("_", " ")}</p>
                            {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
                        <div className="mt-4 border-t border-white/5 pt-3">
                            <button
                                onClick={() => openTaskUpdateModal(task)}
                                className="text-xs text-aira-cyan hover:underline flex items-center gap-1"
                            >
                                <MessageSquare size={12} /> {user?.role === "TEAM_LEAD" ? (task.assignedTo ? "View Member Updates" : "Update Admin") : "Update Team Lead"}
                            </button>
                        </div>
                    </div>
                ))}
                {requirements.length === 0 && <p className="text-slate-500 text-sm">No requirements available right now.</p>}
            </div>

            <AnimatedModal
                open={isUpdateOpen}
                onClose={() => {
                    setIsUpdateOpen(false);
                    setSelectedTask(null);
                    setUpdateMessage("");
                }}
                title="Post Task Update"
                subtitle={`Updating: ${selectedTask?.title}`}
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsUpdateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting || !updateMessage.trim()} onClick={handleTaskUpdate} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Posting..." : "Post Update"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    {((user?.role === "TEAM_MEMBER") || (user?.role === "TEAM_LEAD" && !selectedTask?.assignedTo)) && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">
                                {user?.role === "TEAM_MEMBER" ? "Message to Team Lead" : "Message to Admin"}
                            </label>
                            <textarea
                                value={updateMessage}
                                onChange={(e) => setUpdateMessage(e.target.value)}
                                placeholder="Share progress, blockers, or status update..."
                                rows={4}
                                className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 resize-none"
                            />
                        </div>
                    )}
                    
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
