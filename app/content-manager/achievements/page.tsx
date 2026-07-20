"use client";

import { useState, useEffect, useCallback } from "react";
import { Image, Plus, Trash2, ExternalLink, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/image-compressor";

interface Achievement {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    date?: string;
    createdAt: string;
}

export default function ContentManagerAchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", imageUrl: "", category: "Achievement", date: "" });

    const fetchAchievements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/achievements");
            const data = res.ok ? await res.json() : [];
            setAchievements(Array.isArray(data) ? data : []);
        } catch { setAchievements([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

    const uploadImage = async (file: File) => {
        setUploading(true);
        const id = toast.loading("Uploading image…");
        try {
            const compressed = await compressImage(file);
            const body = new FormData();
            body.append("file", compressed);
            body.append("type", "achievements");
            const res = await fetch("/api/upload", { method: "POST", body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Upload failed");
            setForm(f => ({ ...f, imageUrl: data.url }));
            toast.success("Image uploaded!", { id });
        } catch (e: any) { toast.error(e?.message || "Upload failed", { id }); }
        finally { setUploading(false); }
    };

    const handleAdd = async () => {
        if (!form.title.trim()) { toast.error("Title is required"); return; }
        const id = toast.loading("Saving…");
        try {
            const res = await fetch("/api/achievements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, title: form.title.trim(), description: form.description.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to save");
            toast.success("Achievement added!", { id });
            setIsAdding(false);
            setForm({ title: "", description: "", imageUrl: "", category: "Achievement", date: "" });
            fetchAchievements();
        } catch (e: any) { toast.error(e?.message || "Failed", { id }); }
    };

    const handleDelete = async (achId: string) => {
        if (!confirm("Delete this achievement?")) return;
        const id = toast.loading("Deleting…");
        try {
            const res = await fetch(`/api/achievements/${achId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Deleted", { id });
            fetchAchievements();
        } catch (e: any) { toast.error(e?.message || "Failed", { id }); }
    };

    return (
        <div className="min-h-screen bg-aira-bg p-6 md:p-10 space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl border border-white/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white flex items-center gap-2">
                        <Image size={20} className="text-aira-purple" /> Achievements & Media
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Upload and manage achievement photos for the public gallery.</p>
                </div>
                <button onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-aira-purple text-white rounded-xl font-semibold hover:scale-105 transition-transform text-sm">
                    <Plus size={16} /> Add Achievement
                </button>
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="glass rounded-2xl border border-aira-purple/30 p-6 space-y-4">
                    <h2 className="font-bold text-white text-lg">New Achievement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-aira-purple/50"
                                placeholder="Best Research Project – 2026" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none">
                                {["Achievement", "Workshop", "Event", "Research", "Award", "Other"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 mb-1 block">Description</label>
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={3} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-aira-purple/50 resize-none"
                                placeholder="Brief description of this achievement…" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Date</label>
                            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Image</label>
                            <div className="flex gap-2 items-center">
                                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-aira-purple/30 text-aira-purple text-sm cursor-pointer hover:bg-aira-purple/10 transition-colors ${uploading ? "opacity-50" : ""}`}>
                                    <Upload size={14} /> {uploading ? "Uploading…" : "Upload Photo"}
                                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                                </label>
                                {form.imageUrl && <img src={form.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm">Cancel</button>
                        <button onClick={handleAdd} className="px-5 py-2 rounded-xl bg-aira-purple text-white font-semibold text-sm hover:scale-105 transition-transform">Save Achievement</button>
                    </div>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="glass rounded-2xl border border-white/5 p-8 text-center text-slate-400">Loading achievements…</div>
            ) : achievements.length === 0 ? (
                <div className="glass rounded-2xl border border-white/5 p-12 text-center">
                    <Image size={40} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No achievements yet. Click <strong>Add Achievement</strong> to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {achievements.map(a => (
                        <div key={a.id} className="glass rounded-2xl border border-white/5 overflow-hidden group hover:border-aira-purple/30 transition-colors">
                            {a.imageUrl ? (
                                <div className="relative h-40 overflow-hidden">
                                    <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    {a.category && (
                                        <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-aira-purple/80 text-white font-semibold">{a.category}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="h-28 bg-slate-800/50 flex items-center justify-center">
                                    <Image size={32} className="text-slate-600" />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{a.title}</h3>
                                {a.description && <p className="text-slate-400 text-xs line-clamp-2 mb-3">{a.description}</p>}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500">{a.date ? new Date(a.date).toLocaleDateString() : new Date(a.createdAt).toLocaleDateString()}</span>
                                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
