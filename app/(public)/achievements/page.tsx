"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/achievements")
            .then((r) => r.ok ? r.json() : [])
            .then((d) => { setAchievements(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => { setAchievements([]); setLoading(false); });
    }, []);

    return (
        <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto min-h-screen">
            {/* Header */}
            <div className="text-center mb-16">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-aira-gold font-medium text-sm mb-2 font-orbitron tracking-widest uppercase"
                >
                    Our Pride
                </motion.p>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-orbitron font-black text-5xl text-white mb-4"
                >
                    <span className="gradient-text">Achievements</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 max-w-xl mx-auto"
                >
                    Celebrating the milestones, recognitions, and successes that define AiRA Lab&apos; journey of excellence.
                </motion.p>
            </div>

            {loading ? (
                <div className="flex justify-center h-64">
                    <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
                </div>
            ) : achievements.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No achievements yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((ach, i) => (
                        <motion.div
                            key={ach.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="glass rounded-2xl p-6 card-3d border border-aira-gold/20 hover:border-aira-gold/50 transition-all group"
                        >
                            {/* Image */}
                            {ach.image && (
                                <div className="rounded-xl overflow-hidden h-40 mb-4">
                                    <img src={ach.image} alt={ach.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="text-4xl shrink-0">{ach.icon || "🏆"}</div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-orbitron font-bold text-sm text-white leading-tight">{ach.title}</h3>
                                    </div>
                                    {ach.category && (
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-aira-gold/10 text-aira-gold border border-aira-gold/20 mb-2">
                                            {ach.category}
                                        </span>
                                    )}
                                    {ach.description && (
                                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{ach.description}</p>
                                    )}
                                    {ach.date && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                                            <Calendar size={11} className="text-aira-gold" />
                                            {formatDateShort(ach.date)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
