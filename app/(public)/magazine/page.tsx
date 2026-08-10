"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Calendar } from "lucide-react";

export default function MagazinePage() {
    const [magazines, setMagazines] = useState<any[]>([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        fetch("/api/magazine")
            .then(r => r.json())
            .then(d => setMagazines(Array.isArray(d) ? d : []))
            .catch(() => setMagazines([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <p className="font-orbitron text-[11px] tracking-[0.4em] text-aira-magenta uppercase mb-2">Digital Publication</p>
                <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4">
                    AiRA <span className="gradient-text-magenta">Magazine</span>
                </h1>
                <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
                    Curated editions of our best community blog posts — selected and compiled by the AiRA Lab team.
                </p>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-3xl h-96 animate-pulse" />)}
                </div>
            ) : magazines.length === 0 ? (
                <div className="text-center py-24 text-slate-500">
                    <BookOpen size={56} className="mx-auto mb-4 opacity-20" />
                    <p className="font-orbitron text-lg">No editions published yet.</p>
                    <p className="text-sm mt-1">Check back soon for the first AiRA Lab Magazine!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {magazines.map((mag: any, i: number) => (
                        <motion.div
                            key={mag.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <Link href={`/magazine/${mag.id}`} className="block group">
                                {/* Magazine Cover */}
                                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-purple-900 via-aira-card to-aira-bg border border-white/10 group-hover:border-aira-magenta/40 transition-all duration-300 shadow-xl group-hover:shadow-aira-magenta/20 group-hover:-translate-y-2">
                                    {mag.coverImage ? (
                                        <img
                                            src={mag.coverImage}
                                            alt={mag.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                            <div className="text-7xl font-orbitron font-black text-white/10 select-none">
                                                AiRA
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/40 via-transparent to-pink-900/40" />
                                        </div>
                                    )}

                                    {/* Overlay text */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                                        <div className="space-y-2">
                                            <span className="inline-block px-2 py-0.5 rounded bg-aira-magenta/80 text-white text-[10px] font-orbitron font-bold tracking-wider">
                                                {mag.edition}
                                            </span>
                                            <h2 className="font-orbitron font-black text-base text-white leading-snug group-hover:text-aira-magenta transition-colors">
                                                {mag.title}
                                            </h2>
                                            {mag.description && (
                                                <p className="text-slate-400 text-[11px] line-clamp-2">{mag.description}</p>
                                            )}
                                            <div className="flex items-center justify-between pt-1">
                                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <BookOpen size={11} />
                                                    {mag.posts?.length ?? 0} articles
                                                </span>
                                                {mag.publishedAt && (
                                                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                                        <Calendar size={11} />
                                                        {new Date(mag.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                                    </span>
                                                )}
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
