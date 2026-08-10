"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, BookOpen, Users, Clock, Star, CheckCircle, XCircle, FileText, Plus, X, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const TABS = ["Write", "My Posts", "Community Feed"] as const;
type Tab = typeof TABS[number];

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        DRAFT:     { label: "Draft",     cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
        PUBLISHED: { label: "Published", cls: "bg-green-500/20 text-green-400 border-green-500/30" },
        REJECTED:  { label: "Rejected",  cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    };
    const { label, cls } = map[status] ?? { label: status, cls: "bg-slate-700 text-slate-300 border-white/10" };
    return (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold border ${cls}`}>
            {label}
        </span>
    );
}

export default function MemberBlogPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<Tab>("Write");
    const [topics, setTopics]       = useState<any[]>([]);
    const [myPosts, setMyPosts]     = useState<any[]>([]);
    const [feed, setFeed]           = useState<any[]>([]);
    const [loading, setLoading]     = useState(false);

    // Create topic modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creatingTopic, setCreatingTopic] = useState(false);

    const userRole = (session?.user as any)?.role || "TEAM_MEMBER";
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "LEAD", "PRESIDENT"].includes(userRole.toUpperCase());

    const loadTopics = () => {
        fetch("/api/blog/topics")
            .then(r => r.json())
            .then(d => setTopics(Array.isArray(d) ? d : []))
            .catch(() => setTopics([]));
    };

    useEffect(() => {
        loadTopics();
    }, []);

    useEffect(() => {
        if (activeTab === "My Posts" && session) {
            setLoading(true);
            fetch("/api/blog/posts/mine")
                .then(r => r.json())
                .then(d => setMyPosts(Array.isArray(d) ? d : []))
                .catch(() => setMyPosts([]))
                .finally(() => setLoading(false));
        }
        if (activeTab === "Community Feed") {
            setLoading(true);
            fetch("/api/blog/posts")
                .then(r => r.json())
                .then(d => setFeed(Array.isArray(d) ? d : []))
                .catch(() => setFeed([]))
                .finally(() => setLoading(false));
        }
    }, [activeTab, session]);

    const handleCreateTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error("Please enter a topic title");
            return;
        }

        setCreatingTopic(true);
        try {
            const res = await fetch("/api/blog/topics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    description: newDesc.trim() || null,
                }),
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                toast.success("Topic created successfully!");
                setNewTitle("");
                setNewDesc("");
                setShowCreateModal(false);
                loadTopics();
            } else {
                toast.error(data.error || "Failed to create topic");
            }
        } catch {
            toast.error("Network error while creating topic");
        } finally {
            setCreatingTopic(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white">AiRA Lab Blog</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Write, collaborate, and read breakthrough tech articles</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-xs font-orbitron tracking-wider shadow-md shadow-sky-400/20 transition-all cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Create Topic</span>
                    </button>

                    {isPrivileged && (
                        <Link
                            href="/portal/admin/blog"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-mono transition-all"
                        >
                            <ShieldCheck size={14} className="text-purple-400" />
                            <span>Moderate</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-0">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab
                            ? "bg-aira-card text-aira-cyan border border-aira-cyan/30 border-b-aira-card -mb-px font-semibold"
                            : "text-slate-400 hover:text-white"}`}
                    >
                        {tab === "Write"         && <PenLine size={13} className="inline mr-1.5 -mt-0.5" />}
                        {tab === "My Posts"      && <FileText size={13} className="inline mr-1.5 -mt-0.5" />}
                        {tab === "Community Feed" && <Users size={13} className="inline mr-1.5 -mt-0.5" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Write Tab ── */}
            {activeTab === "Write" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm">Select a topic below to start drafting your article:</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-xs text-aira-cyan hover:underline flex items-center gap-1"
                        >
                            <Plus size={12} /> Add new topic
                        </button>
                    </div>

                    {topics.length === 0 ? (
                        <div className="glass rounded-2xl p-8 sm:p-12 text-center border border-white/10 space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto text-sky-400">
                                <BookOpen size={28} />
                            </div>
                            <div>
                                <p className="text-white font-orbitron font-bold text-base">No Writing Topics Yet</p>
                                <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                                    Create the first topic to kickstart articles on autonomous systems, AI, robotics, or research!
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-bold text-xs font-orbitron tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>Create First Topic</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {topics.map((topic: any, i: number) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <Link href={`/portal/blog/write/${topic.id}`}>
                                        <div className="glass rounded-2xl p-5 border border-white/10 hover:border-aira-cyan/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-aira-cyan/15 border border-aira-cyan/30 flex items-center justify-center shrink-0">
                                                        <PenLine size={16} className="text-aira-cyan" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-aira-cyan transition-colors">
                                                                {topic.title}
                                                            </h3>
                                                        </div>
                                                        {topic.description && (
                                                            <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                                                {topic.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                                <span className="text-[11px] font-mono text-slate-500">
                                                    {topic._count?.posts || 0} articles
                                                </span>
                                                <span className="text-[11px] text-aira-cyan font-medium group-hover:translate-x-1 flex items-center gap-1 transition-transform">
                                                    Start Writing &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── My Posts Tab ── */}
            {activeTab === "My Posts" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)
                    ) : myPosts.length === 0 ? (
                        <div className="glass rounded-2xl p-8 text-center border border-white/10">
                            <FileText size={36} className="mx-auto mb-3 text-slate-600" />
                            <p className="text-slate-400 text-sm">You haven&apos;t written any posts yet.</p>
                            <button onClick={() => setActiveTab("Write")} className="mt-3 text-aira-cyan text-sm hover:underline">
                                Start writing →
                            </button>
                        </div>
                    ) : (
                        myPosts.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
                            >
                                {post.coverImage ? (
                                    <img src={post.coverImage} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                                ) : (
                                    <div className="w-16 h-12 rounded-lg bg-aira-purple/30 flex items-center justify-center shrink-0">
                                        <BookOpen size={18} className="text-purple-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-medium text-sm text-white truncate">{post.title}</h3>
                                        <StatusBadge status={post.status} />
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {post.topic?.title} &nbsp;•&nbsp; {post.readTime ?? "5 min"} &nbsp;•&nbsp;
                                        {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <Link
                                    href={`/portal/blog/write/${post.topicId}?edit=${post.id}`}
                                    className="shrink-0 px-3 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:border-aira-cyan/30 transition-all"
                                >
                                    Edit
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* ── Community Feed Tab ── */}
            {activeTab === "Community Feed" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl h-24 animate-pulse" />)
                    ) : feed.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">No published articles yet.</div>
                    ) : (
                        feed.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link href={`/blog/${post.id}`}>
                                    <div className="glass rounded-xl border border-white/10 p-4 flex items-center gap-4 hover:border-aira-cyan/30 transition-all group">
                                        {post.coverImage ? (
                                            <img src={post.coverImage} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                                        ) : (
                                            <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-purple-900/60 to-aira-bg flex items-center justify-center shrink-0">
                                                <BookOpen size={18} className="text-purple-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm text-white group-hover:text-aira-cyan transition-colors truncate">{post.title}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                                                <span className="flex items-center gap-1"><Users size={10} /> {post.author?.name}</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime ?? "5 min"}</span>
                                                {post._count?.reviews > 0 && (
                                                    <span className="flex items-center gap-1"><Star size={10} className="text-aira-gold" /> {post._count.reviews}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* ══ CREATE TOPIC MODAL ══ */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg glass-strong rounded-2xl border border-white/15 p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                                        <Plus size={16} />
                                    </div>
                                    <h2 className="font-orbitron font-bold text-lg text-white">Create Blog Topic</h2>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTopic} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                                        Topic Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Autonomous Ground Vehicles & ROS2"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 text-sm"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-300 font-medium mb-1.5 block">
                                        Description / Writing Guidance (Optional)
                                    </label>
                                    <textarea
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        placeholder="Briefly explain what this topic is about or suggest key areas for authors to explore..."
                                        rows={3}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 text-sm resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 rounded-xl glass border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creatingTopic || !newTitle.trim()}
                                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-bold text-xs font-orbitron tracking-wider shadow-md hover:shadow-sky-400/30 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {creatingTopic ? (
                                            <>
                                                <Loader2 size={13} className="animate-spin" />
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={13} />
                                                <span>Create Topic</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
