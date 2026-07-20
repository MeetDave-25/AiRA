"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Shield, Key, Copy, Eye, EyeOff, Crown, UploadCloud, Users } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { compressImage } from "@/lib/image-compressor";

// ─── Types ────────────────────────────────────────────────────────────────────
const ROLES = ["TEAM_MEMBER", "TEAM_LEAD", "CONTENT_MANAGER", "ADMIN"];
const roleColor: Record<string, string> = {
    ADMIN: "text-aira-magenta border-aira-magenta/30 bg-aira-magenta/10",
    TEAM_LEAD: "text-aira-gold border-aira-gold/30 bg-aira-gold/10",
    CONTENT_MANAGER: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    TEAM_MEMBER: "text-aira-cyan border-aira-cyan/30 bg-aira-cyan/10",
};
type SysUser = { id: string; name: string; email: string; role: string; createdAt: string };
type ProfileForm = {
    name: string; role: string; bio: string; photo: string;
    linkedin: string; github: string; teamGroup: string; sortOrder: string; isPresident: boolean;
};
const baseProfileForm: ProfileForm = { name: "", role: "Member", bio: "", photo: "", linkedin: "", github: "", teamGroup: "Core Team", sortOrder: "0", isPresident: false };

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const [tab, setTab] = useState<"accounts" | "profiles">("accounts");

    // ── System Accounts state ──
    const [users, setUsers] = useState<SysUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", email: "", role: "TEAM_MEMBER", password: "" });
    const [createdCreds, setCreatedCreds] = useState<{ loginId: string; password: string } | null>(null);
    const [showCreatePw, setShowCreatePw] = useState(false);
    const [editingUser, setEditingUser] = useState<SysUser | null>(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "TEAM_MEMBER", newPassword: "" });
    const [showEditPw, setShowEditPw] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [isUserSubmitting, setIsUserSubmitting] = useState(false);

    // ── Team Profiles state ──
    const [profiles, setProfiles] = useState<any[]>([]);
    const [profilesLoading, setProfilesLoading] = useState(true);
    const [isProfileCreateOpen, setIsProfileCreateOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<any | null>(null);
    const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
    const [profileForm, setProfileForm] = useState<ProfileForm>(baseProfileForm);
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const fetchUsers = useCallback(async (showErr = false) => {
        setUsersLoading(true);
        try {
            const res = await fetch("/api/users");
            const data = res.ok ? await res.json() : [];
            setUsers(Array.isArray(data) ? data : []);
            if (!res.ok && showErr) toast.error("Could not load users.");
        } catch { setUsers([]); if (showErr) toast.error("Failed to fetch users."); }
        finally { setUsersLoading(false); }
    }, []);

    const fetchProfiles = useCallback(async () => {
        setProfilesLoading(true);
        try {
            const res = await fetch("/api/team-members");
            const data = res.ok ? await res.json() : [];
            setProfiles(Array.isArray(data) ? data : []);
        } catch { setProfiles([]); }
        finally { setProfilesLoading(false); }
    }, []);

    useEffect(() => { void fetchUsers(false); }, [fetchUsers]);
    useEffect(() => { if (tab === "profiles") void fetchProfiles(); }, [tab, fetchProfiles]);

    // ─── System Users CRUD ────────────────────────────────────────────────────
    const openCreate = () => { setCreateForm({ name: "", email: "", role: "TEAM_MEMBER", password: "" }); setCreatedCreds(null); setShowCreatePw(false); setIsCreateOpen(true); };

    const handleCreate = async () => {
        if (!createForm.name.trim()) { toast.error("Name is required."); return; }
        setIsUserSubmitting(true);
        try {
            const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: createForm.name.trim(), email: createForm.email.trim() || undefined, role: createForm.role, password: createForm.password.trim() || undefined }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create user");
            setCreatedCreds({ loginId: data.generatedLoginId, password: data.generatedPassword });
            toast.success("User created!");
            await fetchUsers();
        } catch (e: any) { toast.error(e?.message || "Could not create user"); }
        finally { setIsUserSubmitting(false); }
    };

    const openEditUser = (u: SysUser) => { setEditingUser(u); setEditForm({ name: u.name, email: u.email, role: u.role, newPassword: "" }); setShowEditPw(false); };

    const handleEditUser = async () => {
        if (!editingUser || !editForm.name.trim()) { toast.error("Name is required."); return; }
        setIsUserSubmitting(true);
        try {
            const payload: Record<string, any> = { name: editForm.name.trim(), email: editForm.email.trim() || undefined, role: editForm.role };
            if (editForm.newPassword.trim()) payload.password = editForm.newPassword.trim();
            const res = await fetch(`/api/users/${editingUser.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");
            toast.success("User updated!"); setEditingUser(null); await fetchUsers();
        } catch (e: any) { toast.error(e?.message || "Could not update user"); }
        finally { setIsUserSubmitting(false); }
    };

    const handleDeleteUser = async () => {
        if (!deleteUserId) return;
        setIsUserSubmitting(true);
        try {
            const res = await fetch(`/api/users/${deleteUserId}`, { method: "DELETE" });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Failed"); }
            toast.success("User deleted."); setDeleteUserId(null); await fetchUsers();
        } catch (e: any) { toast.error(e?.message || "Could not delete user"); }
        finally { setIsUserSubmitting(false); }
    };

    const copyText = async (text: string, label: string) => { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); };

    // ─── Team Profiles CRUD ───────────────────────────────────────────────────
    const openProfileCreate = () => { setProfileForm(baseProfileForm); setEditingProfile(null); setIsProfileCreateOpen(true); };

    const openProfileEdit = (p: any) => {
        setEditingProfile(p);
        setProfileForm({ name: p.name || "", role: p.role || "Member", bio: p.bio || "", photo: p.photo || "", linkedin: p.linkedin || "", github: p.github || "", teamGroup: p.teamGroup || "Core Team", sortOrder: String(p.sortOrder || 0), isPresident: Boolean(p.isPresident) });
    };

    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        toast.loading("Uploading photo...", { id: "photo-upload" });
        try {
            const compressed = await compressImage(file);
            const body = new FormData(); body.append("file", compressed); body.append("type", "team-members");
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setProfileForm((prev) => ({ ...prev, photo: data.url || prev.photo }));
            toast.success("Photo uploaded", { id: "photo-upload" });
        } catch (e: any) { toast.error(e?.message || "Upload failed", { id: "photo-upload" }); }
        finally { setUploadingPhoto(false); }
    };

    const saveProfile = async () => {
        if (!profileForm.name.trim() || !profileForm.role.trim()) { toast.error("Name and role are required."); return; }
        setIsProfileSubmitting(true);
        try {
            const payload = { ...profileForm, name: profileForm.name.trim(), role: profileForm.role.trim(), bio: profileForm.bio.trim(), teamGroup: profileForm.teamGroup.trim(), sortOrder: Number(profileForm.sortOrder || 0) };
            const endpoint = editingProfile ? `/api/team-members/${editingProfile.id}` : "/api/team-members";
            const method = editingProfile ? "PUT" : "POST";
            const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to save");
            toast.success(editingProfile ? "Profile updated" : "Profile added");
            setIsProfileCreateOpen(false); setEditingProfile(null); fetchProfiles();
        } catch (e: any) { toast.error(e?.message || "Save failed"); }
        finally { setIsProfileSubmitting(false); }
    };

    const deleteProfile = async () => {
        if (!deleteProfileId) return;
        setIsProfileSubmitting(true);
        try {
            const res = await fetch(`/api/team-members/${deleteProfileId}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete");
            toast.success("Profile deleted"); setDeleteProfileId(null); fetchProfiles();
        } catch (e: any) { toast.error(e?.message || "Delete failed"); }
        finally { setIsProfileSubmitting(false); }
    };

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-8 -right-10 w-56 h-56 bg-aira-purple/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-14 -left-12 w-52 h-52 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 md:p-6 rounded-2xl border border-white/5 animated-border">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">People</h1>
                        <p className="text-slate-400 text-sm mt-1">Manage system accounts and public team profiles</p>
                    </div>
                    <button
                        onClick={() => tab === "accounts" ? openCreate() : openProfileCreate()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-aira-purple text-white font-semibold rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-purple/30"
                    >
                        <Plus size={16} /> {tab === "accounts" ? "Add User" : "Add Profile"}
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-2 mt-5">
                    <button onClick={() => setTab("accounts")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tab === "accounts" ? "bg-aira-cyan/10 text-aira-cyan border-aira-cyan/30" : "text-slate-400 border-white/5 hover:bg-white/5"}`}>
                        <Shield size={14} /> System Accounts <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-white/10">{users.length}</span>
                    </button>
                    <button onClick={() => setTab("profiles")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tab === "profiles" ? "bg-aira-purple/20 text-violet-300 border-aira-purple/30" : "text-slate-400 border-white/5 hover:bg-white/5"}`}>
                        <Users size={14} /> Team Profiles <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-white/10">{profiles.length}</span>
                    </button>
                </div>
            </motion.div>

            {/* ── System Accounts Tab ── */}
            {tab === "accounts" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {usersLoading && <div className="md:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center"><p className="text-slate-300">Loading users...</p></div>}
                    {!usersLoading && users.length === 0 && <div className="md:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center"><p className="text-slate-300">No users found.</p><button onClick={() => void fetchUsers(true)} className="mt-2 px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10">Retry</button></div>}
                    {users.map((u, idx) => (
                        <motion.div key={u.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="glass rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-lg font-bold text-white">{u.name[0]?.toUpperCase()}</div>
                                <div className="min-w-0 flex-1"><p className="text-white font-semibold text-sm truncate">{u.name}</p><p className="text-slate-400 text-xs truncate">{u.email}</p></div>
                                {u.role === "ADMIN" && <Shield size={14} className="text-aira-magenta flex-shrink-0" />}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${roleColor[u.role] || roleColor.TEAM_MEMBER}`}>{u.role.replace("_", " ")}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditUser(u)} className="p-1.5 glass rounded text-aira-cyan hover:bg-aira-cyan/20" title="Edit"><Edit2 size={13} /></button>
                                    <button onClick={() => setDeleteUserId(u.id)} className="p-1.5 glass rounded text-aira-magenta hover:bg-aira-magenta/20" title="Delete"><Trash2 size={13} /></button>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-600">Added {new Date(u.createdAt).toLocaleDateString()}</p>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ── Team Profiles Tab ── */}
            {tab === "profiles" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {profilesLoading && <div className="md:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center"><p className="text-slate-300">Loading profiles...</p></div>}
                    {!profilesLoading && profiles.length === 0 && <div className="md:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center"><p className="text-slate-300">No profiles found.</p><button onClick={() => void fetchProfiles()} className="mt-2 px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10">Retry</button></div>}
                    {profiles.map((p, idx) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="glass rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img src={p.photo || "https://placehold.co/100x100/0d1526/00D4FF?text=AL"} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-white/15" />
                                    <div className="min-w-0"><p className="text-white font-semibold text-sm truncate">{p.name}</p><p className="text-aira-cyan text-xs truncate">{p.role}</p></div>
                                </div>
                                {p.isPresident && <Crown size={16} className="text-aira-gold" />}
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{p.teamGroup || "Core Team"}</p>
                            {p.bio && <p className="text-xs text-slate-300 line-clamp-2 mb-3">{p.bio}</p>}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => openProfileEdit(p)} className="p-2 rounded-lg glass text-aira-cyan hover:bg-aira-cyan/20"><Edit2 size={14} /></button>
                                <button onClick={() => setDeleteProfileId(p.id)} className="p-2 rounded-lg glass text-aira-magenta hover:bg-aira-magenta/20"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ══ System Account Modals ══ */}

            {/* Create User */}
            <AnimatedModal open={isCreateOpen} onClose={() => { setIsCreateOpen(false); setCreatedCreds(null); }} title="Add System User" subtitle="Create a login account — assign to teams later"
                footer={<div className="flex justify-end gap-3"><button onClick={() => { setIsCreateOpen(false); setCreatedCreds(null); }} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Close</button>{!createdCreds && <button disabled={isUserSubmitting} onClick={handleCreate} className="px-4 py-2 rounded-lg bg-aira-purple text-white font-semibold disabled:opacity-60">{isUserSubmitting ? "Creating..." : "Create User"}</button>}</div>}
            >
                <div className="space-y-4">
                    {!createdCreds ? (<>
                        <div><label className="block text-xs text-slate-400 mb-1">Full Name *</label><input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" placeholder="e.g. Jane Doe" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1">Email / Login ID</label><input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60" placeholder="Leave blank to auto-generate" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1">Role</label><select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-purple/60">{ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select></div>
                        <div><label className="block text-xs text-slate-400 mb-1">Password</label><div className="relative"><input type={showCreatePw ? "text" : "password"} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 pr-10 text-white outline-none focus:border-aira-purple/60" placeholder="Leave blank to auto-generate" /><button type="button" onClick={() => setShowCreatePw(!showCreatePw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showCreatePw ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></div>
                    </>) : (
                        <div className="rounded-xl border border-aira-gold/30 bg-aira-gold/10 p-4 space-y-3">
                            <p className="text-sm text-aira-gold font-semibold flex items-center gap-2"><Key size={14} /> Credentials (shown once)</p>
                            <div className="flex items-center gap-2"><span className="text-[11px] text-slate-400 w-20">Login ID</span><code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200 truncate">{createdCreds.loginId}</code><button onClick={() => copyText(createdCreds.loginId, "Login ID")} className="p-1.5 rounded border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"><Copy size={13} /></button></div>
                            <div className="flex items-center gap-2"><span className="text-[11px] text-slate-400 w-20">Password</span><code className="flex-1 rounded-md bg-slate-900/70 px-2 py-1 text-sm text-slate-200 truncate">{createdCreds.password}</code><button onClick={() => copyText(createdCreds.password, "Password")} className="p-1.5 rounded border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"><Copy size={13} /></button></div>
                            <button onClick={() => copyText(`Login ID: ${createdCreds.loginId}\nPassword: ${createdCreds.password}`, "Credentials")} className="w-full px-3 py-2 text-xs rounded-md border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10">Copy Both</button>
                        </div>
                    )}
                </div>
            </AnimatedModal>

            {/* Edit User */}
            <AnimatedModal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User" subtitle="Update credentials or role"
                footer={<div className="flex justify-end gap-3"><button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button><button disabled={isUserSubmitting} onClick={handleEditUser} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">{isUserSubmitting ? "Saving..." : "Save Changes"}</button></div>}
            >
                <div className="space-y-4">
                    <div><label className="block text-xs text-slate-400 mb-1">Full Name *</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Email / Login ID</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Role</label><select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60">{ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}</select></div>
                    <div><label className="block text-xs text-slate-400 mb-1">New Password</label><div className="relative"><input type={showEditPw ? "text" : "password"} value={editForm.newPassword} onChange={e => setEditForm({ ...editForm, newPassword: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 pr-10 text-white outline-none focus:border-aira-cyan/60" placeholder="Leave blank to keep current" /><button type="button" onClick={() => setShowEditPw(!showEditPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showEditPw ? <EyeOff size={15} /> : <Eye size={15} />}</button></div><p className="text-[11px] text-slate-500 mt-1">Leave blank to keep existing password.</p></div>
                </div>
            </AnimatedModal>

            {/* Delete User */}
            <AnimatedModal open={!!deleteUserId} onClose={() => setDeleteUserId(null)} title="Delete User" subtitle="This will remove the user and all their memberships"
                footer={<div className="flex justify-end gap-3"><button onClick={() => setDeleteUserId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button><button disabled={isUserSubmitting} onClick={handleDeleteUser} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">{isUserSubmitting ? "Deleting..." : "Delete User"}</button></div>}
            >
                <p className="text-sm text-slate-300">Are you sure? This user will be permanently removed and cannot log in anymore.</p>
            </AnimatedModal>

            {/* ══ Team Profile Modals ══ */}

            {/* Create / Edit Profile */}
            <AnimatedModal open={isProfileCreateOpen || !!editingProfile} onClose={() => { setIsProfileCreateOpen(false); setEditingProfile(null); }} title={editingProfile ? "Edit Profile" : "Add Team Profile"} subtitle="Powers the public About page orbit animation" size="lg"
                footer={<div className="flex justify-end gap-3"><button onClick={() => { setIsProfileCreateOpen(false); setEditingProfile(null); }} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button><button disabled={isProfileSubmitting} onClick={saveProfile} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">{isProfileSubmitting ? "Saving..." : "Save Profile"}</button></div>}
            >
                <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-slate-400 mb-1">Name</label><input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1">Role / Title</label><input value={profileForm.role} onChange={e => setProfileForm({ ...profileForm, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-slate-400 mb-1">Team Group</label><input value={profileForm.teamGroup} onChange={e => setProfileForm({ ...profileForm, teamGroup: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1">Sort Order</label><input type="number" value={profileForm.sortOrder} onChange={e => setProfileForm({ ...profileForm, sortOrder: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    </div>
                    <div><label className="block text-xs text-slate-400 mb-1">Bio</label><textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label><input value={profileForm.linkedin} onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                        <div><label className="block text-xs text-slate-400 mb-1">GitHub URL</label><input value={profileForm.github} onChange={e => setProfileForm({ ...profileForm, github: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" /></div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 space-y-2">
                        <label className="block text-xs text-slate-400">Photo URL</label>
                        <input value={profileForm.photo} onChange={e => setProfileForm({ ...profileForm, photo: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan text-xs cursor-pointer hover:bg-aira-cyan/10">
                            <UploadCloud size={14} />{uploadingPhoto ? "Uploading..." : "Upload Photo"}
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
                        </label>
                        {profileForm.photo && <img src={profileForm.photo} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-white/15" />}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={profileForm.isPresident} onChange={e => setProfileForm({ ...profileForm, isPresident: e.target.checked })} className="h-4 w-4" />
                        Mark as President (replaces existing)
                    </label>
                </div>
            </AnimatedModal>

            {/* Delete Profile */}
            <AnimatedModal open={!!deleteProfileId} onClose={() => setDeleteProfileId(null)} title="Delete Profile" subtitle="This action cannot be undone"
                footer={<div className="flex justify-end gap-3"><button onClick={() => setDeleteProfileId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button><button disabled={isProfileSubmitting} onClick={deleteProfile} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">{isProfileSubmitting ? "Deleting..." : "Delete"}</button></div>}
            >
                <p className="text-sm text-slate-300">Are you sure you want to delete this team profile?</p>
            </AnimatedModal>
        </div>
    );
}
