"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle2, Clock3, AlertCircle, Plus, MessageSquare, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AnimatedModal from "@/components/ui/AnimatedModal";

type TeamTaskUpdate = {
    taskId: string;
    message: string;
};

export default function TeamDashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    const [teamData, setTeamData] = useState<any>(null);
    const [teamTasks, setTeamTasks] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [updateMessage, setUpdateMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState("");
    const [memberForm, setMemberForm] = useState({ name: "", email: "", role: "TEAM_MEMBER" });

    // Fetch team data on mount
    useEffect(() => {
        if (!user?.teams || user.teams.length === 0) {
            toast.error("You are not part of any team");
            router.push("/portal/dashboard");
            return;
        }

        const loadTeamData = async () => {
            try {
                const teamId = user.teams[0].id;

                // Fetch team details
                const teamRes = await fetch(`/api/teams?teamId=${teamId}`);
                const teams = teamRes.ok ? await teamRes.json() : [];
                const team = teams.find((t: any) => t.id === teamId);
                setTeamData(team);

                // Fetch team members
                if (team?.memberships) {
                    setTeamMembers(team.memberships.map((m: any) => m.user));
                }

                // Fetch team-specific tasks
                const tasksRes = await fetch(`/api/tasks?teamId=${teamId}`);
                const tasks = tasksRes.ok ? await tasksRes.json() : [];
                setTeamTasks(Array.isArray(tasks) ? tasks : []);
            } catch (error) {
                console.error("Error loading team data:", error);
                toast.error("Failed to load team data");
            } finally {
                setLoading(false);
            }
        };

        loadTeamData();
    }, [user, router]);

    const taskStats = useMemo(() => {
        return {
            total: teamTasks.length,
            todo: teamTasks.filter((t) => t.status === "TODO").length,
            inProgress: teamTasks.filter((t) => t.status === "IN_PROGRESS").length,
            completed: teamTasks.filter((t) => t.status === "DONE").length,
        };
    }, [teamTasks]);

    const handleTaskUpdate = async () => {
        if (!selectedTask || !updateMessage.trim()) {
            toast.error("Please add an update message");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/task-updates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: selectedTask.id,
                    message: updateMessage.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to post update");

            toast.success("Update posted!");
            setUpdateMessage("");
            setIsUpdateOpen(false);

            // Refresh tasks
            const tasksRes = await fetch(`/api/tasks?teamId=${teamData.id}`);
            const tasks = tasksRes.ok ? await tasksRes.json() : [];
            setTeamTasks(Array.isArray(tasks) ? tasks : []);
        } catch (error: any) {
            toast.error(error?.message || "Failed to post update");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateTaskStatus = async (taskId: string, status: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update");

            setTeamTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status } : t))
            );
            toast.success("Task status updated");
        } catch (error: any) {
            toast.error(error?.message || "Failed to update task");
        }
    };

    const handleAddMember = async () => {
        if (!memberForm.name) return toast.error("Name is required");
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/teams/${teamData.id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(memberForm),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add member");

            toast.success("Member added!");
            setIsAddMemberOpen(false);
            setMemberForm({ name: "", email: "", role: "TEAM_MEMBER" });

            const teamRes = await fetch(`/api/teams?teamId=${teamData.id}`);
            const teams = teamRes.ok ? await teamRes.json() : [];
            const currTeam = teams.find((t: any) => t.id === teamData.id);
            if (currTeam?.memberships) setTeamMembers(currTeam.memberships.map((m: any) => m.user));
        } catch (error: any) {
            toast.error(error.message || "Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = async (userId: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/teams/${teamData.id}/members/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove member");
            toast.success("Member removed!");
            setTeamMembers(prev => prev.filter(m => m.id !== userId));
        } catch (error: any) {
            toast.error(error.message || "Could not remove member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendReport = async () => {
        if (!reportMessage.trim()) return toast.error("Report message is required");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId: teamData.id, content: reportMessage.trim() }),
            });
            if (!res.ok) throw new Error("Failed to send report");

            toast.success("Report successfully sent to Admin!");
            setIsReportOpen(false);
            setReportMessage("");
        } catch (error: any) {
            toast.error(error.message || "Failed to send report");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-aira-cyan/30 border-t-aira-cyan rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading team data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Team Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 border border-white/5"
                style={{
                    borderLeft: `4px solid ${teamData?.color || "#00D4FF"}`,
                }}
            >
                <div className="flex justify-between items-start mb-2">
                    <h1 className="font-orbitron font-bold text-3xl text-white">
                        {teamData?.name}
                    </h1>
                    {user?.role === "TEAM_LEAD" && (
                        <button
                            onClick={() => setIsReportOpen(true)}
                            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-aira-cyan text-aira-cyan hover:bg-aira-cyan/10 transition-colors"
                        >
                            <FileText size={14} /> Send Team Report
                        </button>
                    )}
                </div>
                <p className="text-slate-400 mb-4">{teamData?.description}</p>
                <div className="flex gap-4 text-sm">
                    <span className="px-3 py-1 rounded-full border border-white/10 text-slate-300">
                        <Users size={14} className="inline mr-1" />
                        {teamMembers.length} Members
                    </span>
                    <span className="px-3 py-1 rounded-full border border-white/10 text-slate-300">
                        {taskStats.total} Tasks
                    </span>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: taskStats.total, color: "#00D4FF", icon: CheckCircle2 },
                    { label: "To Do", value: taskStats.todo, color: "#F59E0B", icon: AlertCircle },
                    { label: "In Progress", value: taskStats.inProgress, color: "#7C3AED", icon: Clock3 },
                    { label: "Completed", value: taskStats.completed, color: "#10B981", icon: CheckCircle2 },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-4 rounded-xl border border-white/5 flex items-center gap-3"
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: `${stat.color}20`, color: stat.color }}
                            >
                                <Icon size={16} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-slate-400">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
                <h2 className="font-orbitron font-bold text-xl text-white">Team Tasks</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* To Do */}
                    <div className="glass rounded-xl border border-white/5 p-4">
                        <h3 className="text-sm font-semibold text-aira-cyan mb-3 flex items-center gap-2">
                            <AlertCircle size={14} /> To Do ({taskStats.todo})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {teamTasks
                                .filter((t) => t.status === "TODO")
                                .map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-aira-cyan/30 group cursor-pointer transition"
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <p className="font-medium text-sm text-white flex-1">{task.title}</p>
                                            <button
                                                onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                                                className="text-xs px-2 py-1 rounded bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/30 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                Start
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                                        <button
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setIsUpdateOpen(true);
                                            }}
                                            className="text-xs text-aira-cyan hover:underline flex items-center gap-1"
                                        >
                                            <MessageSquare size={12} /> Add Update
                                        </button>
                                    </motion.div>
                                ))}
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="glass rounded-xl border border-white/5 p-4">
                        <h3 className="text-sm font-semibold text-aira-purple mb-3 flex items-center gap-2">
                            <Clock3 size={14} /> In Progress ({taskStats.inProgress})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {teamTasks
                                .filter((t) => t.status === "IN_PROGRESS")
                                .map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-aira-purple/30 group cursor-pointer transition"
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <p className="font-medium text-sm text-white flex-1">{task.title}</p>
                                            <button
                                                onClick={() => updateTaskStatus(task.id, "DONE")}
                                                className="text-xs px-2 py-1 rounded bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/30 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                Complete
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                                        <button
                                            onClick={() => {
                                                setSelectedTask(task);
                                                setIsUpdateOpen(true);
                                            }}
                                            className="text-xs text-aira-cyan hover:underline flex items-center gap-1"
                                        >
                                            <MessageSquare size={12} /> Add Update
                                        </button>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Completed */}
                <div className="glass rounded-xl border border-white/5 p-4">
                    <h3 className="text-sm font-semibold text-aira-gold mb-3 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Completed ({taskStats.completed})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                        {teamTasks
                            .filter((t) => t.status === "DONE")
                            .map((task) => (
                                <div
                                    key={task.id}
                                    className="p-2 rounded-lg bg-slate-900/50 border border-white/5 text-xs text-slate-300 line-through"
                                    title={task.title}
                                >
                                    {task.title.substring(0, 20)}...
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Team Members */}
            <div className="glass rounded-xl border border-white/5 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                        <Users size={18} /> Team Members
                    </h2>
                    {user?.role === "TEAM_LEAD" && (
                        <button
                            onClick={() => setIsAddMemberOpen(true)}
                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-aira-cyan text-aira-bg font-semibold hover:bg-white transition-colors"
                        >
                            <Plus size={14} /> Add Member
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teamMembers.map((member) => (
                        <div key={member.id} className="p-3 rounded-lg bg-slate-900/50 border border-white/5 flex justify-between items-center group">
                            <div>
                                <p className="font-medium text-white">{member.name}</p>
                                <p className="text-xs text-slate-400 mb-2">{member.email}</p>
                                <span className="inline-block text-xs px-2 py-1 rounded bg-aira-cyan/10 text-aira-cyan">
                                    {member.role.replace("_", " ")}
                                </span>
                            </div>
                            {user?.role === "TEAM_LEAD" && member.id !== user.id && (
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-1.5 text-aira-magenta rounded hover:bg-aira-magenta/20 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove Member"
                                >
                                    <AlertCircle size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Update Task Modal */}
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
                        <button
                            onClick={() => {
                                setIsUpdateOpen(false);
                                setSelectedTask(null);
                                setUpdateMessage("");
                            }}
                            className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isSubmitting || !updateMessage.trim()}
                            onClick={handleTaskUpdate}
                            className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60"
                        >
                            {isSubmitting ? "Posting..." : "Post Update"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-2">Update Message</label>
                        <textarea
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            placeholder="Share progress, blockers, or status update..."
                            rows={4}
                            className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 resize-none"
                        />
                    </div>
                </div>
            </AnimatedModal>

            {/* Add Member Modal */}
            <AnimatedModal
                open={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                title="Add Team Member"
                subtitle="Create a new internal profile to join the portal"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAddMemberOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleAddMember} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold">
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                        <input
                            type="text"
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Email (Optional)</label>
                        <input
                            type="email"
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Leave blank to auto-generate a @airalab.local login ID</p>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Role</label>
                        <select
                            value={memberForm.role}
                            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                        >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="TEAM_LEAD">Team Lead</option>
                        </select>
                    </div>
                </div>
            </AnimatedModal>
        </div>
    );
}
