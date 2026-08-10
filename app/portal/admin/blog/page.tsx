"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PenLine, BookOpen, CheckCircle, XCircle, Trash2, Plus, Eye, Loader2, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const TABS = ["Topics", "Review Queue", "All Posts"] as const;
type Tab = typeof TABS[number];

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        DRAFT:     "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        PUBLISHED: "bg-green-500/20 text-green-400 border-green-500/30",
        REJECTED:  "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold border ${map[status] ?? "bg-slate-700 text-slate-300 border-white/10"}`}>
            {status}
        </span>
    );
}

export default function AdminBlogPage() {
    const [tab, setTab]             = useState<Tab>("Topics");
    const [topics, setTopics]       = useState<any[]>([]);
    const [posts, setPosts]         = useState<any[]>([]);
    const [loading, setLoading]     = useState(false);

    // New topic form
    const [newTitle, setNewTitle]   = useState("");
    const [newDesc, setNewDesc]     = useState("");
    const [creating, setCreating]   = useState(false);

    const loadTopics = () => {
        setLoading(true);
        fetch("/api/blog/topics?all=true")
            .then(r => r.json())
            .then(d => setTopics(Array.isArray(d) ? d : []))
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    };

    const loadPosts = (statusFilter?: string) => {
        setLoading(true);
        fetch("/api/blog/posts/all" + (statusFilter ? `?status=${statusFilter}` : ""))
            .then(r => r.json())
            .then(d => setPosts(Array.isArray(d) ? d : []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === "Topics")       loadTopics();
        if (tab === "Review Queue") loadPosts("DRAFT");
        if (tab === "All Posts")    loadPosts();
    }, [tab]);

    const createTopic = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("Please enter a topic title");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/blog/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setNewTitle("");
                setNewDesc("");
                toast.success("Topic created successfully!");
                loadTopics();
            } else {
                toast.error(data.error || "Failed to create topic");
            }
        } catch (err: any) {
            toast.error("Network error while creating topic");
        } finally {
            setCreating(false);
        }
    };

    const toggleTopic = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch("/api/blog/topics", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !isActive }),
            });
            if (res.ok) {
                toast.success(`Topic ${isActive ? "deactivated" : "activated"}`);
                loadTopics();
            } else {
                toast.error("Failed to update topic status");
            }
        } catch {
            toast.error("Error updating topic");
        }
    };

    const deleteTopic = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete topic "${title}"?`)) return;
        try {
            const res = await fetch(`/api/blog/topics?id=${id}`, {
                method: "DELETE",
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success(data.message || "Topic removed");
                loadTopics();
            } else {
                toast.error(data.error || "Failed to delete topic");
            }
        } catch {
            toast.error("Error deleting topic");
        }
    };

    const setPostStatus = async (id: string, status: string) => {
        const res = await fetch(`/api/blog/posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            toast.success(`Post ${status === "PUBLISHED" ? "published" : "rejected"}!`);
            tab === "Review Queue" ? loadPosts("DRAFT") : loadPosts();
        } else {
            toast.error("Failed to update post status");
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        const res = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("Post deleted");
            loadPosts();
        } else {
            toast.error("Failed to delete post");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-orbitron font-bold text-2xl text-white">Blog Management</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage writing topics, review submissions, and moderate community articles</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${tab === t
                            ? "bg-aira-card text-aira-cyan border border-aira-cyan/30 border-b-aira-card -mb-px font-semibold"
                            : "text-slate-400 hover:text-white"}`}
                    >
                        {t === "Topics" && <BookOpen size={14} className="inline mr-1.5 -mt-0.5" />}
                        {t === "Review Queue" && <CheckCircle size={14} className="inline mr-1.5 -mt-0.5" />}
                        {t === "All Posts" && <FileText size={14} className="inline mr-1.5 -mt-0.5" />}
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Topics ── */}
            {tab === "Topics" && (
                <div className="space-y-5">
                    {/* Create form */}
                    <form onSubmit={createTopic} className="glass rounded-2xl border border-white/10 p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-aira-cyan/15 border border-aira-cyan/30 flex items-center justify-center text-aira-cyan">
                                <Plus size={16} />
                            </div>
                            <div>
                                <p className="font-orbitron text-sm text-white font-bold">Create New Blog Topic</p>
                                <p className="text-slate-400 text-xs">Topics are displayed on the Member Portal for authors to write about.</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium mb-1 block">Topic Title *</label>
                            <input
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. 'Autonomous Drones & Computer Vision in 2026'"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300 font-medium mb-1 block">Description / Writing Guidance (Optional)</label>
                            <textarea
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                placeholder="Give authors context, prompts, or key points to cover..."
                                rows={2}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-aira-cyan/50 focus:bg-white/10 transition-all"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={creating || !newTitle.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 rounded-xl text-sm font-bold shadow-md shadow-sky-400/20 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                                <span>Create Topic</span>
                            </button>
                        </div>
                    </form>

                    {/* List of Topics */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="font-orbitron font-bold text-sm text-slate-200">
                                Existing Topics ({topics.length})
                            </h2>
                            <button
                                onClick={loadTopics}
                                className="text-xs text-aira-cyan hover:underline"
                            >
                                Refresh
                            </button>
                        </div>

                        {loading ? (
                            [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)
                        ) : topics.length === 0 ? (
                            <div className="glass rounded-2xl p-8 text-center border border-white/10">
                                <BookOpen size={36} className="mx-auto mb-3 text-slate-600" />
                                <p className="text-slate-400 font-orbitron text-sm">No topics created yet.</p>
                                <p className="text-slate-500 text-xs mt-1">Use the form above to add your first writing topic.</p>
                            </div>
                        ) : (
                            topics.map((topic: any, i: number) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="glass rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-sm text-white">{topic.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-orbitron ${
                                                topic.isActive
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                    : "bg-slate-700/60 text-slate-400 border-slate-600"
                                            }`}>
                                                {topic.isActive ? "Active" : "Inactive"}
                                            </span>
                                            {topic._count?.posts !== undefined && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 font-mono">
                                                    {topic._count.posts} {topic._count.posts === 1 ? "post" : "posts"}
                                                </span>
                                            )}
                                        </div>
                                        {topic.description && (
                                            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{topic.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <Link
                                            href={`/portal/blog/write/${topic.id}`}
                                            className="text-xs px-3 py-1.5 glass border border-sky-400/30 text-sky-300 hover:text-white hover:border-sky-400 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <PenLine size={12} /> Write
                                        </Link>

                                        <button
                                            onClick={() => toggleTopic(topic.id, topic.isActive)}
                                            className={`text-xs px-3 py-1.5 glass border rounded-lg transition-colors ${
                                                topic.isActive
                                                    ? "border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/10"
                                                    : "border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/10"
                                            }`}
                                        >
                                            {topic.isActive ? "Deactivate" : "Activate"}
                                        </button>

                                        <button
                                            onClick={() => deleteTopic(topic.id, topic.title)}
                                            className="p-2 glass border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-colors"
                                            title="Delete Topic"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ── Review Queue ── */}
            {tab === "Review Queue" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 glass rounded-2xl border border-white/10">
                            <CheckCircle size={40} className="mx-auto mb-3 opacity-20 text-emerald-400" />
                            <p className="font-orbitron text-sm text-slate-400">No posts awaiting review.</p>
                            <p className="text-xs text-slate-500 mt-1">All submissions have been reviewed.</p>
                        </div>
                    ) : (
                        posts.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-xl border border-yellow-500/20 p-4 flex flex-col sm:flex-row items-start gap-4"
                            >
                                {post.coverImage && (
                                    <img src={post.coverImage} alt="" className="w-full sm:w-24 h-24 sm:h-16 rounded-lg object-cover shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-white">{post.title}</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        By {post.author?.name} &nbsp;•&nbsp; {post.topic?.title} &nbsp;•&nbsp; {post.readTime}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{post.content?.slice(0, 140)}…</p>
                                </div>
                                <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
                                    <Link href={`/blog/${post.id}`} target="_blank" className="flex items-center justify-center gap-1 px-3 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white">
                                        <Eye size={12} /> Preview
                                    </Link>
                                    <button
                                        onClick={() => setPostStatus(post.id, "PUBLISHED")}
                                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-xs text-white transition-colors"
                                    >
                                        <CheckCircle size={12} /> Approve
                                    </button>
                                    <button
                                        onClick={() => setPostStatus(post.id, "REJECTED")}
                                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-xs text-white transition-colors"
                                    >
                                        <XCircle size={12} /> Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* ── All Posts ── */}
            {tab === "All Posts" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 glass rounded-2xl border border-white/10">
                            <FileText size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-slate-400">No posts yet.</p>
                        </div>
                    ) : (
                        posts.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass rounded-xl border border-white/10 p-4 flex items-center gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-medium text-sm text-white truncate">{post.title}</h3>
                                        <StatusBadge status={post.status} />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {post.author?.name} &nbsp;•&nbsp; {post.topic?.title} &nbsp;•&nbsp; {post.readTime}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link href={`/blog/${post.id}`} target="_blank" className="p-1.5 glass border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                        <Eye size={14} />
                                    </Link>
                                    {post.status === "DRAFT" && (
                                        <button
                                            onClick={() => setPostStatus(post.id, "PUBLISHED")}
                                            className="p-1.5 bg-green-600/60 hover:bg-green-600 rounded-lg text-white transition-colors"
                                            title="Approve Post"
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deletePost(post.id)}
                                        className="p-1.5 bg-red-600/60 hover:bg-red-600 rounded-lg text-white transition-colors"
                                        title="Delete Post"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
