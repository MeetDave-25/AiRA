"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Share2, Globe2, Type, Printer, Sparkles, Check, Copy, X, QrCode, Layers, Columns, Quote } from "lucide-react";
import toast from "react-hot-toast";
import MediumArticleContent from "@/components/ui/MediumArticleContent";
import { Btn, Button, Empty, SkeletonCard } from "@/components/nb/kit";

function WorldwideShareModal({ isOpen, mag, onClose }: { isOpen: boolean; mag: any; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

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

    const shareBtn = "flex items-center justify-center py-2.5 px-3 rounded-xl border-2 border-nb-ink font-brico font-bold text-sm shadow-nb-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-nb-ink/60 backdrop-blur-sm p-4 flex items-center justify-center no-print"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20, rotate: -2 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        className="rounded-[22px] border-2 border-nb-ink bg-nb-paper shadow-nb-lg p-6 sm:p-7 max-w-md w-full text-nb-ink"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 mb-5 border-b-2 border-nb-ink">
                            <h3 className="flex items-center gap-2 font-brico font-extrabold text-xl">
                                <Globe2 size={18} /> Share this issue
                            </h3>
                            <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} title="Close" className="p-1.5 rounded-lg border-2 border-nb-ink bg-white">
                                <X size={16} />
                            </button>
                        </div>
                        <p className="font-brico font-bold">{mag.title}</p>
                        <p className="font-mono text-xs text-nb-violet">{mag.edition}</p>
                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}`} target="_blank" rel="noopener noreferrer" className={`${shareBtn} bg-nb-mint`}>WhatsApp</a>
                            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={`${shareBtn} bg-nb-sky`}>LinkedIn</a>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={`${shareBtn} bg-white`}>X / Twitter</a>
                            <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className={`${shareBtn} bg-nb-lilac`}>Telegram</a>
                        </div>
                        <label className="mt-5 block font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted mb-1.5">Direct link</label>
                        <div className="flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white p-1.5">
                            <input type="text" readOnly value={url} className="bg-transparent text-xs px-2 flex-1 outline-none font-mono min-w-0" />
                            <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg border-2 border-nb-ink bg-nb-sun font-bold text-xs flex items-center gap-1.5">
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                        <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-nb-ink bg-white p-3">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}&color=111111&bgcolor=ffffff`}
                                alt="QR code"
                                className="w-16 h-16 rounded-lg border-2 border-nb-ink"
                            />
                            <div>
                                <p className="font-brico font-bold">Scan &amp; read on mobile</p>
                                <p className="text-xs text-nb-muted">Great for sharing at events and conferences.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function CoverDiamondCollage({ articles, edition }: { articles: any[]; edition: string }) {
    const sampleImages = useMemo(() => {
        const extracted = articles.map((a) => a.coverImage).filter(Boolean);
        // Real article covers only; empty slots become plain brand-colour tiles.
        return Array.from({ length: 6 }, (_, i) => (extracted[i] as string | undefined) ?? null);
    }, [articles]);
    const tints = ["bg-nb-sun", "bg-nb-sky", "bg-nb-peach"];

    return (
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-w-[420px] mx-auto rounded-[24px] border-2 border-nb-ink bg-nb-lilac shadow-nb-lg p-4 flex flex-col justify-between -rotate-1">
            <div className="text-center pt-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase block">AiRA Lab · student community</span>
                <h3 className="mt-1 font-brico font-extrabold text-4xl tracking-tight">CHRONICLES</h3>
                <span className="font-mono text-[11px] font-semibold text-nb-violet block">Our reflection · {edition || "2025-26"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 py-4 px-1">
                {sampleImages.map((src, i) => (
                    <div
                        key={i}
                        className={`relative rounded-2xl overflow-hidden aspect-square border-2 border-nb-ink p-1 shadow-nb-sm ${tints[i % 3]} ${
                            i % 3 === 0 ? "rotate-2" : i % 3 === 1 ? "-rotate-2" : "rotate-1"
                        }`}
                    >
                        {src ? (
                            <img src={src} alt="Lab moment" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <div className="w-full h-full rounded-xl bg-white/50 flex items-center justify-center font-brico font-extrabold text-xl text-nb-ink/30">✦</div>
                        )}
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border-2 border-nb-ink bg-white p-3 flex items-center justify-between">
                <div>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-nb-violet block">The campus revolution</span>
                    <p className="font-brico font-bold text-sm leading-tight">Ideas · Innovation · Impact</p>
                </div>
                <span className="rounded-lg border-2 border-nb-ink bg-nb-sun px-2 py-1 font-brico font-extrabold text-[10px] uppercase">Annual</span>
            </div>
        </div>
    );
}

export default function MagazineReaderPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [mag, setMag] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Page navigation: -1 = cover spread, >= 0 = article index
    const [pageIdx, setPageIdx] = useState<number>(-1);
    const [fontSize, setFontSize] = useState<"normal" | "large" | "extra">("normal");
    const [viewMode, setViewMode] = useState<"single" | "spread">("spread");
    const [showShare, setShowShare] = useState(false);

    useEffect(() => {
        fetch(`/api/magazine/${id}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.id) setMag(d);
            })
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
            <div className="min-h-screen pt-36 px-5 max-w-5xl mx-auto">
                <SkeletonCard className="h-[70vh]" />
            </div>
        );
    }

    if (!mag) {
        return (
            <div className="min-h-screen pt-36 px-5 max-w-3xl mx-auto">
                <Empty icon={<BookOpen size={24} />} title="Issue not found" desc="It may have been unpublished.">
                    <Btn href="/magazine" tone="white">← Back to the shelf</Btn>
                </Empty>
            </div>
        );
    }

    const dbArticles: any[] = mag.posts?.map((mp: any) => mp.post || mp.BlogPost || mp).filter((p: any) => p && p.title) ?? [];
    const articles: any[] = dbArticles;
    const current = pageIdx >= 0 ? articles[pageIdx] ?? null : null;
    const progressPercent = pageIdx === -1 ? 0 : Math.round(((pageIdx + 1) / articles.length) * 100);

    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://aira-lab.in/magazine/${mag.id}`;
    const toolBtn = "p-2 rounded-lg border-2 border-nb-ink bg-white hover:bg-nb-sun transition-colors disabled:opacity-30";

    return (
        <div className="min-h-screen pt-28 sm:pt-32 pb-24">
            {/* Reading progress */}
            <div className="fixed top-0 left-0 right-0 h-1.5 bg-nb-ink/10 z-[10001] no-print">
                <div className="h-full bg-nb-violet transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Reader toolbar */}
            <div className="sticky top-24 z-40 px-3 sm:px-6 no-print">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 rounded-2xl border-2 border-nb-ink bg-nb-paper/95 backdrop-blur-md shadow-nb px-3 py-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => router.push("/magazine")} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-nb-ink bg-white px-2.5 py-1.5 font-brico font-bold text-sm">
                            <ArrowLeft size={15} /> <span className="hidden sm:inline">Shelf</span>
                        </button>
                        <div className="hidden md:block min-w-0">
                            <p className="font-brico font-bold truncate max-w-xs leading-tight">{mag.title}</p>
                            <p className="font-mono text-[10px] text-nb-violet">{mag.edition || "Annual edition"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button disabled={pageIdx <= -1} onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))} className={toolBtn} title="Previous (←)">
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPageIdx(-1)}
                            className={`rounded-lg border-2 border-nb-ink px-3 py-1.5 font-brico font-bold text-sm ${pageIdx === -1 ? "bg-nb-violet text-white" : "bg-white"}`}
                        >
                            {pageIdx === -1 ? "📖 Cover" : `Page ${pageIdx + 1} / ${articles.length}`}
                        </button>
                        <button disabled={pageIdx >= articles.length - 1} onClick={() => setPageIdx((curr) => Math.min(articles.length - 1, curr + 1))} className={toolBtn} title="Next (→)">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setViewMode((m) => (m === "spread" ? "single" : "spread"))}
                            className={`hidden sm:flex items-center gap-1.5 rounded-lg border-2 border-nb-ink px-2.5 py-1.5 font-bold text-xs ${viewMode === "spread" ? "bg-nb-sky" : "bg-white"}`}
                            title={viewMode === "spread" ? "Switch to single page" : "Switch to two-page spread"}
                        >
                            <Columns size={14} /> {viewMode === "spread" ? "Two-page" : "Single"}
                        </button>
                        <button onClick={() => setFontSize((curr) => (curr === "normal" ? "large" : curr === "large" ? "extra" : "normal"))} className={toolBtn} title="Text size">
                            <Type size={15} />
                        </button>
                        <button onClick={() => window.print()} className={toolBtn} title="Print / save as PDF">
                            <Printer size={15} />
                        </button>
                        <Button onClick={() => setShowShare(true)} size="sm">
                            <Globe2 size={14} /> <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-8 flex flex-col lg:flex-row gap-8">
                {/* Contents */}
                <aside className="lg:w-64 shrink-0 no-print">
                    <div className="lg:sticky lg:top-44 rounded-[22px] border-2 border-nb-ink bg-white shadow-nb p-4">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-nb-ink/15">
                            <span className="flex items-center gap-1.5 font-brico font-bold"><Layers size={15} /> Contents</span>
                            <span className="font-mono text-[10px] text-nb-muted">{articles.length} pieces</span>
                        </div>
                        <button
                            onClick={() => setPageIdx(-1)}
                            className={`w-full text-left rounded-xl border-2 border-nb-ink p-2.5 mb-2 font-brico font-bold text-sm ${pageIdx === -1 ? "bg-nb-sun" : "bg-white hover:bg-nb-paper"}`}
                        >
                            🌟 Front cover
                        </button>
                        <nav className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                            {articles.map((art: any, i: number) => (
                                <button
                                    key={art.id}
                                    onClick={() => setPageIdx(i)}
                                    className={`w-full text-left rounded-xl p-2.5 flex items-start gap-2 border-2 transition-colors ${
                                        pageIdx === i ? "border-nb-ink bg-nb-lilac" : "border-transparent hover:border-nb-ink/20"
                                    }`}
                                >
                                    <span className="font-mono text-[10px] font-bold text-nb-violet mt-0.5 shrink-0">#{String(i + 1).padStart(2, "0")}</span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-sm leading-snug line-clamp-2">{art.title}</span>
                                        <span className="block text-[11px] text-nb-muted mt-0.5">by {art.author?.name || "AiRA member"}</span>
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Folio */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {pageIdx === -1 ? (
                            <motion.div
                                key="cover-spread"
                                initial={{ opacity: 0, y: 16, rotate: -0.6 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35 }}
                                className="magazine-folio-paper rounded-[26px] overflow-hidden p-6 sm:p-10 space-y-8"
                            >
                                <div className="magazine-stripe-top w-full rounded-full" />
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                                    <div className="md:col-span-6 flex justify-center">
                                        <CoverDiamondCollage articles={articles} edition={mag.edition} />
                                    </div>
                                    <div className="md:col-span-6 space-y-5">
                                        <span className="inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-mint px-3 py-1 font-brico font-bold text-sm">
                                            <Sparkles size={14} /> Written by the community
                                        </span>
                                        <h1 className="font-brico font-extrabold tracking-[-0.04em] leading-[0.98] text-[clamp(2.2rem,4.5vw,3.75rem)]">{mag.title}</h1>
                                        <p className="text-nb-muted leading-relaxed">
                                            {mag.description ||
                                                "Welcome to this edition of the AiRA Magazine — student writing on software, AI, robotics and life in our community."}
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl border-2 border-nb-ink bg-nb-sky p-3">
                                                <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Articles</p>
                                                <p className="font-brico font-extrabold text-2xl">{articles.length}</p>
                                            </div>
                                            <div className="rounded-2xl border-2 border-nb-ink bg-nb-peach p-3">
                                                <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Edition</p>
                                                <p className="font-brico font-extrabold text-2xl">{mag.edition || "2025-26"}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3 pt-2 no-print">
                                            <Button disabled={articles.length === 0} onClick={() => setPageIdx(0)}>
                                                Start reading <ChevronRight size={16} />
                                            </Button>
                                            <Button onClick={() => setShowShare(true)} tone="white">
                                                <Share2 size={15} /> Share issue
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="magazine-stripe-bottom w-full rounded-full" />
                            </motion.div>
                        ) : current ? (
                            <motion.article
                                key={current.id}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.3 }}
                                className="magazine-folio-paper rounded-[26px] overflow-hidden p-6 sm:p-10 space-y-8"
                            >
                                <div className="magazine-stripe-top w-full rounded-full" />
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-nb-ink pb-4">
                                    <span className="rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-0.5 font-brico font-bold text-sm uppercase tracking-wide">
                                        {current.topic?.title || "Growth & innovation"}
                                    </span>
                                    <span className="font-mono text-[11px] text-nb-muted">AiRA Magazine · {mag.edition || "2025-26"}</span>
                                </div>

                                <div>
                                    <h1 className="font-brico font-extrabold tracking-[-0.04em] leading-[1] text-[clamp(2rem,4.5vw,3.75rem)]">{current.title}</h1>
                                    <p className="mt-3 text-nb-muted italic">&ldquo;A transformative perspective on engineering, leadership and human impact.&rdquo;</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl border-2 border-nb-ink bg-nb-lilac p-5">
                                    <div className="md:col-span-4 flex items-center gap-4">
                                        {current.author?.avatar ? (
                                            <img src={current.author.avatar} alt={current.author.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-nb-ink object-cover shrink-0" />
                                        ) : (
                                            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center font-brico font-extrabold text-2xl shrink-0">
                                                {current.author?.name?.[0] || "A"}
                                            </span>
                                        )}
                                        <div>
                                            <p className="font-brico font-extrabold">{current.author?.name || "AiRA member"}</p>
                                            <p className="font-mono text-[11px] text-nb-violet">{current.author?.role || "Tech wing member"}</p>
                                            <p className="text-[11px] text-nb-ink/60">AiRA Lab community</p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-8 flex items-center gap-3 border-t-2 md:border-t-0 md:border-l-2 border-nb-ink/20 pt-3 md:pt-0 md:pl-6">
                                        <Quote size={26} className="shrink-0" />
                                        <p className="font-brico text-lg leading-snug">
                                            &ldquo;We are not a generation that merely observes — we question, engineer and build.&rdquo;
                                        </p>
                                    </div>
                                </div>

                                {current.coverImage && (
                                    <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden border-2 border-nb-ink">
                                        <img src={current.coverImage} alt="" className="w-full h-full object-cover" />
                                        <span className="absolute bottom-2 right-3 rounded-md border-2 border-nb-ink bg-white px-2 py-0.5 font-mono text-[10px]">Photo: AiRA Lab</span>
                                    </div>
                                )}

                                <div
                                    className={`${viewMode === "spread" ? "magazine-columns-2" : ""} magazine-dropcap ${
                                        fontSize === "large" ? "text-lg sm:text-xl" : fontSize === "extra" ? "text-xl sm:text-2xl" : "text-[15px] sm:text-base"
                                    }`}
                                >
                                    <MediumArticleContent content={current.content} variant="light" />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-nb-ink bg-nb-paper p-4">
                                    <div className="flex items-center gap-3.5">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}&color=111111&bgcolor=ffffff`}
                                            alt="Article QR code"
                                            className="w-14 h-14 rounded-lg border-2 border-nb-ink bg-white p-0.5"
                                        />
                                        <div>
                                            <p className="flex items-center gap-1.5 font-brico font-bold"><QrCode size={14} /> Scan with your phone</p>
                                            <p className="text-xs text-nb-muted">Open this article on mobile</p>
                                        </div>
                                    </div>
                                    <span className="rounded-lg border-2 border-nb-ink bg-nb-sun px-3 py-1 font-mono font-bold text-sm">Page {String(pageIdx + 1).padStart(2, "0")}</span>
                                </div>

                                <div className="magazine-stripe-bottom w-full rounded-full" />
                                <div className="flex items-center justify-between font-mono text-xs text-nb-muted no-print">
                                    <span>AiRA Chronicles · {mag.edition || "2025-26"}</span>
                                    <span className="flex gap-3">
                                        <button onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))} className="font-bold text-nb-ink underline underline-offset-4">← Prev</button>
                                        <button disabled={pageIdx >= articles.length - 1} onClick={() => setPageIdx((curr) => curr + 1)} className="font-bold text-nb-ink underline underline-offset-4 disabled:opacity-30">Next →</button>
                                    </span>
                                </div>
                            </motion.article>
                        ) : (
                            <Empty icon={<BookOpen size={24} />} title="No articles in this edition yet." />
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <WorldwideShareModal isOpen={showShare} mag={mag} onClose={() => setShowShare(false)} />
        </div>
    );
}
