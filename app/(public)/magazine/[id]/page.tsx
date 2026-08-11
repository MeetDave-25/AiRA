"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Clock, User, BookOpen } from "lucide-react";
import MediumArticleContent from "@/components/ui/MediumArticleContent";

export default function MagazineReaderPage() {
    const { id }        = useParams<{ id: string }>();
    const router        = useRouter();
    const [mag, setMag] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [articleIdx, setArticleIdx] = useState(0);

    useEffect(() => {
        fetch(`/api/magazine/${id}`)
            .then(r => r.json())
            .then(d => { if (d.id) setMag(d); })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="min-h-screen pt-28 px-4 max-w-5xl mx-auto"><div className="glass rounded-3xl h-[70vh] animate-pulse" /></div>;
    if (!mag) return <div className="min-h-screen pt-28 text-center text-slate-400"><p className="font-orbitron text-2xl">Magazine not found</p><Link href="/magazine" className="text-aira-cyan underline mt-4 inline-block">← Magazine Shelf</Link></div>;

    const articles: any[] = mag.posts?.map((mp: any) => mp.post) ?? [];
    const current = articles[articleIdx] ?? null;

    const avgRating = (reviews: any[]) => reviews?.length
        ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

    return (
        <div className="min-h-screen pt-20 pb-16 bg-[#030208]">
            {/* ── Magazine Header Bar ── */}
            <div className="sticky top-0 z-50 glass-strong border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
                    <ArrowLeft size={15} /> Shelf
                </button>
                <div className="text-center">
                    <p className="font-orbitron font-bold text-sm text-white">{mag.title}</p>
                    <p className="text-[10px] text-aira-magenta">{mag.edition}</p>
                </div>
                <p className="text-[11px] text-slate-400">{articleIdx + 1} / {articles.length}</p>
            </div>

            {/* ── Table of Contents sidebar + Article ── */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* TOC */}
                <aside className="lg:w-64 shrink-0">
                    <div className="glass rounded-2xl border border-white/10 p-4 sticky top-20">
                        <p className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contents</p>
                        <nav className="space-y-1">
                            {articles.map((art: any, i: number) => (
                                <button
                                    key={art.id}
                                    onClick={() => setArticleIdx(i)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${i === articleIdx
                                        ? "bg-aira-magenta/20 text-white border border-aira-magenta/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                                >
                                    <span className="text-[10px] text-aira-magenta font-mono mr-1.5">{String(i + 1).padStart(2, "0")}.</span>
                                    <span className="line-clamp-2">{art.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Article Viewer */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {current ? (
                            <motion.article
                                key={current.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35 }}
                                className="glass rounded-3xl border border-white/10 overflow-hidden"
                            >
                                {/* Cover */}
                                {current.coverImage && (
                                    <div className="relative aspect-[16/7]">
                                        <img src={current.coverImage} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-aira-card via-transparent to-transparent" />
                                    </div>
                                )}

                                <div className="p-6 sm:p-8">
                                    {/* Topic + Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded-full bg-aira-cyan/20 text-aira-cyan text-[10px] font-orbitron border border-aira-cyan/30">
                                            {current.topic?.title}
                                        </span>
                                        {current.tags?.map((t: string) => (
                                            <span key={t} className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 text-[10px] font-mono">#{t}</span>
                                        ))}
                                    </div>

                                    <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-4 leading-snug">{current.title}</h1>

                                    {/* Author + Meta */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-7 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                            {current.author?.avatar ? (
                                                <img src={current.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-aira-purple flex items-center justify-center text-sm font-bold text-white">
                                                    {current.author?.name?.[0]}
                                                </div>
                                            )}
                                            <p className="text-white text-sm">{current.author?.name}</p>
                                        </div>
                                        <span className="flex items-center gap-1"><Clock size={13} /> {current.readTime ?? "5 min"}</span>
                                        {avgRating(current.reviews) && (
                                            <span className="flex items-center gap-1 text-aira-gold">
                                                <Star size={13} fill="currentColor" /> {avgRating(current.reviews)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content (Medium-style Typography & Spacing) */}
                                    <div className="mb-10">
                                        <MediumArticleContent content={current.content} />
                                    </div>

                                    {/* Read full article link */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <Link href={`/blog/${current.id}`} className="text-aira-cyan text-sm hover:underline flex items-center gap-1.5">
                                            <BookOpen size={14} /> Read full article with reviews →
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ) : (
                            <div className="glass rounded-3xl border border-white/10 flex items-center justify-center h-64 text-slate-500">
                                No articles in this edition yet.
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Prev / Next buttons */}
                    {articles.length > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={() => setArticleIdx(i => Math.max(0, i - 1))}
                                disabled={articleIdx === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <button
                                onClick={() => setArticleIdx(i => Math.min(articles.length - 1, i + 1))}
                                disabled={articleIdx === articles.length - 1}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-sm text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
