"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    User,
    BookOpen,
    Share2,
    Globe2,
    Maximize2,
    Minimize2,
    Type,
    Printer,
    Sparkles,
    Check,
    Copy,
    X,
    QrCode,
    Layers,
    ListFilter
} from "lucide-react";
import toast from "react-hot-toast";
import MediumArticleContent from "@/components/ui/MediumArticleContent";

function WorldwideShareModal({ mag, onClose }: { mag: any; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    if (!mag) return null;

    const url = typeof window !== "undefined" ? window.location.href : `https://aira-lab.in/magazine/${mag.id}`;
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
                className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center"
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
                            <h3 className="font-orbitron font-bold text-base text-white">Share Publication</h3>
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
                                <p className="text-xs font-bold text-white font-orbitron">Scan &amp; Read Worldwide</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Quick access for symposium &amp; conference delegates</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function MagazineReaderPage() {
    const { id }        = useParams<{ id: string }>();
    const router        = useRouter();
    const [mag, setMag] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // -1 = Cover & Table of Contents spread, >=0 = Specific Article
    const [pageIdx, setPageIdx] = useState<number>(-1);
    const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");
    const [showShare, setShowShare] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTocMobile, setShowTocMobile] = useState(false);

    useEffect(() => {
        fetch(`/api/magazine/${id}`)
            .then(r => r.json())
            .then(d => { if (d.id) setMag(d); })
            .finally(() => setLoading(false));
    }, [id]);

    // Keyboard navigation (ArrowLeft / ArrowRight)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!mag?.posts?.length) return;
            const total = mag.posts.length;
            if (e.key === "ArrowRight") {
                setPageIdx((curr) => Math.min(total - 1, curr + 1));
            } else if (e.key === "ArrowLeft") {
                setPageIdx((curr) => Math.max(-1, curr - 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mag]);

    if (loading) {
        return (
            <div className="min-h-screen pt-28 px-4 max-w-5xl mx-auto">
                <div className="glass rounded-3xl h-[75vh] animate-pulse border border-white/10" />
            </div>
        );
    }

    if (!mag) {
        return (
            <div className="min-h-screen pt-28 text-center text-slate-400 px-4">
                <p className="font-orbitron text-2xl text-white font-bold">Publication Edition Not Found</p>
                <Link href="/magazine" className="text-aira-cyan underline mt-4 inline-block font-medium">
                    ← Return to Magazine Shelf
                </Link>
            </div>
        );
    }

    const articles: any[] = mag.posts?.map((mp: any) => mp.post) ?? [];
    const current = pageIdx >= 0 ? articles[pageIdx] ?? null : null;
    const progressPercent = pageIdx === -1 ? 0 : Math.round(((pageIdx + 1) / articles.length) * 100);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-20 bg-[#030208] text-white relative">
            {/* Top Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
                <div
                    className="h-full bg-gradient-to-r from-aira-magenta via-purple-500 to-aira-cyan transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* ── Magazine Header Command Bar ── */}
            <header className="sticky top-0 z-50 glass-strong border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/magazine")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                    >
                        <ArrowLeft size={14} />
                        <span className="hidden sm:inline">Shelf</span>
                    </button>

                    <div className="hidden md:block">
                        <p className="font-orbitron font-bold text-xs sm:text-sm text-white truncate max-w-xs">{mag.title}</p>
                        <p className="text-[10px] text-pink-400 font-mono">{mag.edition}</p>
                    </div>
                </div>

                {/* Center Page Navigator */}
                <div className="flex items-center gap-2">
                    <button
                        disabled={pageIdx <= -1}
                        onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Previous Article (Left Arrow)"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => setPageIdx(-1)}
                        className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all ${
                            pageIdx === -1
                                ? "bg-aira-magenta text-white shadow-md shadow-pink-500/25"
                                : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                    >
                        {pageIdx === -1 ? "📖 Cover & Index" : `Page ${pageIdx + 1} / ${articles.length}`}
                    </button>

                    <button
                        disabled={pageIdx >= articles.length - 1}
                        onClick={() => setPageIdx((curr) => Math.min(articles.length - 1, curr + 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Next Article (Right Arrow)"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Right Action Suite */}
                <div className="flex items-center gap-2">
                    {/* Font Adjuster */}
                    <button
                        onClick={() => {
                            setFontSize((curr) => (curr === "normal" ? "large" : curr === "large" ? "extra" : "normal"));
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Adjust Font Size"
                    >
                        <Type size={15} />
                    </button>

                    {/* Share Worldwide Button */}
                    <button
                        onClick={() => setShowShare(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-aira-magenta to-purple-600 text-white font-orbitron font-bold text-xs hover:scale-105 transition-all shadow-md shadow-pink-500/20"
                    >
                        <Globe2 size={14} />
                        <span className="hidden sm:inline">Share Worldwide</span>
                    </button>
                </div>
            </header>

            {/* ── Main Magazine Body ── */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* ══ SIDEBAR TABLE OF CONTENTS ══ */}
                <aside className="lg:w-72 shrink-0">
                    <div className="glass rounded-3xl border border-white/10 p-5 sticky top-24 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <span className="font-orbitron text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers size={14} className="text-aira-magenta" /> Edition Index
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{articles.length} Articles</span>
                        </div>

                        {/* Cover Page Button */}
                        <button
                            onClick={() => setPageIdx(-1)}
                            className={`w-full text-left p-3 rounded-2xl text-xs font-orbitron font-bold transition-all flex items-center gap-2.5 ${
                                pageIdx === -1
                                    ? "bg-gradient-to-r from-aira-magenta/30 to-purple-600/30 border border-aira-magenta/50 text-white shadow-lg"
                                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                            }`}
                        >
                            <span>⭐</span>
                            <div className="truncate">
                                <p className="leading-tight">Executive Cover Spread</p>
                                <span className="text-[10px] font-normal text-slate-400 font-sans">Volume Abstract &amp; Credits</span>
                            </div>
                        </button>

                        {/* Article Items */}
                        <nav className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                            {articles.map((art: any, i: number) => {
                                const isSelected = pageIdx === i;
                                return (
                                    <button
                                        key={art.id}
                                        onClick={() => setPageIdx(i)}
                                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 border ${
                                            isSelected
                                                ? "bg-aira-cyan/15 border-aira-cyan/40 text-white shadow-md"
                                                : "bg-white/[0.02] border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <span className="font-orbitron font-bold text-[11px] text-aira-magenta mt-0.5 shrink-0">
                                            #{String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold line-clamp-2 leading-snug">{art.title}</p>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">by {art.author?.name || "AiRA Researcher"}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* ══ MAIN ARTICLE / COVER SPREAD VIEWER ══ */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {pageIdx === -1 ? (
                            /* ── EXECUTIVE PUBLICATION COVER SPREAD (PAGE 0) ── */
                            <motion.div
                                key="cover-spread"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                    {/* Cover Card Visual */}
                                    <div className="md:col-span-5 relative group">
                                        <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border-2 border-aira-magenta/40 shadow-2xl shadow-pink-500/20 relative">
                                            {mag.coverImage ? (
                                                <img
                                                    src={mag.coverImage}
                                                    alt={mag.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950">
                                                    <span className="font-orbitron font-black text-6xl text-white/20">AiRA</span>
                                                    <span className="font-orbitron text-xs text-pink-400 mt-2 font-bold tracking-widest">{mag.edition}</span>
                                                </div>
                                            )}

                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-orbitron font-bold text-pink-300 border border-pink-500/30">
                                                ⭐ {mag.edition}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Editorial Abstract & Details */}
                                    <div className="md:col-span-7 space-y-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aira-cyan/15 border border-aira-cyan/30 text-aira-cyan text-[11px] font-orbitron font-bold uppercase">
                                            <Globe2 size={13} /> Official Lab Periodic Publication
                                        </div>

                                        <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white leading-tight">
                                            {mag.title}
                                        </h1>

                                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                                            {mag.description ||
                                                "Welcome to this curated edition of AiRA Magazine — presenting high-impact technical articles, student engineering milestones, and research methodologies developed within the Artificial Intelligence & Robotics Association."}
                                        </p>

                                        {/* Metadata Row */}
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                                <span className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider block">Articles Included</span>
                                                <p className="font-orbitron font-bold text-lg text-white mt-0.5">{articles.length} Works</p>
                                            </div>
                                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                                <span className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider block">Publication Date</span>
                                                <p className="font-orbitron font-bold text-lg text-pink-400 mt-0.5">
                                                    {mag.publishedAt
                                                        ? new Date(mag.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                                                        : "Live Edition"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-wrap items-center gap-3">
                                            <button
                                                disabled={articles.length === 0}
                                                onClick={() => setPageIdx(0)}
                                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-aira-magenta via-pink-500 to-purple-600 text-white font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-pink-500/25 cursor-pointer disabled:opacity-40"
                                            >
                                                <span>Open &amp; Read Issue #1</span>
                                                <ChevronRight size={16} />
                                            </button>

                                            <button
                                                onClick={() => setShowShare(true)}
                                                className="px-5 py-3 rounded-2xl glass border border-white/15 text-slate-200 hover:text-white font-orbitron font-semibold text-xs flex items-center gap-2 hover:border-aira-cyan/40 transition-all cursor-pointer"
                                            >
                                                <Share2 size={15} />
                                                <span>Share Worldwide</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : current ? (
                            /* ── INDIVIDUAL ARTICLE SPREAD ── */
                            <motion.article
                                key={current.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.35 }}
                                className="glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl"
                            >
                                {/* Cover Photo */}
                                {current.coverImage && (
                                    <div className="relative aspect-[16/7] w-full overflow-hidden">
                                        <img src={current.coverImage} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    </div>
                                )}

                                <div className="p-6 sm:p-10">
                                    {/* Topic + Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-aira-cyan/20 text-aira-cyan text-xs font-orbitron font-bold border border-aira-cyan/30">
                                            {current.topic?.title || "AiRA Research"}
                                        </span>
                                        {current.tags?.map((t: string) => (
                                            <span key={t} className="px-2.5 py-1 rounded-full bg-purple-950/60 text-purple-300 text-[11px] font-mono border border-purple-800/40">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>

                                    <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-white mb-5 leading-tight tracking-tight">
                                        {current.title}
                                    </h1>

                                    {/* Author & Meta Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 mb-8 pb-6 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            {current.author?.avatar ? (
                                                <img src={current.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-aira-cyan to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                                                    {current.author?.name?.[0] || "A"}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-bold text-sm">{current.author?.name || "AiRA Contributor"}</p>
                                                <span className="text-[11px] text-slate-400">Researcher · AiRA Lab</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-slate-300">
                                                <Clock size={13} className="text-aira-cyan" /> {current.readTime ?? "5 min read"}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-pink-300 font-mono font-bold">
                                                Article #{pageIdx + 1} of {articles.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Article Typography Body */}
                                    <div className={`mb-10 ${
                                        fontSize === "large" ? "text-lg leading-relaxed" : fontSize === "extra" ? "text-xl leading-loose" : "text-base leading-relaxed"
                                    }`}>
                                        <MediumArticleContent content={current.content} />
                                    </div>

                                    {/* Navigation Footer */}
                                    <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                                        <button
                                            onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))}
                                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all"
                                        >
                                            <ChevronLeft size={15} />
                                            <span>{pageIdx === 0 ? "Executive Cover Spread" : "Previous Article"}</span>
                                        </button>

                                        {pageIdx < articles.length - 1 ? (
                                            <button
                                                onClick={() => setPageIdx((curr) => curr + 1)}
                                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aira-magenta to-pink-500 text-white text-xs font-orbitron font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md shadow-pink-500/20"
                                            >
                                                <span>Next Article (#{pageIdx + 2})</span>
                                                <ChevronRight size={15} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setPageIdx(-1)}
                                                className="px-4 py-2 rounded-xl bg-aira-cyan text-slate-950 text-xs font-orbitron font-bold flex items-center gap-1.5"
                                            >
                                                <span>Back to Magazine Cover</span>
                                                <Sparkles size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        ) : (
                            <div className="glass rounded-3xl border border-white/10 p-12 text-center text-slate-500">
                                <BookOpen size={48} className="mx-auto mb-3 opacity-30 text-aira-magenta" />
                                <p className="font-orbitron text-sm">No articles in this edition yet.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Worldwide Share Modal */}
            <WorldwideShareModal mag={mag} onClose={() => setShowShare(false)} />
        </div>
    );
}
