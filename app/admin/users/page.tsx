"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Shield, User, Key, Copy, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AnimatedModal from "@/components/ui/AnimatedModal";

const ROLES = ["TEAM_MEMBER", "TEAM_LEAD", "ADMIN"];

const roleColor: Record<string, string> = {
    ADMIN: "text-aira-magenta border-aira-magenta/30 bg-aira-magenta/10",
    TEAM_LEAD: "text-aira-gold border-aira-gold/30 bg-aira-gold/10",
    TEAM_MEMBER: "text-aira-cyan border-aira-cyan/30 bg-aira-cyan/10",
};

type SysUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<SysUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", email: "", role: "TEAM_MEMBER", password: "" });
    const [createdCreds, setCreatedCreds] = useState<{ loginId: string; password: string } | null>(null);
    const [showCreatePw, setShowCreatePw] = useState(false);

    // Edit modal
    const [editing, setEditing] = useState<SysUser | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "TEAM_MEMBER", newPassword: "" });
    const [showEditPw, setShowEditPw] = useState(false);

    // Delete modal
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = useCallback(async (showErr = false) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = res.ok ? await res.json() : [];
            setUsers(Array.isArray(data) ? data : []);
            if (!res.ok && showErr) toast.error("Could not load users.");
        } catch {
            setUsers([]);
            if (showErr) toast.error("Failed to fetch users.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { void fetchUsers(false); }, [fetchUsers]);

    // ------------ Create user ----------------
    const openCreate = () => {
        setCreateForm({ name: "", email: "", role: "TEAM_MEMBER", password: "" });
        setCreatedCreds(null);
        setShowCreatePw(false);
        setIsCreateOpen(true);
    };

    const handleCreate = async () => {
        if (!createForm.name.trim()) { toast.error("Name is required."); return; }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: createForm.name.trim(),
                    email: createForm.email.trim() || undefined,
                    role: createForm.role,
                    password: createForm.password.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create user");
            setCreatedCreds({ loginId: data.generatedLoginId, password: data.generatedPassword });
            toast.success("User created!");
            await fetchUsers();
        } catch (e: any) {
            toast.error(e?.message || "Could not create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ------------ Edit user ----------------
    const openEdit = (u: SysUser) => {
        setEditing(u);
        setEditForm({ name: u.name, email: u.email, role: u.role, newPassword: "" });
        setShowEditPw(false);
    };

    const handleEdit = async () => {
        if (!editing) return;
        if (!editForm.name.trim()) { toast.error("Name is required."); return; }
        setIsSubmitting(true);
        try {
            const payload: Record<string, any> = {
                name: editForm.name.trim(),
                email: editForm.email.trim() || undefined,
                role: editForm.role,
            };
            if (editForm.newPassword.trim()) payload.password = editForm.newPassword.trim();

            const res = await fetch(`/api/users/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");
            toast.success("User updated!");
            setEditing(null);
            await fetchUsers();
        } catch (e: any) {
            toast.error(e?.message || "Could not update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ------------ Delete user ----------------
    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed to delete"); }
            toast.success("User deleted.");
            setDeleteId(null);
            await fetchUsers();
        } catch (e: any) {
            toast.error(e?.message || "Could not delete user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyText = async (text: string, label: string) => {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-8 -right-10 w-56 h-56 bg-aira-purple/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-14 -left-12 w-52 h-52 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 glass p-4 md:p-6 rounded-2xl border border-white/5 animated-border">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">System Users</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage all user accounts and credentials</p>
                    <div className="flex gap-2 mt-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full border border-aira-purple/30 bg-aira-purple/10 text-violet-300 font-medium">
                            Total: {users.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-aira-magenta/30 bg-aira-magenta/10 text-aira-magenta font-medium">
                            Admins: {users.filter(u => u.role === "ADMIN").length}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-aira-cyan/30 bg-aira-cyan/10 text-aira-cyan font-medium">
                            Members: {users.filter(u => u.role !== "ADMIN").length}
                        </span>
                    </div>
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <button onClick={() => void fetchUsers(true)} className="flex-1 md:flex-none px-4 py-2 border border-aira-cyan/30 text-aira-cyan rounded-lg text-sm hover:bg-aira-cyan/10">
                        Refresh
                    </button>
                    <button onClick={openCreate} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-aira-purple text-white font-semibold rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-purple/30">
                        <Plus size={16} /> Add User
                    </button>
                </div>
            </motion.div>

            {/* User List */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading && (
                    <div className="md:col-span-2 xl:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center">
                        <p className="text-slate-300">Loading users...</p>
                    </div>
                )}
                {!isLoading && users.length === 0 && (
                    <div className="md:col-span-2 xl:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center space-y-3">
                        <p className="text-slate-300">No users found.</p>
                        <button onClick={() => void fetchUsers(true)} className="px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10">Retry</button>
                    </div>
                )}
                {users.map((u, idx) => (
                    <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="glass rounded-2xl border border-white/5 p-4 flex flex-col gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                                {u.name[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-white font-semibold text-sm truncate">{u.name}</p>
                                <p className="text-slate-400 text-xs truncate">{u.email}</p>
                            </div>
                            {u.role === "ADMIN" && <Shield size={14} className="text-aira-magenta flex-shrink-0" />}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleColor[u.role] || roleColor.TEAM_MEMBER}`}>
                                {u.role.replace("_", " ")}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(u)} className="p-1.5 glass rounded text-aira-cyan hover:bg-aira-cyan/20" title="Edit / Reset Password">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => setDeleteId(u.id)} className="p-1.5 glass rounded text-aira-magenta hover:bg-aira-magenta/20" title="Delete User">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-600">Added {new Date(u.createdAt).toLocaleDateString()}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ---- Create User Modal ---- */}
            <AnimatedModal
                open={isCreateOpen}
                onClose={() => { setIsCreateOpen(false); setCreatedCreds(null); }}
                title="Add System User"
                subtitle="Create a user account — assign to teams later"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => { setIsCreateOpen(false); setCreatedCreds(null); }} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Close</button>
                        {!createdCreds && (
                            <button disabled={isSubmitting} onClick={handleCreate} className="px-4 py-2 rounded-lg bg-aira-purple text-white font-semibold disabled:opacity-60">
                                {isSubmitting ? "Creating..." : "Create User"}
                            </button>
                        )}
                    </div>
                }
            >
                <div className="space-y-4">
                    {!createdCreds ? (
                        <>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                                <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" placeholder="e.g. Jane Doe" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Email / Login ID</label>
                                <input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" placeholder="Leave blank to auto-generate" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Role</label>
                                <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60">
                                    {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Password</label>
                                <div className="relative">
                                    <input type={showCreatePw ? "text" : "password"} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 pr-10 text-white outline-none focus:border-aira-purple/60" placeholder="Leave blank to auto-generate" />
                                    <button type="button" onClick={() => setShowCreatePw(!showCreatePw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {showCreatePw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">Leave blank to auto-generate a secure password.</p>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-xl border border-aira-gold/30 bg-aira-gold/10 p-4 space-y-3">
                            <p className="text-sm text-aira-gold font-semibold flex items-center gap-2"><Key size={14} /> Credentials generated (shown once)</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 w-20">Login ID</span>
                                <code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200 truncate">{createdCreds.loginId}</code>
                                <button onClick={() => copyText(createdCreds.loginId, "Login ID")} className="p-1.5 rounded border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"><Copy size={13} /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 w-20">Password</span>
                                <code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200 truncate">{createdCreds.password}</code>
                                <button onClick={() => copyText(createdCreds.password, "Password")} className="p-1.5 rounded border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"><Copy size={13} /></button>
                            </div>
                            <button onClick={() => copyText(`Login ID: ${createdCreds.loginId}\nPassword: ${createdCreds.password}`, "Credentials")} className="w-full px-3 py-2 text-xs rounded-md border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10">
                                Copy Both
                            </button>
                        </div>
                    )}
                </div>
            </AnimatedModal>

            {/* ---- Edit User Modal ---- */}
            <AnimatedModal
                open={!!editing}
                onClose={() => setEditing(null)}
                title="Edit User"
                subtitle="Update credentials or role"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleEdit} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                        <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Email / Login ID</label>
                        <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Role</label>
                        <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">
                            {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1"><Key size={11} /> New Password</label>
                        <div className="relative">
                            <input type={showEditPw ? "text" : "password"} value={editForm.newPassword} onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 pr-10 text-white outline-none focus:border-aira-cyan/60" placeholder="Leave blank to keep current" />
                            <button type="button" onClick={() => setShowEditPw(!showEditPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {showEditPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Leave blank to keep existing password.</p>
                    </div>
                </div>
            </AnimatedModal>

            {/* ---- Delete User Modal ---- */}
            <AnimatedModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete User"
                subtitle="This will remove the user and all their memberships"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleDelete} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Deleting..." : "Delete User"}
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-300">Are you sure? This user will be permanently removed and cannot log in anymore.</p>
            </AnimatedModal>
        </div>
    );
}
