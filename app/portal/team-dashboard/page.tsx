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
    // Derive per-team role from the first team's memberRole (set in auth.ts)
    const teamRole = user?.teams?.[0]?.memberRole || user?.role || "TEAM_MEMBER";

    const [teamData, setTeamData] = useState<any>(null);
    const [teamTasks, setTeamTasks] = useState<any[]>([]);
    const [teamReports, setTeamReports] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [updateMessage, setUpdateMessage] = useState("");
    const [taskUpdates, setTaskUpdates] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportMessage, setReportMessage] = useState("");
    const [memberForm, setMemberForm] = useState({ name: "", email: "", role: "TEAM_MEMBER", password: "" });
    const [newMemberCredentials, setNewMemberCredentials] = useState<{ email: string; password: string } | null>(null);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "" });

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

                // Fetch reports if TEAM_LEAD per team
                if (teamRole === "TEAM_LEAD") {
                    const reportsRes = await fetch(`/api/reports?teamId=${teamId}`);
                    const reports = reportsRes.ok ? await reportsRes.json() : [];
                    setTeamReports(Array.isArray(reports) ? reports : []);
                }
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
            setMemberForm({ name: "", email: "", role: "TEAM_MEMBER", password: "" });

            // Always show credentials — either custom or generated
            setNewMemberCredentials({ email: data.generatedLoginId, password: data.generatedPassword });

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

            toast.success("Report successfully sent!");
            setIsReportOpen(false);
            setReportMessage("");

            if (user.role === "TEAM_LEAD") {
                const reportsRes = await fetch(`/api/reports?teamId=${teamData.id}`);
                const reports = reportsRes.ok ? await reportsRes.json() : [];
                setTeamReports(Array.isArray(reports) ? reports : []);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to send report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateTask = async () => {
        if (!taskForm.title) return toast.error("Title is required");
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...taskForm, teamId: teamData.id }),
            });
            if (!res.ok) throw new Error("Failed to assign requirement");

            toast.success("Requirement assigned!");
            setIsAddTaskOpen(false);
            setTaskForm({ title: "", description: "", assignedTo: "", dueDate: "" });

            const tasksRes = await fetch(`/api/tasks?teamId=${teamData.id}`);
            const tasks = tasksRes.ok ? await tasksRes.json() : [];
            setTeamTasks(Array.isArray(tasks) ? tasks : []);
        } catch (error: any) {
            toast.error(error.message || "Failed to create task");
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

    if (!teamData) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="text-center max-w-sm">
                    <AlertCircle size={48} className="mx-auto text-aira-magenta mb-4 opacity-80" />
                    <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Team Not Found</h2>
                    <p className="text-slate-400 mb-6">It looks like the team data could not be loaded, or you no longer have access. You might need to refresh your session.</p>
                    <button onClick={() => location.reload()} className="px-6 py-2 bg-aira-cyan rounded-lg text-aira-bg font-bold">Refresh Page</button>
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
                    {(user?.role === "TEAM_LEAD" || user?.role === "TEAM_MEMBER") && (
                        <button
                            onClick={() => setIsReportOpen(true)}
                            className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg border border-aira-cyan text-aira-cyan hover:bg-aira-cyan/10 transition-colors"
                        >
                            <FileText size={14} /> {user.role === "TEAM_LEAD" ? "Send Team Report to Admin" : "Send Daily Task Report"}
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
                <div className="flex justify-between items-center">
                    <h2 className="font-orbitron font-bold text-xl text-white">
                        {teamRole === "TEAM_MEMBER" ? "My Assigned Tasks" : "Team Tasks & Requirements"}
                    </h2>
                    {teamRole === "TEAM_LEAD" && (
                        <button
                            onClick={() => setIsAddTaskOpen(true)}
                            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-aira-cyan text-aira-bg font-semibold hover:bg-white transition-colors"
                        >
                            <Plus size={14} /> ✏️ Assign Task to Member
                        </button>
                    )}
                </div>

                {/* For TEAM_MEMBER: only show tasks assigned to them */}
                {teamRole === "TEAM_MEMBER" && (
                    <div className="glass rounded-xl border border-aira-cyan/20 p-4">
                        <p className="text-xs text-slate-400 mb-3">Tasks assigned directly to you — post updates to your Team Lead using the button on each card.</p>
                        <div className="space-y-3">
                            {teamTasks.filter(t => t.isAssignedToMe || t.assignedUser?.id === user?.id).length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-6">No tasks assigned to you yet. Check with your Team Lead.</p>
                            )}
                            {teamTasks
                                .filter(t => t.isAssignedToMe || t.assignedUser?.id === user?.id)
                                .map((task) => (
                                    <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-aira-cyan/30 transition"
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <p className="font-semibold text-sm text-white flex-1">{task.title}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${task.status === "DONE" ? "text-aira-green border-aira-green/30 bg-aira-green/10" :
                                                    task.status === "IN_PROGRESS" ? "text-aira-cyan border-aira-cyan/30 bg-aira-cyan/10" :
                                                        "text-slate-400 border-white/10 bg-white/5"
                                                }`}>{task.status.replace("_", " ")}</span>
                                        </div>
                                        {task.description && <p className="text-xs text-slate-400 mb-3">{task.description}</p>}
                                        {task.dueDate && <p className="text-[11px] text-aira-magenta mb-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                                        <div className="flex gap-2">
                                            {task.status !== "IN_PROGRESS" && task.status !== "DONE" && (
                                                <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")} className="text-xs px-3 py-1.5 rounded-lg bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/30 transition">▶ Start</button>
                                            )}
                                            {task.status === "IN_PROGRESS" && (
                                                <button onClick={() => updateTaskStatus(task.id, "DONE")} className="text-xs px-3 py-1.5 rounded-lg bg-aira-green/20 text-aira-green hover:bg-aira-green/30 transition">✓ Mark Done</button>
                                            )}
                                            <button
                                                onClick={() => openTaskUpdateModal(task)}
                                                className="text-xs px-3 py-1.5 rounded-lg border border-aira-magenta/40 text-aira-magenta hover:bg-aira-magenta/10 flex items-center gap-1 transition"
                                            >
                                                <MessageSquare size={12} /> Send Update to Lead
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                )}

                {/* For TEAM_LEAD: full board view with member updates */}
                {teamRole === "TEAM_LEAD" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* To Do */}
                        <div className="glass rounded-xl border border-white/5 p-4">
                            <h3 className="text-sm font-semibold text-aira-cyan mb-3 flex items-center gap-2">
                                <AlertCircle size={14} /> To Do ({taskStats.todo})
                            </h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {teamTasks.filter((t) => t.status === "TODO").map((task) => (
                                    <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-aira-cyan/30 group cursor-pointer transition"
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className="font-medium text-sm text-white flex-1">{task.title}</p>
                                            <button onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                                                className="text-xs px-2 py-1 rounded bg-aira-cyan/20 text-aira-cyan hover:bg-aira-cyan/30 opacity-0 group-hover:opacity-100 transition"
                                            >Start</button>
                                        </div>
                                        {task.assignedUser
                                            ? <p className="text-[10px] text-aira-purple mb-1">👤 {task.assignedUser.name}</p>
                                            : <p className="text-[10px] text-slate-500 mb-1">Unassigned</p>}
                                        {task.description && <p className="text-xs text-slate-400 mb-2">{task.description}</p>}
                                        <button onClick={() => openTaskUpdateModal(task)}
                                            className="text-xs text-aira-cyan hover:underline flex items-center gap-1">
                                            <MessageSquare size={12} /> {task.assignedUser ? "View Member Updates" : "Update Admin"}
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
                                {teamTasks.filter((t) => t.status === "IN_PROGRESS").map((task) => (
                                    <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-lg bg-slate-900/50 border border-white/5 hover:border-aira-purple/30 group cursor-pointer transition"
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className="font-medium text-sm text-white flex-1">{task.title}</p>
                                            <button onClick={() => updateTaskStatus(task.id, "DONE")}
                                                className="text-xs px-2 py-1 rounded bg-aira-green/20 text-aira-green hover:bg-aira-green/30 opacity-0 group-hover:opacity-100 transition"
                                            >Done</button>
                                        </div>
                                        {task.assignedUser
                                            ? <p className="text-[10px] text-aira-purple mb-1">👤 {task.assignedUser.name}</p>
                                            : <p className="text-[10px] text-slate-500 mb-1">Unassigned</p>}
                                        {task.description && <p className="text-xs text-slate-400 mb-2">{task.description}</p>}
                                        <button onClick={() => openTaskUpdateModal(task)}
                                            className="text-xs text-aira-cyan hover:underline flex items-center gap-1">
                                            <MessageSquare size={12} /> {task.assignedUser ? "View Member Updates" : "Update Admin"}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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

            {/* Daily Reports for Team Lead */}
            {user?.role === "TEAM_LEAD" && (
                <div className="glass rounded-xl border border-white/5 p-6">
                    <h2 className="font-orbitron font-bold text-lg text-white mb-4 flex items-center gap-2">
                        <FileText size={18} /> Daily Reports from Members
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {teamReports.length === 0 ? (
                            <p className="text-sm text-slate-400">No daily reports submitted yet.</p>
                        ) : (
                            teamReports.map((report) => (
                                <div key={report.id} className="p-3 bg-slate-900/50 rounded border border-white/5">
                                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                        <span className="font-bold text-aira-cyan">{report.author?.name}</span>
                                        <span>{new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-sm text-white whitespace-pre-wrap">{report.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

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
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                    {(teamRole === "TEAM_MEMBER" || teamRole === "TEAM_LEAD") && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-2">
                                {teamRole === "TEAM_MEMBER" ? "📨 Message to Team Lead" : "📨 Message to Admin"}
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
                            placeholder="e.g. Ravi Sharma"
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Email (Optional)</label>
                        <input
                            type="email"
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            placeholder="leave blank to auto-generate"
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Leave blank to auto-generate a @airalab.local login ID</p>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Password</label>
                        <input
                            type="text"
                            value={memberForm.password}
                            onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                            placeholder="e.g. aira@1234 (leave blank to auto-generate)"
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white font-mono"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Leave blank to auto-generate a secure password</p>
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

            {/* Add Task/Requirement Modal */}
            <AnimatedModal
                open={isAddTaskOpen}
                onClose={() => setIsAddTaskOpen(false)}
                title="Assign Requirement"
                subtitle="Create a new task or requirement for your team"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAddTaskOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleCreateTask} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold">
                            {isSubmitting ? "Assigning..." : "Assign Requirement"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Task Title</label>
                        <input
                            type="text"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                            placeholder="e.g. Update UI Components"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Description</label>
                        <textarea
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white h-24 resize-none"
                            placeholder="Details about the requirement..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Assign To (Optional)</label>
                            <select
                                value={taskForm.assignedTo}
                                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                            >
                                <option value="">Unassigned (Open for team)</option>
                                {teamMembers.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.role.replace("_", " ")})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Due Date (Optional)</label>
                            <input
                                type="date"
                                value={taskForm.dueDate}
                                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                className="w-full bg-slate-900 rounded border border-white/10 px-3 py-2 text-white"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>
                    </div>
                </div>
            </AnimatedModal>

            {/* Credentials Modal */}
            <AnimatedModal
                open={!!newMemberCredentials}
                onClose={() => setNewMemberCredentials(null)}
                title="Member Added Successfully!"
                subtitle="Please copy these credentials immediately and send them to the team member. They will not be shown again."
                footer={
                    <div className="flex justify-end pr-2 pl-2 w-full">
                        <button onClick={() => setNewMemberCredentials(null)} className="px-6 py-2 rounded-lg bg-aira-cyan text-aira-bg font-bold w-full">
                            I have copied the credentials
                        </button>
                    </div>
                }
            >
                {newMemberCredentials && (
                    <div className="space-y-4">
                        <div className="bg-slate-900 rounded border border-aira-cyan/30 p-4">
                            <label className="text-xs text-slate-400 mb-1 block">Login Email / ID</label>
                            <div className="text-white font-mono bg-black/40 p-2 rounded selectable bg-slate-800 break-all mb-3 select-all">
                                {newMemberCredentials.email}
                            </div>

                            <label className="text-xs text-slate-400 mb-1 block">Generated Password</label>
                            <div className="text-aira-cyan font-mono font-bold bg-black/40 p-2 rounded selectable bg-slate-800 select-all">
                                {newMemberCredentials.password}
                            </div>
                        </div>
                        <p className="text-xs text-aira-magenta">Keep this password secure. The team member will use this to sign in via the Portal Login.</p>
                    </div>
                )}
            </AnimatedModal>
        </div>
    );
}
