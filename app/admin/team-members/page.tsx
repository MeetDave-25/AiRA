"use client";

import { useEffect, useState } from "react";
import { Crown, Edit2, Plus, Trash2, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";

type MemberForm = {
    name: string;
    role: string;
    bio: string;
    photo: string;
    linkedin: string;
    github: string;
    teamGroup: string;
    sortOrder: string;
    isPresident: boolean;
};

const baseForm: MemberForm = {
    name: "",
    role: "Member",
    bio: "",
    photo: "",
    linkedin: "",
    github: "",
    teamGroup: "Core Team",
    sortOrder: "0",
    isPresident: false,
};

export default function TeamMembersAdminPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState<MemberForm>(baseForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch("/api/team-members", { signal: controller.signal });
            const data = res.ok ? await res.json() : [];
            setMembers(Array.isArray(data) ? data : []);
            if (!res.ok) {
                toast.error("Could not load team profiles right now.");
            }
        } catch {
            setMembers([]);
            toast.error("Team profile request timed out. Please retry.");
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchMembers();
    }, []);

    const openCreate = () => {
        setForm(baseForm);
        setEditing(null);
        setIsCreateOpen(true);
    };

    const openEdit = (member: any) => {
        setEditing(member);
        setForm({
            name: member.name || "",
            role: member.role || "Member",
            bio: member.bio || "",
            photo: member.photo || "",
            linkedin: member.linkedin || "",
            github: member.github || "",
            teamGroup: member.teamGroup || "Core Team",
            sortOrder: String(member.sortOrder || 0),
            isPresident: Boolean(member.isPresident),
        });
    };

    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        try {
            const body = new FormData();
            body.append("file", file);
            body.append("type", "team-members");
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Photo upload failed");
            setForm((prev) => ({ ...prev, photo: data.url || prev.photo }));
            toast.success("Photo uploaded");
        } catch (error: any) {
            toast.error(error?.message || "Photo upload failed");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const saveMember = async () => {
        if (!form.name.trim() || !form.role.trim()) {
            toast.error("Name and role are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                name: form.name.trim(),
                role: form.role.trim(),
                bio: form.bio.trim(),
                teamGroup: form.teamGroup.trim(),
                sortOrder: Number(form.sortOrder || 0),
            };

            const endpoint = editing ? `/api/team-members/${editing.id}` : "/api/team-members";
            const method = editing ? "PUT" : "POST";
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to save member");

            toast.success(editing ? "Member updated" : "Member added");
            setIsCreateOpen(false);
            setEditing(null);
            fetchMembers();
        } catch (error: any) {
            toast.error(error?.message || "Save failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeMember = async () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/team-members/${deleteId}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete member");
            toast.success("Member deleted");
            setDeleteId(null);
            fetchMembers();
        } catch (error: any) {
            toast.error(error?.message || "Delete failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-aira-purple/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-56 h-56 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 glass p-6 rounded-2xl border border-white/5 animated-border">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">Team Profiles</h1>
                    <p className="text-slate-400 text-sm mt-1">Manage president and member profiles for About page orbit animation</p>
                </div>
                <button onClick={openCreate} className="flex items-center justify-center gap-2 px-4 py-2 bg-aira-cyan text-aira-bg font-semibold rounded-lg text-sm hover:scale-105 transition-transform glow-cyan min-h-[42px]">
                    <Plus size={16} /> Add Member
                </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading && (
                    <div className="md:col-span-2 xl:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center">
                        <p className="text-slate-300">Loading team profiles...</p>
                    </div>
                )}

                {!isLoading && members.length === 0 && (
                    <div className="md:col-span-2 xl:col-span-3 glass rounded-2xl border border-white/10 p-6 text-center space-y-3">
                        <p className="text-slate-300">No profiles found or server is temporarily unavailable.</p>
                        <button onClick={() => void fetchMembers()} className="px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10">
                            Retry
                        </button>
                    </div>
                )}

                {members.map((member, idx) => (
                    <motion.div key={member.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="glass rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <img src={member.photo || "https://placehold.co/100x100/0d1526/00D4FF?text=AL"} alt={member.name} className="w-11 h-11 rounded-full object-cover border border-white/15" />
                                <div className="min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                                    <p className="text-aira-cyan text-xs truncate">{member.role}</p>
                                </div>
                            </div>
                            {member.isPresident && <Crown size={16} className="text-aira-gold" />}
                        </div>

                        <p className="text-xs text-slate-500 mb-2">{member.teamGroup || "Core Team"}</p>
                        {member.bio && <p className="text-xs text-slate-300 line-clamp-3 mb-3">{member.bio}</p>}

                        <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(member)} className="p-2 rounded-lg glass text-aira-cyan hover:bg-aira-cyan/20"><Edit2 size={14} /></button>
                            <button onClick={() => setDeleteId(member.id)} className="p-2 rounded-lg glass text-aira-magenta hover:bg-aira-magenta/20"><Trash2 size={14} /></button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatedModal
                open={isCreateOpen || !!editing}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditing(null);
                }}
                title={editing ? "Edit Team Member" : "Add Team Member"}
                subtitle="This data powers the About us interactive orbit"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => {
                            setIsCreateOpen(false);
                            setEditing(null);
                        }} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">
                            Cancel
                        </button>
                        <button disabled={isSubmitting} onClick={saveMember} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Saving..." : "Save Member"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Name</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Role</label>
                            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Team Group</label>
                            <input value={form.teamGroup} onChange={(e) => setForm({ ...form, teamGroup: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Sort Order</label>
                            <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Bio</label>
                        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                            <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">GitHub URL</label>
                            <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 space-y-2">
                        <label className="block text-xs text-slate-400">Photo URL</label>
                        <input value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan text-xs cursor-pointer hover:bg-aira-cyan/10">
                            <UploadCloud size={14} />
                            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadPhoto(file);
                            }} />
                        </label>
                        {form.photo && <img src={form.photo} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-white/15" />}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={form.isPresident} onChange={(e) => setForm({ ...form, isPresident: e.target.checked })} className="h-4 w-4" />
                        Mark as President (this will replace existing president)
                    </label>
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Member"
                subtitle="This action cannot be undone"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={removeMember} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-300">Are you sure you want to delete this member profile?</p>
            </AnimatedModal>
        </div>
    );
}
