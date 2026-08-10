"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, Check, X, Trash2, Eye, GripVertical, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminMagazinePage() {
    const [magazines, setMagazines]   = useState<any[]>([]);
    const [allPosts, setAllPosts]     = useState<any[]>([]);
    const [selected, setSelected]     = useState<any | null>(null);
    const [loading, setLoading]       = useState(false);

    // New magazine form
    const [formTitle, setFormTitle]   = useState("");
    const [formEdition, setFormEdition] = useState("");
    const [formDesc, setFormDesc]     = useState("");
    const [formCover, setFormCover]   = useState("");
    const [creating, setCreating]     = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const loadMagazines = () => {
        setLoading(true);
        fetch("/api/magazine")
            .then(r => r.json())
            .then(d => setMagazines(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    };

    const loadPublishedPosts = () => {
        fetch("/api/blog/posts")
            .then(r => r.json())
            .then(d => setAllPosts(Array.isArray(d) ? d : []));
    };

    useEffect(() => { loadMagazines(); loadPublishedPosts(); }, []);

    const createMagazine = async () => {
        if (!formTitle.trim() || !formEdition.trim()) return;
        setCreating(true);
        const res = await fetch("/api/magazine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: formTitle, edition: formEdition, description: formDesc, coverImage: formCover || null }),
        });
        if (res.ok) {
            toast.success("Magazine created!");
            setFormTitle(""); setFormEdition(""); setFormDesc(""); setFormCover("");
            setShowCreate(false);
            loadMagazines();
        }
        setCreating(false);
    };

    const addPostToMag = async (postId: string) => {
        if (!selected) return;
        const res = await fetch(`/api/magazine/${selected.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addPostId: postId }),
        });
        const d = await res.json();
        if (d.id) { setSelected(d); loadMagazines(); }
    };

    const removePostFromMag = async (postId: string) => {
        if (!selected) return;
        const res = await fetch(`/api/magazine/${selected.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ removePostId: postId }),
        });
        const d = await res.json();
        if (d.id) { setSelected(d); loadMagazines(); }
    };

    const publishMagazine = async (id: string, pub: boolean) => {
        const res = await fetch(`/api/magazine/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: pub ? "PUBLISHED" : "DRAFT" }),
        });
        const d = await res.json();
        if (d.id) {
            toast.success(pub ? "Magazine published!" : "Set to draft.");
            loadMagazines();
            if (selected?.id === id) setSelected(d);
        }
    };

    const deleteMagazine = async (id: string) => {
        if (!confirm("Delete this magazine permanently?")) return;
        await fetch(`/api/magazine/${id}`, { method: "DELETE" });
        toast.success("Magazine deleted");
        if (selected?.id === id) setSelected(null);
        loadMagazines();
    };

    const selectedPostIds = new Set(selected?.posts?.map((mp: any) => mp.post.id) ?? []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white">Magazine Studio</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Curate and publish digital magazine editions</p>
                </div>
                <button
                    onClick={() => setShowCreate(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-aira-magenta text-white rounded-xl text-sm font-semibold hover:bg-pink-500 transition-all"
                >
                    <Plus size={15} /> New Edition
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl border border-aira-magenta/20 p-5 space-y-3"
                >
                    <p className="font-orbitron text-sm font-bold text-white">New Magazine Edition</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Title (e.g. AiRA Lab Monthly)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta/40" />
                        <input value={formEdition} onChange={e => setFormEdition(e.target.value)} placeholder="Edition (e.g. Vol.1, Issue 1)" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta/40" />
                    </div>
                    <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} placeholder="Description (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-aira-magenta/40" />
                    <input value={formCover} onChange={e => setFormCover(e.target.value)} placeholder="Cover image URL (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta/40" />
                    <button onClick={createMagazine} disabled={creating || !formTitle.trim() || !formEdition.trim()} className="flex items-center gap-2 px-4 py-2 bg-aira-magenta text-white rounded-xl text-sm font-semibold hover:bg-pink-500 transition-all disabled:opacity-50">
                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Magazine list ── */}
                <div className="space-y-3">
                    <h2 className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest">Editions</h2>
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)
                    ) : magazines.length === 0 ? (
                        <div className="glass rounded-2xl border border-white/10 p-8 text-center text-slate-500">
                            <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No editions yet. Create the first one!</p>
                        </div>
                    ) : (
                        magazines.map((mag: any, i: number) => (
                            <motion.div
                                key={mag.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelected(mag)}
                                className={`glass rounded-xl border p-4 cursor-pointer transition-all ${selected?.id === mag.id ? "border-aira-magenta/50 bg-aira-magenta/5" : "border-white/10 hover:border-white/20"}`}
                            >
                                <div className="flex items-center gap-3">
                                    {mag.coverImage ? (
                                        <img src={mag.coverImage} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                                    ) : (
                                        <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-purple-900/60 to-pink-900/30 flex items-center justify-center shrink-0">
                                            <BookOpen size={18} className="text-aira-magenta/60" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-medium text-sm text-white truncate">{mag.title}</h3>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-orbitron border ${mag.status === "PUBLISHED" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                                                {mag.status}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">{mag.edition} &nbsp;•&nbsp; {mag.posts?.length ?? 0} articles</p>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                        <Link href={`/magazine/${mag.id}`} target="_blank" onClick={e => e.stopPropagation()} className="p-1.5 glass border border-white/10 rounded-lg text-slate-400 hover:text-white">
                                            <Eye size={12} />
                                        </Link>
                                        <button onClick={e => { e.stopPropagation(); publishMagazine(mag.id, mag.status !== "PUBLISHED"); }} className={`p-1.5 rounded-lg text-white transition-colors ${mag.status === "PUBLISHED" ? "bg-yellow-600/60 hover:bg-yellow-600" : "bg-green-600/60 hover:bg-green-600"}`}>
                                            {mag.status === "PUBLISHED" ? <X size={12} /> : <Check size={12} />}
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); deleteMagazine(mag.id); }} className="p-1.5 bg-red-600/60 hover:bg-red-600 rounded-lg text-white transition-colors">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* ── Article curator ── */}
                <div>
                    {!selected ? (
                        <div className="glass rounded-2xl border border-white/10 p-8 text-center text-slate-500 h-64 flex items-center justify-center flex-col gap-2">
                            <GripVertical size={28} className="opacity-20" />
                            <p className="text-sm">Select an edition to curate articles</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Curating: {selected.title}
                            </h2>

                            {/* Currently in magazine */}
                            <div className="glass rounded-2xl border border-aira-magenta/20 p-4 space-y-2">
                                <p className="text-xs text-aira-magenta font-orbitron font-bold uppercase tracking-widest mb-2">In This Edition ({selected.posts?.length ?? 0})</p>
                                {(selected.posts ?? []).length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-4">No articles added yet. Pick from below.</p>
                                ) : (
                                    selected.posts.map((mp: any, i: number) => (
                                        <div key={mp.post.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                                            <span className="text-[10px] text-aira-magenta font-mono w-5 shrink-0">{i + 1}.</span>
                                            {mp.post.coverImage && <img src={mp.post.coverImage} alt="" className="w-10 h-7 rounded object-cover shrink-0" />}
                                            <p className="flex-1 text-xs text-white truncate">{mp.post.title}</p>
                                            <button onClick={() => removePostFromMag(mp.post.id)} className="text-red-400 hover:text-red-300 transition-colors shrink-0">
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add from published posts */}
                            <div className="glass rounded-2xl border border-white/10 p-4 space-y-2">
                                <p className="text-xs text-slate-400 font-orbitron uppercase tracking-widest mb-2">Add from Published Posts</p>
                                {allPosts.filter(p => !selectedPostIds.has(p.id)).length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-4">All published posts already added.</p>
                                ) : (
                                    allPosts.filter(p => !selectedPostIds.has(p.id)).map((post: any) => (
                                        <div key={post.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                                            {post.coverImage && <img src={post.coverImage} alt="" className="w-10 h-7 rounded object-cover shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white truncate">{post.title}</p>
                                                <p className="text-[10px] text-slate-500">{post.author?.name}</p>
                                            </div>
                                            <button
                                                onClick={() => addPostToMag(post.id)}
                                                className="shrink-0 p-1.5 bg-aira-magenta/80 hover:bg-aira-magenta rounded-lg text-white transition-colors"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
