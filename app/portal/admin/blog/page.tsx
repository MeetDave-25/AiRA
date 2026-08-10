"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PenLine, BookOpen, CheckCircle, XCircle, Trash2, Plus, Eye, Loader2 } from "lucide-react";
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
        fetch("/api/blog/topics")
            .then(r => r.json())
            .then(d => setTopics(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    };

    const loadPosts = (statusFilter?: string) => {
        setLoading(true);
        fetch("/api/blog/posts/all" + (statusFilter ? `?status=${statusFilter}` : ""))
            .then(r => r.json())
            .then(d => setPosts(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === "Topics")       loadTopics();
        if (tab === "Review Queue") loadPosts("DRAFT");
        if (tab === "All Posts")    loadPosts();
    }, [tab]);

    const createTopic = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        const res = await fetch("/api/blog/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, description: newDesc }),
        });
        if (res.ok) {
            setNewTitle(""); setNewDesc("");
            toast.success("Topic created!");
            loadTopics();
        } else {
            toast.error("Failed to create topic");
        }
        setCreating(false);
    };

    const toggleTopic = async (id: string, isActive: boolean) => {
        await fetch("/api/blog/topics", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isActive: !isActive }),
        });
        loadTopics();
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
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
        toast.success("Post deleted");
        loadPosts();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-orbitron font-bold text-2xl text-white">Blog Management</h1>
                <p className="text-slate-400 text-sm mt-0.5">Manage topics, review submissions, and moderate posts</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${tab === t
                            ? "bg-aira-card text-aira-cyan border border-aira-cyan/30 border-b-aira-card -mb-px"
                            : "text-slate-400 hover:text-white"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* ── Topics ── */}
            {tab === "Topics" && (
                <div className="space-y-4">
                    {/* Create form */}
                    <div className="glass rounded-2xl border border-white/10 p-5 space-y-3">
                        <p className="font-orbitron text-sm text-white font-bold">Create New Topic</p>
                        <input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Topic title (e.g. 'AI in Agriculture')"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/40"
                        />
                        <textarea
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            placeholder="Optional description / writing prompt..."
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-aira-cyan/40"
                        />
                        <button
                            onClick={createTopic}
                            disabled={creating || !newTitle.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-aira-cyan text-black rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50"
                        >
                            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                            Create Topic
                        </button>
                    </div>

                    {/* List */}
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)
                    ) : topics.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No topics yet.</p>
                    ) : (
                        topics.map((topic: any, i: number) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="glass rounded-xl border border-white/10 p-4 flex items-center gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-sm text-white">{topic.title}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-orbitron ${topic.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
                                            {topic.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    {topic.description && <p className="text-slate-400 text-xs mt-0.5 truncate">{topic.description}</p>}
                                </div>
                                <button
                                    onClick={() => toggleTopic(topic.id, topic.isActive)}
                                    className="text-xs px-3 py-1.5 glass border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                                >
                                    {topic.isActive ? "Deactivate" : "Activate"}
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* ── Review Queue ── */}
            {tab === "Review Queue" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                            <p>No posts awaiting review.</p>
                        </div>
                    ) : (
                        posts.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-xl border border-yellow-500/20 p-4 flex items-start gap-4"
                            >
                                {post.coverImage && (
                                    <img src={post.coverImage} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-white">{post.title}</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        By {post.author?.name} &nbsp;•&nbsp; {post.topic?.title} &nbsp;•&nbsp; {post.readTime}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{post.content?.slice(0, 120)}…</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <Link href={`/blog/${post.id}`} target="_blank" className="flex items-center gap-1 px-3 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white">
                                        <Eye size={12} /> Preview
                                    </Link>
                                    <button
                                        onClick={() => setPostStatus(post.id, "PUBLISHED")}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-xs text-white transition-colors"
                                    >
                                        <CheckCircle size={12} /> Approve
                                    </button>
                                    <button
                                        onClick={() => setPostStatus(post.id, "REJECTED")}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-xs text-white transition-colors"
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
                        <p className="text-slate-500 text-center py-16">No posts yet.</p>
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
                                        >
                                            <CheckCircle size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deletePost(post.id)}
                                        className="p-1.5 bg-red-600/60 hover:bg-red-600 rounded-lg text-white transition-colors"
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
