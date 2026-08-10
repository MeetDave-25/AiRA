"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { PenLine, BookOpen, Users, Clock, Star, CheckCircle, XCircle, FileText } from "lucide-react";

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

    useEffect(() => {
        fetch("/api/blog/topics").then(r => r.json()).then(d => setTopics(Array.isArray(d) ? d : []));
    }, []);

    useEffect(() => {
        if (activeTab === "My Posts" && session) {
            setLoading(true);
            fetch("/api/blog/posts/mine")
                .then(r => r.json())
                .then(d => setMyPosts(Array.isArray(d) ? d : []))
                .finally(() => setLoading(false));
        }
        if (activeTab === "Community Feed") {
            setLoading(true);
            fetch("/api/blog/posts")
                .then(r => r.json())
                .then(d => setFeed(Array.isArray(d) ? d : []))
                .finally(() => setLoading(false));
        }
    }, [activeTab, session]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl text-white">Blog</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Write, share, and read community articles</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-0">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === tab
                            ? "bg-aira-card text-aira-cyan border border-aira-cyan/30 border-b-aira-card -mb-px"
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
                    <p className="text-slate-400 text-sm">Choose a topic assigned by admin to start writing:</p>
                    {topics.length === 0 ? (
                        <div className="glass rounded-2xl p-8 text-center border border-white/10">
                            <PenLine size={36} className="mx-auto mb-3 text-slate-600" />
                            <p className="text-slate-400 font-orbitron text-sm">No writing topics yet.</p>
                            <p className="text-slate-500 text-xs mt-1">Ask the admin to create blog topics for you to write about.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {topics.map((topic: any, i: number) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Link href={`/portal/blog/write/${topic.id}`}>
                                        <div className="glass rounded-2xl p-5 border border-white/10 hover:border-aira-cyan/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                            <div className="flex items-start gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-aira-cyan/20 border border-aira-cyan/30 flex items-center justify-center shrink-0">
                                                    <PenLine size={16} className="text-aira-cyan" />
                                                </div>
                                                <div>
                                                    <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-aira-cyan transition-colors">
                                                        {topic.title}
                                                    </h3>
                                                    {topic.description && (
                                                        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{topic.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-end">
                                                <span className="text-[11px] text-aira-cyan font-medium group-hover:gap-2 flex items-center gap-1 transition-all">
                                                    Start Writing →
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
        </div>
    );
}
