"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Download, Copy, Sparkles, User, Layers, Calendar, Quote, 
    Rocket, Search, Code, Star, Globe, Check, Image as ImageIcon,
    RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

interface OnboardingPosterModalProps {
    open: boolean;
    onClose: () => void;
    applicant: {
        id?: string;
        name: string;
        email?: string;
        phone?: string;
        interest?: string | null;
        message?: string | null;
        photo?: string | null;
        createdAt?: string;
    } | null;
}

export function OnboardingPosterModal({ open, onClose, applicant }: OnboardingPosterModalProps) {
    const exportRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);

    // Dynamic poster state
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("Technical Wing");
    const [joinedDate, setJoinedDate] = useState("");
    const [quote, setQuote] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [signatureName, setSignatureName] = useState("");

    const departmentOptions = [
        "Technical Wing",
        "Design & Media Wing",
        "AI & Research Wing",
        "Management & Ops",
        "Cybersecurity Wing",
        "Core Team"
    ];

    useEffect(() => {
        if (applicant) {
            setName(applicant.name || "Team Member");
            setSignatureName(applicant.name || "Team Member");
            setRole(applicant.interest || "Chief Technical Officer");
            setPhotoUrl(applicant.photo || "");
            
            const dateObj = applicant.createdAt ? new Date(applicant.createdAt) : new Date();
            const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            setJoinedDate(formattedDate);

            const defaultQuote = applicant.message && applicant.message.length > 5
                ? applicant.message.length > 90 
                    ? applicant.message.substring(0, 87) + "..."
                    : applicant.message
                : "Building robust systems, scalable solutions and smarter tomorrows.";
            setQuote(defaultQuote);
        }
    }, [applicant, open]);

    if (!open || !applicant) return null;

    const handleDownloadPoster = async () => {
        if (!exportRef.current) return;
        setDownloading(true);
        const toastId = toast.loading("Exporting pixel-perfect 1080×1080 PNG...");

        try {
            await document.fonts.ready;
            await new Promise((resolve) => setTimeout(resolve, 400));

            const canvas = await html2canvas(exportRef.current, {
                width: 1080,
                height: 1080,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#080711",
                logging: false,
                windowWidth: 1080,
                windowHeight: 1080,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = `AiRA_Welcome_${name.replace(/\s+/g, "_")}.png`;
                    saveAs(blob, filename);
                    toast.success("Onboarding Poster downloaded!", { id: toastId });
                } else {
                    throw new Error("Failed to generate image blob");
                }
                setDownloading(false);
            }, "image/png");
        } catch (error: any) {
            console.error("Poster export error:", error);
            toast.error(error?.message || "Failed to download poster. Try again.", { id: toastId });
            setDownloading(false);
        }
    };

    const handleDownloadRawPhoto = async () => {
        if (!photoUrl) {
            toast.error("No candidate photo available to download");
            return;
        }
        try {
            const res = await fetch(photoUrl);
            const blob = await res.blob();
            const filename = `${name.replace(/\s+/g, "_")}_Photo.jpg`;
            saveAs(blob, filename);
            toast.success("Raw photo downloaded!");
        } catch (error) {
            const link = document.createElement("a");
            link.href = photoUrl;
            link.target = "_blank";
            link.download = `${name}_Photo`;
            link.click();
        }
    };

    const handleCopyCaption = () => {
        const captionText = `✨ PROUD TO WELCOME TO AIRA LAB ✨\n\n` +
            `Please join us in giving a warm welcome to ${name}! 🎉🚀\n\n` +
            `👤 Role: ${role}\n` +
            `⚡ Department: ${department}\n` +
            `📅 Joined: ${joinedDate}\n\n` +
            `💬 "${quote}"\n\n` +
            `Welcome aboard, Innovator! Together we build the future. 🌌💫\n\n` +
            `#AiRALabs #WelcomeToTheTeam #Onboarding #Innovation #TechCommunity #FutureCreators @airalab`;

        navigator.clipboard.writeText(captionText);
        setCopiedCaption(true);
        toast.success("Instagram caption copied to clipboard!");
        setTimeout(() => setCopiedCaption(false), 3000);
    };

    const PosterContent = () => (
        <div className="w-[1080px] h-[1080px] bg-[#080711] text-white p-12 select-none flex flex-col justify-between relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-[#0a0918] to-[#05040b] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="absolute top-10 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-950 border border-purple-400/50 shadow-lg shadow-purple-600/40 flex items-center justify-center text-white font-orbitron font-extrabold text-xl tracking-wider">
                            ▲
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="font-orbitron font-extrabold text-3xl tracking-widest text-white leading-none">
                                AIRA <span className="text-purple-400">LAB</span>
                            </div>
                            <div className="flex items-center gap-2 text-purple-300/80 font-orbitron text-xs tracking-[0.2em]">
                                <span>—</span>
                                <span>PROUD TO WELCOME</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <h1 className="font-orbitron font-black text-6xl text-white tracking-tight leading-none">
                            WELCOME
                        </h1>
                        <div className="flex items-center gap-3 my-1">
                            <span className="font-script text-5xl text-purple-400 -rotate-6 font-bold tracking-wide">
                                to
                            </span>
                            <span className="font-orbitron font-black text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-purple-400 tracking-tight">
                                AIRA LAB
                            </span>
                        </div>
                        <p className="text-xs font-orbitron tracking-[0.3em] text-slate-400 pt-1.5 uppercase font-medium">
                            A NEW MIND. A NEW ENERGY. A NEW IMPACT.
                        </p>
                    </div>
                </div>

                <div className="relative p-5 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 backdrop-blur-md max-w-[300px] shadow-xl">
                    <div className="text-purple-400 font-serif text-3xl leading-none mb-1">“</div>
                    <p className="text-[11px] font-orbitron font-semibold text-slate-200 tracking-wider leading-relaxed uppercase">
                        THE FUTURE IS CREATED BY THOSE WHO DARE TO BUILD IT.
                    </p>
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-12 gap-8 items-center py-2 flex-1">
                <div className="col-span-6 space-y-4 relative">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-900 to-slate-950 border-2 border-purple-400/60 shadow-lg shadow-purple-600/50 flex items-center justify-center text-white shrink-0">
                            <User size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                ROLE
                            </span>
                            <span className="font-bold text-xl text-white truncate block tracking-wide">
                                {role || "Chief Technical Officer"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-900 to-slate-950 border-2 border-purple-400/60 shadow-lg shadow-purple-600/50 flex items-center justify-center text-white shrink-0">
                            <Layers size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                DEPARTMENT
                            </span>
                            <span className="font-bold text-xl text-white truncate block tracking-wide">
                                {department || "Technical Wing"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-indigo-900 to-slate-950 border-2 border-purple-400/60 shadow-lg shadow-purple-600/50 flex items-center justify-center text-white shrink-0">
                            <Calendar size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                JOINED IN
                            </span>
                            <span className="font-bold text-xl text-white truncate block tracking-wide">
                                {joinedDate || "March 2026"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-5 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 backdrop-blur-md relative shadow-xl">
                        <span className="text-purple-400 font-serif text-3xl font-bold leading-none">“</span>
                        <p className="text-sm text-slate-200 italic leading-relaxed px-2 py-1 font-sans">
                            {quote}
                        </p>
                        <span className="text-purple-400 font-serif text-3xl font-bold leading-none block text-right">”</span>
                    </div>
                </div>

                <div className="col-span-6 relative flex justify-center">
                    <div className="relative w-full aspect-[4/5] rounded-3xl p-2 bg-gradient-to-b from-purple-500/50 via-indigo-600/30 to-purple-900/60 shadow-2xl overflow-hidden border border-purple-400/50">
                        <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/50 text-[10px] font-orbitron font-bold text-white tracking-wider flex items-center gap-1.5 shadow-xl">
                            <span>OFFICIAL MEMBER</span>
                            <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        </div>

                        <div 
                            className="absolute top-1/2 left-2 z-20 text-[10px] font-orbitron tracking-[0.3em] text-slate-400/90 uppercase font-semibold pointer-events-none"
                            style={{
                                transform: "translateY(-50%) rotate(-90deg)",
                                transformOrigin: "center center",
                                whiteSpace: "nowrap"
                            }}
                        >
                            WELCOME ABOARD, INNOVATOR!
                        </div>

                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-black flex items-center justify-center">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={name}
                                    className="w-full h-full object-cover object-center"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                                    <User size={64} className="mb-2 text-purple-400/40" />
                                    <span className="text-xs font-orbitron">No Photo Provided</span>
                                </div>
                            )}

                            <div className="absolute bottom-0 right-0 left-0 h-32 bg-gradient-to-t from-black via-black/85 to-transparent flex items-end justify-end p-5 z-10">
                                <div className="text-right">
                                    <div className="font-script text-5xl text-purple-300 font-bold drop-shadow-[0_2px_12px_rgba(168,85,247,0.9)] -rotate-3 tracking-wide">
                                        {signatureName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-3 pt-2">
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-9 h-9 rounded-lg bg-purple-900/40 text-purple-300 flex items-center justify-center mb-1.5 border border-purple-500/30">
                            <Rocket size={18} />
                        </div>
                        <span className="text-xs font-orbitron font-bold text-white tracking-wider block">
                            INNOVATE
                        </span>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                            Ideas into Impact
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-9 h-9 rounded-lg bg-indigo-900/40 text-indigo-300 flex items-center justify-center mb-1.5 border border-indigo-500/30">
                            <Search size={18} />
                        </div>
                        <span className="text-xs font-orbitron font-bold text-white tracking-wider block">
                            RESEARCH
                        </span>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                            Explore. Learn. Grow
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-9 h-9 rounded-lg bg-purple-900/40 text-purple-300 flex items-center justify-center mb-1.5 border border-purple-500/30">
                            <Code size={18} />
                        </div>
                        <span className="text-xs font-orbitron font-bold text-white tracking-wider block">
                            COLLABORATE
                        </span>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                            Together We Build
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-9 h-9 rounded-lg bg-indigo-900/40 text-indigo-300 flex items-center justify-center mb-1.5 border border-indigo-500/30">
                            <Star size={18} />
                        </div>
                        <span className="text-xs font-orbitron font-bold text-white tracking-wider block">
                            EXCEL
                        </span>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                            Excellence is Habit
                        </span>
                    </div>
                </div>

                <div className="pt-3 border-t border-purple-500/30 flex items-center justify-between text-xs font-orbitron text-slate-400 tracking-wider">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold">
                        <Globe size={14} /> www.aira-lab.in
                    </div>

                    <div className="tracking-[0.25em] text-slate-300 font-medium">
                        INNOVATION  •  RESEARCH  •  EXCELLENCE
                    </div>

                    <div className="flex items-center gap-3 text-slate-300 font-bold text-xs">
                        <span>[IG]</span>
                        <span>[in]</span>
                        <span>[X]</span>
                        <span>[YT]</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Orbitron:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                    
                    .font-script {
                        font-family: 'Dancing Script', 'Caveat', cursive;
                    }
                `}</style>

                {/* Hidden offscreen node for 1:1 html2canvas export */}
                <div 
                    style={{
                        position: "fixed",
                        left: "-9999px",
                        top: "-9999px",
                        width: "1080px",
                        height: "1080px",
                        overflow: "hidden",
                        zIndex: -9999,
                    }}
                >
                    <div ref={exportRef}>
                        <PosterContent />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-6xl bg-[#0b0a16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-aira-cyan/20 border border-aira-cyan/40 flex items-center justify-center text-aira-cyan">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-orbitron font-bold text-white">
                                    Onboarding Welcome Poster Studio
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Customize fields and export exact-match 1080×1080 Instagram poster
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-6 gap-6">
                        
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setSignatureName(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Role / Designation</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="e.g. Chief Technical Officer"
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Department / Wing</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50 mb-2"
                                    />
                                    <div className="flex flex-wrap gap-1.5">
                                        {departmentOptions.map((dept) => (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => setDepartment(dept)}
                                                className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                                                    department === dept
                                                        ? "bg-aira-cyan/20 border-aira-cyan text-aira-cyan font-medium"
                                                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200"
                                                }`}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Joined Date</label>
                                    <input
                                        type="text"
                                        value={joinedDate}
                                        onChange={(e) => setJoinedDate(e.target.value)}
                                        placeholder="e.g. March 2026"
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Welcome Quote</label>
                                    <textarea
                                        rows={2}
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Photo Image URL</label>
                                    <input
                                        type="text"
                                        value={photoUrl}
                                        onChange={(e) => setPhotoUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 space-y-2.5">
                                <button
                                    disabled={downloading}
                                    onClick={handleDownloadPoster}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-aira-cyan via-purple-600 to-aira-magenta text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" /> Exporting 1080×1080 PNG...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} /> Download IG Poster PNG (1080×1080)
                                        </>
                                    )}
                                </button>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleCopyCaption}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                                    >
                                        {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        {copiedCaption ? "Caption Copied!" : "Copy IG Caption"}
                                    </button>

                                    <button
                                        onClick={handleDownloadRawPhoto}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                                    >
                                        <ImageIcon size={14} className="text-aira-cyan" />
                                        Save Raw Photo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl border border-white/5">
                            <span className="text-[11px] text-slate-400 font-orbitron mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={12} className="text-aira-cyan" /> Live Preview
                            </span>

                            <div className="w-full max-w-[500px] aspect-square overflow-hidden shadow-2xl rounded-xl border border-purple-500/30 relative bg-[#080711]">
                                <div
                                    style={{
                                        width: "1080px",
                                        height: "1080px",
                                        transform: "scale(0.462963)",
                                        transformOrigin: "top left",
                                    }}
                                >
                                    <PosterContent />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
