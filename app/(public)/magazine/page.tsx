"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Share2, Globe2, Check, Copy, X, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { BLOCK_COLORS, Btn, EASE, Empty, PageHero, SearchInput, SkeletonCard, WRAP } from "@/components/nb/kit";

function ShareModal({ mag, onClose }: { mag: any; onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (mag) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [mag, onClose]);

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

    const shareBtn = "flex items-center justify-center py-2.5 px-3 rounded-xl border-2 border-nb-ink font-brico font-bold text-sm shadow-nb-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-nb-ink/60 backdrop-blur-sm p-4 flex items-center justify-center"
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
        </AnimatePresence>
    );
}

const DEFAULT_MAGAZINES = [
    {
        id: "flagship-2025-26",
        title: "AiRA Chronicles: The Campus Revolution",
        edition: "Vol. 2025-26",
        description: "Official annual lab reflection magazine spotlighting breakthrough autonomous robotics, AI neural architectures, and student innovation reflections.",
        coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        status: "PUBLISHED",
        posts: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
    },
];

export default function MagazinePage() {
    const [magazines, setMagazines] = useState<any[]>(DEFAULT_MAGAZINES);
    const [loading]     = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shareMag, setShareMag] = useState<any | null>(null);

    useEffect(() => {
        fetch("/api/magazine")
            .then((r) => r.ok ? r.json() : [])
            .then((d) => {
                if (Array.isArray(d) && d.length > 0) {
                    setMagazines(d);
                }
            })
            .catch(() => {});
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
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Written by the community"
                title="The AiRA magazine."
                says="Each issue collects the best writing from our members. Grab one off the shelf!"
                desc="Digital issues curated from student blogs — research highlights, build stories and campus innovation."
            >
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search issues and editions…" />
                    <Btn href="/portal/admin/magazine" tone="white">📖 Magazine studio</Btn>
                </div>
            </PageHero>

            <div className={WRAP}>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} className="aspect-[3/4]" />)}
                    </div>
                ) : filteredMagazines.length === 0 ? (
                    <Empty icon={<BookOpen size={24} />} title="No issues published yet." desc="Use the Magazine Studio to curate articles into the first issue.">
                        <Btn href="/portal/admin/magazine">Open Magazine Studio →</Btn>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredMagazines.map((mag: any, i: number) => (
                            <motion.article
                                key={mag.id}
                                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
                                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
                                whileHover={{ rotate: 0, y: -6 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.08 }}
                                className="group"
                            >
                                <div className={`relative aspect-[3/4] rounded-[20px] border-2 border-nb-ink shadow-nb-lg overflow-hidden ${BLOCK_COLORS[i % BLOCK_COLORS.length]}`}>
                                    {mag.coverImage ? (
                                        <img src={mag.coverImage} alt={mag.title} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <span className="absolute inset-0 flex items-center justify-center font-brico font-extrabold text-8xl text-nb-ink/10 select-none">AiRA</span>
                                    )}
                                    {/* Spine */}
                                    <span aria-hidden="true" className="absolute inset-y-0 left-0 w-3 border-r-2 border-nb-ink bg-nb-ink/20" />
                                    {/* Masthead */}
                                    <div className="absolute inset-x-0 top-0 pl-6 pr-4 pt-4 flex items-start justify-between">
                                        <span className="rounded-lg border-2 border-nb-ink bg-white px-2.5 py-1 font-brico font-extrabold text-sm">AiRA · {mag.edition}</span>
                                        <button
                                            onClick={(e) => { e.preventDefault(); setShareMag(mag); }}
                                            title="Share"
                                            className="w-10 h-10 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm hover:bg-nb-sun transition-colors"
                                        >
                                            <Share2 size={15} />
                                        </button>
                                    </div>
                                    <div className="absolute inset-x-3 bottom-3 left-6 rounded-2xl border-2 border-nb-ink bg-nb-paper p-4">
                                        <h2 className="font-brico font-extrabold text-xl leading-tight tracking-tight">{mag.title}</h2>
                                        {mag.description && <p className="mt-1 text-sm text-nb-muted line-clamp-2">{mag.description}</p>}
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 font-mono text-xs"><BookOpen size={13} /> {mag.posts?.length ?? 0} articles</span>
                                            <Link href={`/magazine/${mag.id}`} className="inline-flex items-center gap-1 rounded-lg border-2 border-nb-ink bg-nb-violet text-white px-3 py-1.5 font-brico font-bold text-sm shadow-nb-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                                                Read <ArrowUpRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>

            <ShareModal mag={shareMag} onClose={() => setShareMag(null)} />
        </div>
    );
}
