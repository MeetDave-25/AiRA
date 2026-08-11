"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Calendar,
    Share2,
    Globe2,
    Sparkles,
    Search,
    ExternalLink,
    ChevronRight,
    QrCode,
    Check,
    Copy,
    X,
    Layers
} from "lucide-react";
import toast from "react-hot-toast";

function ShareModal({ mag, onClose }: { mag: any; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    if (!mag) return null;

    const url = typeof window !== "undefined" ? `${window.location.origin}/magazine/${mag.id}` : `https://aira-lab.in/magazine/${mag.id}`;
    const shareText = `Read "${mag.title}" (${mag.edition}) - Official AiRA Lab Digital Magazine Publication:`;

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Publication link copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    className="glass-strong rounded-3xl border border-white/20 p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                        <div className="flex items-center gap-2">
                            <Globe2 className="text-aira-cyan" size={18} />
                            <h3 className="font-orbitron font-bold text-base text-white">Share Worldwide</h3>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="font-orbitron font-bold text-sm text-white">{mag.title}</p>
                            <p className="text-xs text-aira-magenta">{mag.edition}</p>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                            >
                                WhatsApp
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0077b5]/20 border border-[#0077b5]/40 text-blue-300 text-xs font-semibold hover:bg-[#0077b5]/30 transition-all"
                            >
                                LinkedIn
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                            >
                                X / Twitter
                            </a>
                            <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-semibold hover:bg-sky-500/30 transition-all"
                            >
                                Telegram
                            </a>
                        </div>

                        {/* Copy Link Input */}
                        <div className="pt-2">
                            <label className="text-[11px] text-slate-400 block mb-1.5 font-mono">Direct Publication URL</label>
                            <div className="flex items-center gap-2 bg-slate-900 rounded-xl border border-white/10 p-1.5">
                                <input
                                    type="text"
                                    readOnly
                                    value={url}
                                    className="bg-transparent text-xs text-slate-300 px-2 flex-1 outline-none font-mono"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-1.5 rounded-lg bg-aira-cyan text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform"
                                >
                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="pt-2 flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/10">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}&color=00D4FF&bgcolor=0a0f1d`}
                                alt="QR Code"
                                className="w-16 h-16 rounded-xl border border-aira-cyan/30"
                            />
                            <div>
                                <p className="text-xs font-bold text-white font-orbitron">Scan &amp; Read on Mobile</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Share with attendees at tech conferences &amp; symposiums</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function MagazinePage() {
    const [magazines, setMagazines] = useState<any[]>([]);
    const [loading, setLoading]     = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [shareMag, setShareMag] = useState<any | null>(null);

    useEffect(() => {
        fetch("/api/magazine")
            .then(r => r.json())
            .then(d => setMagazines(Array.isArray(d) ? d : []))
            .catch(() => setMagazines([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredMagazines = magazines.filter((m) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (m.title || "").toLowerCase().includes(q) ||
            (m.edition || "").toLowerCase().includes(q) ||
            (m.description || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-aira-magenta/15 via-purple-600/10 to-aira-cyan/15 blur-[120px] pointer-events-none" />

            {/* ══ HERO BANNER: WORLDWIDE DIGITAL PUBLICATION ══ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aira-magenta/15 border border-aira-magenta/30 text-pink-300 text-xs font-orbitron font-bold uppercase tracking-wider mb-4 shadow-lg shadow-pink-500/10">
                    <Globe2 size={13} className="text-aira-cyan animate-pulse" />
                    Worldwide Collegiate &amp; Research Publication
                </div>

                <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4 tracking-tight">
                    AiRA <span className="gradient-text-magenta">Magazine</span>
                </h1>

                <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8 font-sans">
                    Official digital periodicals and research volumes published by AiRA Lab — spotlighting breakthroughs in autonomous robotics, neural architectures, and student innovation.
                </p>

                {/* Search & Studio Links */}
                <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search magazine volumes, editions..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-magenta/50 transition-colors"
                        />
                    </div>

                    <Link
                        href="/portal/admin/magazine"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-aira-magenta via-purple-600 to-indigo-600 text-white font-orbitron font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-pink-500/20"
                    >
                        <span>📖 Magazine Studio (Curate)</span>
                    </Link>
                </div>
            </motion.div>

            {/* ══ MAGAZINE EDITIONS SHELF ══ */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass rounded-3xl h-[480px] animate-pulse border border-white/10" />
                    ))}
                </div>
            ) : filteredMagazines.length === 0 ? (
                <div className="text-center py-24 glass rounded-3xl border border-white/10 max-w-lg mx-auto p-8">
                    <BookOpen size={56} className="mx-auto mb-4 text-aira-magenta opacity-40" />
                    <p className="font-orbitron text-lg font-bold text-white">No editions published yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Use the Magazine Studio to curate articles into your first volume and publish it worldwide!
                    </p>
                    <Link
                        href="/portal/admin/magazine"
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-orbitron font-bold hover:bg-white/20"
                    >
                        Open Magazine Studio →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMagazines.map((mag: any, i: number) => (
                        <motion.div
                            key={mag.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="group relative"
                        >
                            {/* 3D Magazine Publication Card */}
                            <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-slate-950 border border-white/15 group-hover:border-aira-magenta/60 transition-all duration-300 shadow-2xl group-hover:shadow-[0_0_35px_rgba(255,0,128,0.25)] group-hover:-translate-y-2 flex flex-col justify-between">
                                {/* Magazine Cover Background Photo */}
                                {mag.coverImage ? (
                                    <img
                                        src={mag.coverImage}
                                        alt={mag.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 flex flex-col items-center justify-center">
                                        <div className="text-8xl font-orbitron font-black text-white/5 select-none">
                                            AiRA
                                        </div>
                                    </div>
                                )}

                                {/* Magazine Spine & Edge Highlight */}
                                <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/60 to-transparent pointer-events-none z-10" />

                                {/* Top Badges */}
                                <div className="relative z-20 p-5 flex items-center justify-between">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-pink-300 border border-pink-500/40 text-[10px] font-orbitron font-bold shadow-lg">
                                        ⭐ {mag.edition}
                                    </span>

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShareMag(mag);
                                        }}
                                        className="w-9 h-9 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-slate-300 hover:text-white hover:bg-aira-magenta hover:border-aira-magenta transition-all shadow-lg cursor-pointer"
                                        title="Share Worldwide"
                                    >
                                        <Share2 size={14} />
                                    </button>
                                </div>

                                {/* Bottom Dark Gradient & Title Details */}
                                <div className="relative z-20 p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-16">
                                    <h2 className="font-orbitron font-black text-xl text-white leading-snug group-hover:text-pink-300 transition-colors">
                                        {mag.title}
                                    </h2>

                                    {mag.description && (
                                        <p className="text-slate-300 text-xs line-clamp-2 mt-1.5 font-sans">
                                            {mag.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs text-slate-400">
                                        <span className="flex items-center gap-1 font-mono">
                                            <BookOpen size={12} className="text-aira-cyan" />
                                            {mag.posts?.length ?? 0} Articles
                                        </span>

                                        <Link
                                            href={`/magazine/${mag.id}`}
                                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-aira-magenta to-pink-500 text-white font-orbitron font-bold text-[11px] flex items-center gap-1 group-hover:scale-105 transition-transform shadow-md shadow-pink-500/25"
                                        >
                                            <span>Read Issue</span>
                                            <ChevronRight size={13} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Worldwide Share Modal */}
            <ShareModal mag={shareMag} onClose={() => setShareMag(null)} />
        </div>
    );
}
