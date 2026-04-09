"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Shield, User, Users } from "lucide-react";
import toast from "react-hot-toast";
import { motion, useReducedMotion } from "framer-motion";
import AnimatedModal from "@/components/ui/AnimatedModal";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
};

export default function TeamsAdminPage() {
    const shouldReduceMotion = useReducedMotion();
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const [memberTeamId, setMemberTeamId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newLoginId, setNewLoginId] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [teamForm, setTeamForm] = useState({ name: "", description: "", color: "#00D4FF" });
    const [memberForm, setMemberForm] = useState({ name: "", email: "", role: "TEAM_MEMBER" });

    const fetchTeams = useCallback(async (showErrorToast = false) => {
        setIsLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);

        try {
            const res = await fetch("/api/teams", { signal: controller.signal });
            const data = res.ok ? await res.json() : [];
            setTeams(Array.isArray(data) ? data : []);
            if (!res.ok && showErrorToast) {
                toast.error("Could not load teams right now.");
            }
        } catch {
            setTeams([]);
            if (showErrorToast) {
                toast.error("Teams request timed out. Please retry.");
            }
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void fetchTeams(false); }, [fetchTeams]);

    const openCreateTeamModal = () => {
        setTeamForm({ name: "", description: "", color: "#00D4FF" });
        setIsCreateOpen(true);
    };

    const handleCreateTeam = async () => {
        if (!teamForm.name.trim()) {
            toast.error("Team name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: teamForm.name.trim(),
                    description: teamForm.description.trim(),
                    color: teamForm.color,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create team");
            }

            toast.success("Team created!");
            setIsCreateOpen(false);
            await fetchTeams();
        } catch (error: any) {
            toast.error(error?.message || "Could not create team");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete team");
            }

            toast.success("Team deleted!");
            setDeleteTeamId(null);
            await fetchTeams();
        } catch (error: any) {
            toast.error(error?.message || "Could not delete team");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeamMember = async (teamId: string, userId: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove member");
            toast.success("Member removed!");
            await fetchTeams();
        } catch (error: any) {
            toast.error(error.message || "Could not remove member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAddMemberModal = (teamId: string) => {
        setMemberTeamId(teamId);
        setMemberForm({ name: "", email: "", role: "TEAM_MEMBER" });
        setNewLoginId("");
        setNewPassword("");
    };

    const handleAddMember = async () => {
        if (!memberTeamId) return;
        if (!memberForm.name.trim()) {
            toast.error("Name is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/teams/${memberTeamId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: memberForm.name.trim(),
                    email: memberForm.email.trim(),
                    role: memberForm.role,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setNewLoginId(data.generatedLoginId || data.user?.email || "");
                setNewPassword(data.generatedPassword || "");
                toast.success("Member added!");
                await fetchTeams();
            } else {
                toast.error(data.error || "Failed");
            }
        } catch {
            toast.error("Error adding member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const memberCount = teams.reduce((total, team) => total + (team.memberships?.length || 0), 0);

    return (
        <motion.div
            className="space-y-6 relative"
            variants={containerVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
        >
            <div className="absolute -top-8 -right-10 w-56 h-56 bg-aira-purple/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-14 -left-12 w-52 h-52 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 glass p-4 md:p-6 rounded-2xl border border-white/5 animated-border">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">Teams & Users</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage access across AIRA Labs</p>
                    <div className="flex gap-2 mt-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full border border-aira-purple/30 bg-aira-purple/10 text-violet-300 font-medium">
                            Teams: {teams.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-aira-cyan/30 bg-aira-cyan/10 text-aira-cyan font-medium">
                            Members: {memberCount}
                        </span>
                    </div>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <button
                        onClick={() => void fetchTeams(true)}
                        className="flex-1 md:flex-none px-4 py-2 border border-aira-cyan/30 text-aira-cyan rounded-lg text-sm hover:bg-aira-cyan/10"
                    >
                        Refresh
                    </button>
                    <button onClick={openCreateTeamModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-aira-purple text-white font-semibold rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-purple/30 min-h-[42px]">
                        <Plus size={16} /> Create Team
                    </button>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading && (
                    <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6 text-center">
                        <p className="text-slate-300">Loading teams and members...</p>
                    </div>
                )}

                {!isLoading && teams.length === 0 && (
                    <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6 text-center space-y-3">
                        <p className="text-slate-300">No teams available or server is temporarily unavailable.</p>
                        <button onClick={() => void fetchTeams(true)} className="px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10">
                            Retry
                        </button>
                    </div>
                )}

                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        className="glass rounded-2xl border border-white/5 overflow-hidden card-3d"
                        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 14 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.03 }}
                    >
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center" style={{ borderLeft: `4px solid ${team.color}` }}>
                            <div>
                                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                    <Users size={16} style={{ color: team.color }} />
                                    {team.name}
                                </h3>
                                <p className="text-xs text-slate-400">{team.description || "No description"}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openAddMemberModal(team.id)} className="p-1.5 glass rounded text-aira-cyan hover:bg-aira-cyan/20" title="Add Member"><User size={14} /></button>
                                <button onClick={() => setDeleteTeamId(team.id)} className="p-1.5 glass rounded text-aira-magenta hover:bg-aira-magenta/20"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-xs font-orbitron text-slate-500 mb-3 uppercase">Members</p>
                            <div className="space-y-2">
                                {team.memberships?.map((m: any, memberIndex: number) => (
                                    <motion.div
                                        key={m.id}
                                        className="flex justify-between items-center p-2 rounded bg-white/5 text-sm"
                                        initial={shouldReduceMotion ? undefined : { opacity: 0, x: -6 }}
                                        animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                                        transition={shouldReduceMotion ? { duration: 0 } : { delay: memberIndex * 0.02 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold">{m.user.name[0]}</div>
                                            <span className="text-slate-300">{m.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            {m.user.role === "ADMIN" && <Shield size={12} className="text-aira-magenta" />}
                                            <span className="text-slate-500">{m.user.role.replace("_", " ")}</span>
                                            {m.user.role !== "ADMIN" && (
                                                <button
                                                    onClick={() => handleDeleteTeamMember(team.id, m.user.id)}
                                                    className="ml-2 p-1 text-aira-magenta hover:bg-aira-magenta/20 rounded"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {(!team.memberships || team.memberships.length === 0) && (
                                    <p className="text-xs text-slate-500 text-center py-2">No members</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <AnimatedModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Team"
                subtitle="Build a new team space"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleCreateTeam} className="px-4 py-2 rounded-lg bg-aira-purple text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Creating..." : "Create Team"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Team name</label>
                        <input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea value={teamForm.description} onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} rows={3} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Color</label>
                        <input type="color" value={teamForm.color} onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })} className="h-11 w-full rounded-xl border border-white/15 bg-slate-900 px-2 py-2" />
                    </div>
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!memberTeamId}
                onClose={() => {
                    setMemberTeamId(null);
                    setNewLoginId("");
                    setNewPassword("");
                }}
                title="Add Team Member"
                subtitle="Login ID and password will be generated"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => {
                            setMemberTeamId(null);
                            setNewLoginId("");
                            setNewPassword("");
                        }} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Close</button>
                        <button disabled={isSubmitting || !!newPassword} onClick={handleAddMember} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Name</label>
                        <input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Email (optional)</label>
                        <input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        <p className="text-[11px] text-slate-500 mt-1">If left blank, login ID is auto-generated.</p>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Role</label>
                        <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">
                            <option value="TEAM_MEMBER">TEAM_MEMBER</option>
                            <option value="TEAM_LEAD">TEAM_LEAD</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    {newPassword && (
                        <div className="rounded-xl border border-aira-gold/30 bg-aira-gold/10 p-3">
                            <p className="text-xs text-aira-gold mb-2">Generated credentials (shown once)</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400 w-16">Login ID</span>
                                    <code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200">{newLoginId}</code>
                                    <button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(newLoginId);
                                            toast.success("Login ID copied");
                                        }}
                                        className="px-2.5 py-1.5 text-xs rounded-md border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400 w-16">Password</span>
                                    <code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200">{newPassword}</code>
                                    <button
                                        onClick={async () => {
                                            await navigator.clipboard.writeText(newPassword);
                                            toast.success("Password copied");
                                        }}
                                        className="px-2.5 py-1.5 text-xs rounded-md border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(`Login ID: ${newLoginId}\nPassword: ${newPassword}`);
                                        toast.success("Credentials copied");
                                    }}
                                    className="w-full px-3 py-2 text-xs rounded-md border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                >
                                    Copy Both
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!deleteTeamId}
                onClose={() => setDeleteTeamId(null)}
                title="Delete Team"
                subtitle="Related memberships and tasks will also be removed"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteTeamId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting || !deleteTeamId} onClick={() => deleteTeamId && handleDeleteTeam(deleteTeamId)} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Deleting..." : "Delete Team"}
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-300">Are you sure you want to permanently delete this team?</p>
            </AnimatedModal>
        </motion.div>
    );
}
