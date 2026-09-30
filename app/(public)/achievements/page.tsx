"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { BLOCK_COLORS, Btn, EASE, Empty, PageHero, SkeletonCard, Tag, WRAP } from "@/components/nb/kit";

const DEFAULT_ACHIEVEMENTS = [
    {
        id: "ach-1",
        title: "1st Place - National Autonomous Robotics Championship 2025",
        category: "Hackathon Champion",
        description: "Secured overall 1st rank for designing a custom LiDAR-guided autonomous rover capable of real-time SLAM mapping and dynamic obstacle avoidance.",
        createdAt: "2025-11-20T00:00:00Z",
    },
    {
        id: "ach-2",
        title: "Best Innovation Award - AI Research & Neural Systems Symposia",
        category: "Research Excellence",
        description: "Awarded Best Machine Learning Research Paper for optimizing edge-AI YOLOv8 inference engines running at 60 FPS on embedded hardware.",
        createdAt: "2025-09-14T00:00:00Z",
    },
    {
        id: "ach-3",
        title: "Top 3 Finalists - Inter-Collegiate Cyber Firmware Defense Sprint",
        category: "Cyber Security",
        description: "Recognized for hardening microcontroller firmware against side-channel analysis and establishing zero-trust IoT telemetry protocols.",
        createdAt: "2025-06-05T00:00:00Z",
    },
];

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>(DEFAULT_ACHIEVEMENTS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/achievements")
            .then((r) => r.ok ? r.json() : [])
            .then((d) => {
                if (Array.isArray(d) && d.length > 0) {
                    setAchievements(d);
                }
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, []);

    return (
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Our pride"
                title="Achievements."
                says="Every trophy here was won by students from our community. Not bad, right?"
                desc="The wins, awards and recognitions earned by AiRA Lab members — from hackathon podiums to research honours."
            />

            <div className={WRAP}>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : achievements.length === 0 ? (
                    <Empty icon={<Trophy size={24} />} title="No achievements yet" desc="Our first trophy is on its way.">
                        <Btn href="/projects" tone="white">See our projects</Btn>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((ach, i) => (
                            <motion.article
                                key={ach.id}
                                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
                                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
                                whileHover={{ rotate: 0, y: -4 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.55, ease: EASE, delay: (i % 3) * 0.08 }}
                                className={`rounded-[22px] border-2 border-nb-ink shadow-nb-lg overflow-hidden ${BLOCK_COLORS[i % BLOCK_COLORS.length]}`}
                            >
                                {ach.image && (
                                    <div className="h-44 border-b-2 border-nb-ink overflow-hidden bg-white">
                                        <img
                                            src={ach.image}
                                            alt={ach.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="w-14 h-14 shrink-0 rounded-2xl border-2 border-nb-ink bg-white flex items-center justify-center text-3xl shadow-nb-sm">
                                            {ach.icon || "🏆"}
                                        </span>
                                        {ach.category && <Tag>{ach.category}</Tag>}
                                    </div>
                                    <h3 className="mt-5 font-brico font-extrabold text-xl tracking-tight leading-snug">{ach.title}</h3>
                                    {ach.description && <p className="mt-2 text-nb-ink/75 text-sm leading-relaxed line-clamp-4">{ach.description}</p>}
                                    {ach.date && (
                                        <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-nb-ink/70">
                                            <Calendar size={12} /> {formatDateShort(ach.date)}
                                        </p>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
