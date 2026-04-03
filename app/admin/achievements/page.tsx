"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Award } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AnimatedModal from "@/components/ui/AnimatedModal";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
};

export default function AdminAchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<any | null>(null);
    const [deletingAchievementId, setDeletingAchievementId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        category: "General",
        description: "",
    });

    const fetchAchievements = () => fetch("/api/achievements").then(r => r.json()).then(d => setAchievements(Array.isArray(d) ? d : []));
    useEffect(() => { fetchAchievements(); }, []);

    const openCreateModal = () => {
        setForm({ title: "", category: "General", description: "" });
        setIsCreateOpen(true);
    };

    const handleCreateAchievement = async () => {
        if (!form.title.trim()) {
            toast.error("Title is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/achievements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    category: form.category.trim() || "General",
                    description: form.description.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to create achievement");
            }

            toast.success("Achievement added!");
            setIsCreateOpen(false);
            fetchAchievements();
        } catch (error: any) {
            toast.error(error?.message || "Could not add achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (achievement: any) => {
        setEditingAchievement(achievement);
        setForm({
            title: achievement.title || "",
            category: achievement.category || "General",
            description: achievement.description || "",
        });
    };

    const handleUpdateAchievement = async () => {
        if (!editingAchievement) return;
        if (!form.title.trim()) {
            toast.error("Title is required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/achievements/${editingAchievement.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    category: form.category.trim() || "General",
                    description: form.description.trim(),
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to update achievement");
            }

            toast.success("Achievement updated!");
            setEditingAchievement(null);
            fetchAchievements();
        } catch (error: any) {
            toast.error(error?.message || "Could not update achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/achievements/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Failed to delete achievement");
            }
            toast.success("Deleted!");
            setDeletingAchievementId(null);
            fetchAchievements();
        } catch (error: any) {
            toast.error(error?.message || "Could not delete achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = new Set(achievements.map((a) => a.category || "General")).size;

    return (
        <motion.div className="space-y-6 relative" variants={containerVariants} initial="hidden" animate="show">
            <div className="absolute -top-8 -right-10 w-52 h-52 bg-aira-gold/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 left-0 w-44 h-44 bg-aira-magenta/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 glass p-6 rounded-2xl border border-white/5 animated-border">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text">Achievements</h1>
                    <p className="text-slate-400 text-sm mt-1">Recognitions and milestones</p>
                    <div className="flex gap-2 mt-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full border border-aira-gold/30 bg-aira-gold/10 text-aira-gold font-medium">
                            Total: {achievements.length}
                        </span>
                        <span className="px-2.5 py-1 rounded-full border border-aira-magenta/30 bg-aira-magenta/10 text-pink-300 font-medium">
                            Categories: {categories}
                        </span>
                    </div>
                </div>
                <button onClick={openCreateModal} className="flex items-center justify-center gap-2 px-4 py-2 bg-aira-gold text-aira-bg font-semibold rounded-lg text-sm hover:scale-105 transition-transform shadow-lg shadow-aira-gold/30 min-h-[42px]">
                    <Plus size={16} /> Add Achievement
                </button>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 overflow-hidden card-3d">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs uppercase text-slate-400">
                        <tr>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {achievements.map((a, index) => (
                            <motion.tr
                                key={a.id}
                                className="hover:bg-white/5 transition-colors"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <td className="p-4 font-medium text-white flex items-center gap-2">
                                    <span className="text-xl">{a.icon || "🏆"}</span>
                                    <span className="line-clamp-1">{a.title}</span>
                                </td>
                                <td className="p-4 text-slate-400">
                                    <span className="px-2 py-1 rounded bg-aira-gold/10 text-aira-gold text-xs border border-aira-gold/20">{a.category || "General"}</span>
                                </td>
                                <td className="p-4 flex gap-2 justify-end">
                                    <button onClick={() => openEditModal(a)} className="p-2 glass rounded text-aira-cyan hover:bg-aira-cyan/20"><Edit2 size={14} /></button>
                                    <button onClick={() => setDeletingAchievementId(a.id)} className="p-2 glass rounded text-aira-magenta hover:bg-aira-magenta/20"><Trash2 size={14} /></button>
                                </td>
                            </motion.tr>
                        ))}
                        {achievements.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    <p className="mb-3">No achievements recorded yet.</p>
                                    <button onClick={openCreateModal} className="px-3 py-2 text-xs rounded-lg border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10">
                                        Create first achievement
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            <AnimatedModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Achievement"
                subtitle="Showcase a milestone"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleCreateAchievement} className="px-4 py-2 rounded-lg bg-aira-gold text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Creating..." : "Create"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Category</label>
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!editingAchievement}
                onClose={() => setEditingAchievement(null)}
                title="Edit Achievement"
                subtitle="Update milestone details"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingAchievement(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleUpdateAchievement} className="px-4 py-2 rounded-lg bg-aira-gold text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Category</label>
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-gold/60" />
                    </div>
                </div>
            </AnimatedModal>

            <AnimatedModal
                open={!!deletingAchievementId}
                onClose={() => setDeletingAchievementId(null)}
                title="Delete Achievement"
                subtitle="This action cannot be undone"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeletingAchievementId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting || !deletingAchievementId} onClick={() => deletingAchievementId && handleDelete(deletingAchievementId)} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-300">Are you sure you want to permanently remove this achievement?</p>
            </AnimatedModal>
        </motion.div>
    );
}
