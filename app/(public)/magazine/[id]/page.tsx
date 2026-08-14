"use client";

import { useEffect, useState, useMemo } from "react";
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
    ListFilter,
    Award,
    Eye,
    Columns,
    FileText,
    Bookmark,
    Quote
} from "lucide-react";
import toast from "react-hot-toast";
import MediumArticleContent from "@/components/ui/MediumArticleContent";

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

    // Conditional rendering is now handled inside AnimatePresence

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
            {isOpen && mag && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center cursor-pointer"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.92, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.92, opacity: 0, y: 20 }}
                        className="glass-strong rounded-3xl border border-white/20 p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                            <div className="flex items-center gap-2">
                                <Globe2 className="text-aira-cyan" size={18} />
                                <h3 className="font-orbitron font-bold text-base text-white">Share Publication</h3>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Close Modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="font-orbitron font-bold text-sm text-white">{mag.title}</p>
                                <p className="text-xs text-pink-400">{mag.edition}</p>
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
            )}
        </AnimatePresence>
    );
}

// ── DIAMOND GEOMETRIC PHOTO COLLAGE (MATCHING PAGE 1 OF PDF) ──
function CoverDiamondCollage({ articles, edition }: { articles: any[]; edition: string }) {
    const sampleImages = useMemo(() => {
        const extracted = articles.map((a) => a.coverImage).filter(Boolean);
        const defaults = [
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
        ];
        return [...extracted, ...defaults].slice(0, 6);
    }, [articles]);

    return (
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-w-[420px] mx-auto rounded-3xl p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border-2 border-pink-500/30 shadow-2xl shadow-pink-500/20 overflow-hidden flex flex-col justify-between">
            {/* Top Magazine Masthead */}
            <div className="text-center pt-2 z-10">
                <span className="text-[10px] font-orbitron font-bold tracking-[0.3em] text-aira-cyan uppercase block">
                    AiRA LABS • RESEARCH &amp; INNOVATION
                </span>
                <h3 className="font-orbitron font-black text-2xl sm:text-3xl text-white tracking-wider mt-1">
                    CHRONICLES
                </h3>
                <span className="text-[11px] text-pink-400 font-mono font-semibold block">
                    OUR REFLECTION • {edition || "2025-26"}
                </span>
            </div>

            {/* Geometric Diamond Collage Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 py-4 z-10 px-2">
                {sampleImages.map((src, i) => (
                    <div
                        key={i}
                        className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-300 hover:scale-105 ${
                            i % 3 === 0
                                ? "border-amber-400/60 shadow-lg shadow-amber-500/20 rotate-1"
                                : i % 3 === 1
                                ? "border-aira-cyan/60 shadow-lg shadow-cyan-500/20 -rotate-2"
                                : "border-pink-400/60 shadow-lg shadow-pink-500/20 rotate-2"
                        }`}
                    >
                        <img src={src} alt="Lab Moment" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    </div>
                ))}
            </div>

            {/* Bottom Theme Ribbon & Badge */}
            <div className="z-10 bg-slate-950/90 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-orbitron text-amber-400 font-bold uppercase tracking-wider block">
                        THE CAMPUS REVOLUTION
                    </span>
                    <p className="text-[11px] font-bold text-white leading-tight">
                        Ideas • Innovation • Impact
                    </p>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-orbitron font-black text-[10px] uppercase shadow-md">
                    Annual Edition
                </div>
            </div>
        </div>
    );
}

// ── DEFAULT ARTICLES INSPIRED BY MAGAZINE.PDF ──
const DEFAULT_ARTICLES = [
    {
        id: "mag-sample-1",
        title: "Generation Z: A Shift, Not A Phase",
        readTime: "4 min read",
        coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        topic: { title: "STUDENT ESSAY • GENERATION DISPATCH" },
        author: {
            name: "Niki Narsiana",
            role: "Tech Wing Member · F.Y. B.Com",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        },
        content: `“Too sharp.” “Too lazy.” “Too rude.”

These are some of the most common labels attached to Generation Z. Yet the reality is far more nuanced, dynamic, and exciting than these stereotypes suggest. To understand Gen Z is to recognize a generation that is informed, emotionally aware, and purpose-driven.

We are perhaps the most informed generation the world has ever seen. Growing up in a world shaped by technology and instant access to knowledge has allowed us to question, analyse, and form opinions with evidence. But what truly distinguishes Gen Z is not just information — it is emotional awareness and empathy.

We speak openly about emotions, something previous generations were often hesitant to do. We understand that words carry weight and that even the smallest remarks can leave lasting marks on someone's mind. What some dismiss as being "too sensitive" is, in reality, a deeper awareness of human impact.

Our idea of success has also evolved. Wealth alone no longer defines class or respect. To us, a truly successful person is someone disciplined enough to take care of their health, avoid harmful habits, pursue meaningful goals, and stay relentlessly devoted to their dreams.

Gen Z is also the generation that prioritizes mental health. We understand burnout, we value balance, and we refuse to glorify exhaustion as success. Hobbies are no longer "time-pass"; they are passions worth nurturing. Many of us quietly chase one simple but powerful goal: to make our younger selves proud.

We are also learning to protect our energy. Gentle is not weakness, and negativity is no longer entertaining; cutting off toxic environments is not seen as rebellion but as self-respect. At the same time, we are more conscious of what may be offensive or insensitive, and we actively try to correct ignorance with awareness.

Interestingly, while parents often find this generation difficult to understand, many Gen Z individuals are actively working to understand their families more deeply. They are willing to bridge generational divides with patience and compassion.

And when it comes to work, we are not lazy — we are selective. We simply refuse to invest our time and energy in things that lack meaning or purpose. Generation Z is not trying to be the "cool generation". We are striving to be the conscious generation.

**Not just a generation that exists — but one that questions, evolves, and creates impact.**`
    },
    {
        id: "mag-sample-2",
        title: "Academic Growth: The Role of Autonomous Intelligence in Shaping Future Leaders",
        readTime: "6 min read",
        coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
        topic: { title: "ACADEMIC GROWTH • FACULTY & RESEARCH" },
        author: {
            name: "Meet Dave",
            role: "Chief Technology Officer · AiRA Lab",
            avatar: "https://yaqbjopgwshxzcwynskf.supabase.co/storage/v1/object/public/uploads/avatars/9220d34e-68ac-4dd6-b1af-f68497466e7c.png"
        },
        content: `The academic year 2025–26 has been a remarkable journey of dedication, scholarship, and impactful research at AiRA Lab. Excellence goes beyond routine engineering: it reflects a deeper engagement with issues that shape society, industry, and national capability.

### 1. Bridging the "Skill Gap" in the Modern Economy
Today's employers, whether in the tech sector or deep-tech hardware labs, are looking for hands-on architectural mastery alongside purely theoretical grades. At AiRA, we cultivate core attributes that prepare students directly for high-pressure industry environments:
- **Decision-Making Under Pressure:** Fast iterations during robotics trials and drone navigation testbeds.
- **Systematic Architecture:** Building full-stack autonomous rovers, SLAM mapping, and neural perception models from the ground up.
- **Interdisciplinary Collaboration:** Fostering synergy across computer science, electronics, mechanical fabrication, and design.

### 2. Technology & Modern Training
Modern lab training has evolved in tandem with global standards. Students engage in edge-computing robotics, computer vision pipelines with YOLOv8, and autonomous agent orchestration. In today's landscape, digital literacy must encompass cybersecurity, prompt architecture, and physical computing.

### 3. Conclusion: The New India Vision
In the current era, student innovators are poised to be global leaders. However, technical prowess alone is insufficient without strong ethical character, self-discipline, and a passion for national progress. In short, the lab is a vital preparatory ground ensuring today's youth are ready for the responsibilities of tomorrow.`
    },
    {
        id: "mag-sample-3",
        title: "Delving into Talent, Tradition and Self: Campus & Cultural Retrospective",
        readTime: "5 min read",
        coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
        topic: { title: "CULTURAL ACTIVITIES & PHOTO ARCHIVE" },
        author: {
            name: "AiRA Editorial Wing",
            role: "Media & Documentation Team",
            avatar: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=200&q=80"
        },
        content: `The academic year is not only about the syllabus; it is much more. In its rich, textured experience, it is exploring our inner creativity, our organizational abilities, relationships that are forged for life, and most importantly, the testing of our limits and our resilience to go that extra mile.

The highlight of the semester was our active participation in the University Youth Festival and National Robotics Symposium. From dramatic adaptations of classic literature to high-energy folk dance showcases, the campus transformed into a crucible of creative and technical energy.

### Art Meets Engineering
Translating concepts into physical reality is the heart of both theater and robotics. Students stepped into complex roles, fabricated stage sets with micro-controllers, and synchronized lighting with automated DMX boards. 

The experience brought immense pride, confidence, and camaraderie. As we look forward to the upcoming hackathon season, these memories remind us that engineering without soul is empty, and art without structure is ephemeral.`
    },
    {
        id: "mag-sample-4",
        title: "Success Beyond the Spotlight: More Than Just A Degree",
        readTime: "5 min read",
        coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        topic: { title: "SUCCESS BEYOND THE SPOTLIGHT • ALUMNI" },
        author: {
            name: "Shreya Nandi",
            role: "Actuarial Analyst · AiRA Alumna",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
        },
        content: `When I look back at my time at college and AiRA Lab, I don't think of one big turning point. I think of small, consistent habits that slowly added up.

I had already decided to pursue analytical engineering, so college for me was about building the right base — not rushing ahead, but strengthening what would matter later. The lectures, hackathon sprints, internal assessments, and discussions with mentors all created a steady rhythm that taught me something critical: progress does not always feel dramatic, but it is happening.

### 1. Learning Beyond Academics
Lab life extends far beyond classrooms. Organizing symposiums and participating in technical competitions outside the campus adds a different kind of learning: you learn how to manage stress and team dynamics.

### 2. Building Professional Readiness
When you step into technical interviews, employers already expect baseline coding proficiency. What sets you apart is clarity — how you think through a problem, how you respond when you don't immediately know an answer, and how composed you remain.

### 3. Message to Current Students
To current students, my advice would be simple: use your time intentionally. Build clarity in your subjects. Participate beyond exams. Seek guidance when needed. Small, disciplined efforts compound in ways you may not immediately notice — but they make a massive difference when opportunities arrive.`
    }
];

export default function MagazineReaderPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [mag, setMag] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Page Navigation: -1 = Cover Spread, >= 0 = Article index
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

    const dbArticles: any[] = mag.posts?.map((mp: any) => mp.post || mp.BlogPost || mp).filter((p: any) => p && p.title) ?? [];
    const articles: any[] = dbArticles.length > 0 ? dbArticles : DEFAULT_ARTICLES;
    const current = pageIdx >= 0 ? articles[pageIdx] ?? null : null;
    const nextArticle = pageIdx >= 0 && pageIdx + 1 < articles.length ? articles[pageIdx + 1] : null;
    const progressPercent = pageIdx === -1 ? 0 : Math.round(((pageIdx + 1) / articles.length) * 100);

    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://aira-lab.in/magazine/${mag.id}`;

    return (
        <div className="min-h-screen pt-20 pb-20 bg-[#040711] text-white relative">
            {/* Top Reading Progress Line */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-[100]">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-aira-cyan to-pink-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* ══ STICKY MAGAZINE ACTION COMMAND BAR ══ */}
            <header className="sticky top-0 z-50 glass-strong border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xl no-print">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/magazine")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                    >
                        <ArrowLeft size={14} />
                        <span className="hidden sm:inline">Magazine Shelf</span>
                    </button>

                    <div className="hidden md:block">
                        <p className="font-orbitron font-bold text-xs sm:text-sm text-white truncate max-w-xs">{mag.title}</p>
                        <p className="text-[10px] text-pink-400 font-mono font-semibold">{mag.edition || "Annual Lab Edition"}</p>
                    </div>
                </div>

                {/* Center Page Turn Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        disabled={pageIdx <= -1}
                        onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Previous Spread (Left Arrow)"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <button
                        onClick={() => setPageIdx(-1)}
                        className={`px-3 py-1 rounded-xl text-xs font-orbitron font-bold transition-all ${
                            pageIdx === -1
                                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 shadow-md shadow-orange-500/20"
                                : "bg-white/5 text-slate-300 hover:text-white"
                        }`}
                    >
                        {pageIdx === -1 ? "📖 Cover Spread" : `Page ${pageIdx + 1} / ${articles.length}`}
                    </button>

                    <button
                        disabled={pageIdx >= articles.length - 1}
                        onClick={() => setPageIdx((curr) => Math.min(articles.length - 1, curr + 1))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Next Spread (Right Arrow)"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Right Action Suite */}
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <button
                        onClick={() => setViewMode((m) => (m === "spread" ? "single" : "spread"))}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex ${
                            viewMode === "spread"
                                ? "bg-aira-cyan/20 border-aira-cyan/40 text-aira-cyan"
                                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                        }`}
                        title={viewMode === "spread" ? "Switch to Single Page Mode" : "Switch to Two-Page Spread Mode"}
                    >
                        <Columns size={14} />
                        <span className="text-[11px] font-orbitron">{viewMode === "spread" ? "Two-Page" : "Single"}</span>
                    </button>

                    {/* Font Adjuster */}
                    <button
                        onClick={() => {
                            setFontSize((curr) => (curr === "normal" ? "large" : curr === "large" ? "extra" : "normal"));
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Adjust Typography Size"
                    >
                        <Type size={14} />
                    </button>

                    {/* Print / Export PDF */}
                    <button
                        onClick={() => window.print()}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Print / Save as PDF Spread"
                    >
                        <Printer size={14} />
                    </button>

                    {/* Share Worldwide */}
                    <button
                        onClick={() => setShowShare(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-orbitron font-bold text-xs hover:scale-105 transition-all shadow-md shadow-pink-500/20"
                    >
                        <Globe2 size={13} />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </header>

            {/* ══ MAIN MAGAZINE CONTAINER ══ */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
                {/* ── SIDEBAR TABLE OF CONTENTS ── */}
                <aside className="lg:w-64 shrink-0 no-print">
                    <div className="glass rounded-3xl border border-white/10 p-4 sticky top-20 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="font-orbitron text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers size={13} className="text-orange-400" /> Edition Contents
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">{articles.length} Works</span>
                        </div>

                        {/* Cover Page Button */}
                        <button
                            onClick={() => setPageIdx(-1)}
                            className={`w-full text-left p-2.5 rounded-2xl text-xs font-orbitron font-bold transition-all flex items-center gap-2.5 ${
                                pageIdx === -1
                                    ? "bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/40 text-white shadow-md"
                                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                            }`}
                        >
                            <span>🌟</span>
                            <div className="truncate">
                                <p className="leading-tight">Front Cover Spread</p>
                                <span className="text-[9px] font-normal text-slate-400 font-sans">Mosaic Collage &amp; Abstract</span>
                            </div>
                        </button>

                        {/* Articles List */}
                        <nav className="space-y-1.5 max-h-[58vh] overflow-y-auto pr-1">
                            {articles.map((art: any, i: number) => {
                                const isSelected = pageIdx === i;
                                return (
                                    <button
                                        key={art.id}
                                        onClick={() => setPageIdx(i)}
                                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2 border ${
                                            isSelected
                                                ? "bg-aira-cyan/20 border-aira-cyan/50 text-white shadow-md"
                                                : "bg-white/[0.02] border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <span className="font-orbitron font-bold text-[10px] text-pink-400 mt-0.5 shrink-0">
                                            #{String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold line-clamp-2 leading-snug text-xs">{art.title}</p>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">by {art.author?.name || "AiRA Researcher"}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* ── MAIN MAGAZINE FOLIO / ARTICLE READER ── */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {pageIdx === -1 ? (
                            /* ═══════════════════════════════════════════════════════════
                               COVER SPREAD (PAGE 1 IN PDF STYLE)
                               ═══════════════════════════════════════════════════════════ */
                            <motion.div
                                key="cover-spread"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.35 }}
                                className="magazine-folio-paper rounded-3xl border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8"
                            >
                                <div className="magazine-stripe-top w-full rounded-full" />

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                                    {/* Left: Geometric Diamond Photo Collage */}
                                    <div className="md:col-span-6 flex justify-center">
                                        <CoverDiamondCollage articles={articles} edition={mag.edition} />
                                    </div>

                                    {/* Right: Magazine Presentation, Editorial Letter & Table of Contents */}
                                    <div className="md:col-span-6 space-y-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aira-cyan/15 border border-aira-cyan/30 text-aira-cyan text-[10px] font-orbitron font-bold uppercase">
                                            <Sparkles size={12} /> OFFICIAL LAB PERIODIC PUBLICATION
                                        </div>

                                        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-white leading-tight">
                                            {mag.title}
                                        </h1>

                                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                                            {mag.description ||
                                                "Welcome to this curated edition of AiRA Magazine — presenting breakthrough autonomous robotics case studies, artificial intelligence research, student innovation reflections, and collegiate achievements."}
                                        </p>

                                        {/* Highlights Stats */}
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                                <span className="text-[9px] font-orbitron text-slate-400 uppercase tracking-wider block">Featured Articles</span>
                                                <p className="font-orbitron font-bold text-lg text-white mt-0.5">{articles.length} Works</p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                                <span className="text-[9px] font-orbitron text-slate-400 uppercase tracking-wider block">Edition Release</span>
                                                <p className="font-orbitron font-bold text-lg text-pink-400 mt-0.5">
                                                    {mag.edition || "Annual 2025-26"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-3 flex flex-wrap items-center gap-3">
                                            <button
                                                disabled={articles.length === 0}
                                                onClick={() => setPageIdx(0)}
                                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-orange-500/25 cursor-pointer disabled:opacity-40"
                                            >
                                                <span>Open &amp; Read Article #1</span>
                                                <ChevronRight size={15} />
                                            </button>

                                            <button
                                                onClick={() => setShowShare(true)}
                                                className="px-5 py-3 rounded-2xl glass border border-white/15 text-slate-200 hover:text-white font-orbitron font-semibold text-xs flex items-center gap-2 hover:border-aira-cyan/40 transition-all cursor-pointer"
                                            >
                                                <Share2 size={14} />
                                                <span>Share Publication</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="magazine-stripe-bottom w-full rounded-full" />
                            </motion.div>
                        ) : current ? (
                            /* ═══════════════════════════════════════════════════════════
                               ARTICLE SPREAD (AUTHENTIC PRINT MAGAZINE PDF STYLE)
                               ═══════════════════════════════════════════════════════════ */
                            <motion.article
                                key={current.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="magazine-folio-paper rounded-3xl border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-10 space-y-8"
                            >
                                {/* Top Multi-Color Decorative Stripe (as in PDF) */}
                                <div className="magazine-stripe-top w-full rounded-full" />

                                {/* ── SPREAD HEADER BANNER (PDF STYLE) ── */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-orange-500 to-pink-500" />
                                        <span className="font-orbitron font-bold text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-cyan-400 uppercase tracking-widest">
                                            {current.topic?.title || "ACADEMIC GROWTH & INNOVATION"}
                                        </span>
                                    </div>

                                    <span className="text-[11px] font-mono text-slate-400">
                                        AiRA Digital Magazine • {mag.edition || "2025-26"}
                                    </span>
                                </div>

                                {/* ── ARTICLE TITLE & EDITORIAL SUBHEAD ── */}
                                <div className="space-y-3">
                                    <h1 className="font-orbitron font-black text-2xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
                                        {current.title}
                                    </h1>
                                    <p className="text-sm sm:text-base text-slate-300 italic font-serif">
                                        “A transformative perspective on engineering, leadership, and human impact.”
                                    </p>
                                </div>

                                {/* ── AUTHOR PORTRAIT CARD & PULL-QUOTE HERO SPREAD ── */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                                    {/* Author Portrait Frame (PDF Style) */}
                                    <div className="md:col-span-4 flex items-center gap-4">
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-aira-cyan/50 shadow-lg shadow-cyan-500/20 shrink-0">
                                            {current.author?.avatar ? (
                                                <img
                                                    src={current.author.avatar}
                                                    alt={current.author.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-pink-900 flex items-center justify-center font-orbitron font-bold text-lg text-white">
                                                    {current.author?.name?.[0] || "A"}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-orbitron font-bold text-sm sm:text-base text-white">
                                                {current.author?.name || "AiRA Contributor"}
                                            </h4>
                                            <span className="text-[11px] text-pink-400 font-mono block">
                                                {current.author?.role || "Tech Wing Member"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                AiRA Lab Research Division
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pull-Quote Banner */}
                                    <div className="md:col-span-8 flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
                                        <Quote size={24} className="text-amber-400 shrink-0 opacity-70" />
                                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                                            “We are not a generation that merely observes — we question, engineer, and build impactful technological breakthroughs.”
                                        </p>
                                    </div>
                                </div>

                                {/* ── COVER IMAGE HERO (IF PRESENT) ── */}
                                {current.coverImage && (
                                    <div className="relative aspect-[16/7] w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                                        <img src={current.coverImage} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-2 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                                            Photo: AiRA Lab Field Documentation
                                        </div>
                                    </div>
                                )}

                                {/* ── TWO-COLUMN EDITORIAL ARTICLE BODY (PDF STYLE) ── */}
                                <div
                                    className={`magazine-columns-2 magazine-dropcap ${
                                        fontSize === "large"
                                            ? "text-base sm:text-lg leading-relaxed"
                                            : fontSize === "extra"
                                            ? "text-lg sm:text-xl leading-loose"
                                            : "text-xs sm:text-sm leading-relaxed"
                                    } text-slate-200 font-sans`}
                                >
                                    <MediumArticleContent content={current.content} />
                                </div>

                                {/* ── AUTHENTIC CORNER QR CODE WIDGET (AS IN PDF PAGES 8, 11, 14) ── */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/10 mt-8">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-aira-cyan/40 p-1 bg-slate-900 shrink-0">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                                                    shareUrl
                                                )}&color=00D4FF&bgcolor=0a0f1d`}
                                                alt="Article QR"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-orbitron font-bold text-xs text-white flex items-center gap-1.5">
                                                <QrCode size={13} className="text-aira-cyan" /> Scan with Phone
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Access the interactive case study, source code &amp; video demo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Page Number Badge & Metadata */}
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-xs text-amber-400">
                                            Page #{String(pageIdx + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Multi-Color Decorative Stripe (PDF Style) */}
                                <div className="magazine-stripe-bottom w-full rounded-full" />

                                {/* ── RUNNING FOOTER FOLIO ── */}
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                                    <span>AiRA Chronicles • {mag.edition || "2025-26"}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPageIdx((curr) => Math.max(-1, curr - 1))}
                                            className="hover:text-white underline cursor-pointer"
                                        >
                                            ← Prev
                                        </button>
                                        <span>•</span>
                                        <button
                                            disabled={pageIdx >= articles.length - 1}
                                            onClick={() => setPageIdx((curr) => curr + 1)}
                                            className="hover:text-white underline cursor-pointer disabled:opacity-30"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            </motion.article>
                        ) : (
                            <div className="glass rounded-3xl border border-white/10 p-12 text-center text-slate-500">
                                <BookOpen size={48} className="mx-auto mb-3 opacity-30 text-orange-400" />
                                <p className="font-orbitron text-sm">No articles in this edition yet.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Worldwide Share Modal */}
            <WorldwideShareModal isOpen={showShare} mag={mag} onClose={() => setShowShare(false)} />
        </div>
    );
}
