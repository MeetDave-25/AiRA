"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, BookOpen, Star, Clock, User } from "lucide-react";

export default function BlogPage() {
    const [posts, setPosts]     = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [tag, setTag]         = useState("");

    useEffect(() => {
        const url = tag ? `/api/blog/posts?tag=${encodeURIComponent(tag)}` : "/api/blog/posts";
        setLoading(true);
        fetch(url)
            .then(r => r.json())
            .then(d => setPosts(Array.isArray(d) ? d : []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [tag]);

    const allTags = Array.from(new Set(posts.flatMap((p: any) => p.tags ?? [])));

    const filtered = posts.filter((p: any) =>
        search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
    );

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
            {/* ── Hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <p className="text-aira-cyan font-orbitron text-xs tracking-widest uppercase mb-2">Community</p>
                <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4">
                    AiRA <span className="gradient-text">Blog</span>
                </h1>
                <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                    Insights, research notes, and innovation stories written by AiRA Lab members.
                </p>
            </motion.div>

            {/* ── Search + Tag filters ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-9 pr-4 py-2.5 bg-aira-card border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setTag("")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!tag ? "bg-aira-cyan text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                    >
                        All
                    </button>
                    {allTags.slice(0, 8).map(t => (
                        <button
                            key={t}
                            onClick={() => setTag(t === tag ? "" : t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tag === t ? "bg-aira-purple text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                        >
                            #{t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass rounded-2xl h-72 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 text-slate-500">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-orbitron">No articles found yet.</p>
                    <p className="text-sm mt-1">Be the first to publish — login and write a blog!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((post: any, i: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                        >
                            <Link href={`/blog/${post.id}`} className="block group">
                                <div className="glass border border-white/8 rounded-2xl overflow-hidden hover:border-aira-cyan/30 transition-all duration-300 hover:shadow-lg hover:shadow-aira-cyan/10 hover:-translate-y-1">
                                    {/* Cover */}
                                    <div className="relative aspect-[16/9] bg-gradient-to-br from-purple-900/50 to-aira-bg overflow-hidden">
                                        {post.coverImage ? (
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen size={40} className="text-purple-500/40" />
                                            </div>
                                        )}
                                        {/* Topic badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2 py-1 rounded-full bg-aira-cyan/20 text-aira-cyan text-[10px] font-orbitron font-bold border border-aira-cyan/30 backdrop-blur-sm">
                                                {post.topic?.title}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4">
                                        <h2 className="font-orbitron font-bold text-sm text-white line-clamp-2 group-hover:text-aira-cyan transition-colors mb-2">
                                            {post.title}
                                        </h2>

                                        {/* Tags */}
                                        {post.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {post.tags.slice(0, 3).map((t: string) => (
                                                    <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-purple-900/40 text-purple-300 font-mono">
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                {post.author?.avatar ? (
                                                    <img src={post.author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-aira-purple/60 flex items-center justify-center text-[9px] text-white font-bold">
                                                        {post.author?.name?.[0]}
                                                    </div>
                                                )}
                                                <span className="truncate max-w-[80px]">{post.author?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {post._count?.reviews > 0 && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Star size={10} className="text-aira-gold" />
                                                        {post._count.reviews}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-0.5">
                                                    <Clock size={10} />
                                                    {post.readTime ?? "5 min"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
