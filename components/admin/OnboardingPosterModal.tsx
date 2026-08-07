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
    const posterRef = useRef<HTMLDivElement>(null);
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

    // Popular departments list
    const departmentOptions = [
        "Technical Wing",
        "Design & Media Wing",
        "AI & Research Wing",
        "Management & Ops",
        "Cybersecurity Wing",
        "Core Team"
    ];

    // Initialize values when applicant changes or modal opens
    useEffect(() => {
        if (applicant) {
            setName(applicant.name || "Team Member");
            setSignatureName(applicant.name || "Team Member");
            setRole(applicant.interest || "Core Developer");
            setPhotoUrl(applicant.photo || "");
            
            // Format joined date: e.g. "March 2026"
            const dateObj = applicant.createdAt ? new Date(applicant.createdAt) : new Date();
            const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            setJoinedDate(formattedDate);

            // Default quote
            const defaultQuote = applicant.message && applicant.message.length > 5
                ? applicant.message.length > 90 
                    ? applicant.message.substring(0, 87) + "..."
                    : applicant.message
                : "Building robust systems, scalable solutions and smarter tomorrows.";
            setQuote(defaultQuote);
        }
    }, [applicant, open]);

    if (!open || !applicant) return null;

    // Handle poster download via html2canvas
    const handleDownloadPoster = async () => {
        if (!posterRef.current) return;
        setDownloading(true);
        const toastId = toast.loading("Generating high-resolution poster PNG...");

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));

            const canvas = await html2canvas(posterRef.current, {
                scale: 2, // High resolution (2160x2160)
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#06050C",
                logging: false,
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

    // Download raw candidate photo
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
            console.error("Photo download error:", error);
            const link = document.createElement("a");
            link.href = photoUrl;
            link.target = "_blank";
            link.download = `${name}_Photo`;
            link.click();
        }
    };

    // Copy formatted IG Caption
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Orbitron:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                    
                    .font-script {
                        font-family: 'Dancing Script', 'Caveat', cursive;
                    }
                `}</style>

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
                                    Onboarding Welcome Poster Generator
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Customize details and export 1080×1080 high-res Instagram graphic
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

                    {/* Modal Content - Split 2 Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-6 gap-6">
                        
                        {/* ══ LEFT SIDE: EDIT CONTROLS ══ */}
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="p-3 bg-aira-purple/10 border border-aira-purple/20 rounded-xl text-xs text-violet-300 flex items-center gap-2">
                                    <Sparkles size={14} className="shrink-0 text-aira-cyan" />
                                    <span>Values auto-filled from applicant profile. Edit anything live before downloading.</span>
                                </div>

                                {/* Dynamic Field: Candidate Name */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setSignatureName(e.target.value);
                                        }}
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                {/* Dynamic Field: Role */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Role / Designation</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="e.g. Chief Technical Officer"
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                {/* Dynamic Field: Department */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Department / Wing</label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-aira-cyan/50"
                                        />
                                        <div className="flex flex-wrap gap-1.5">
                                            {departmentOptions.map((dept) => (
                                                <button
                                                    key={dept}
                                                    type="button"
                                                    onClick={() => setDepartment(dept)}
                                                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
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
                                </div>

                                {/* Dynamic Field: Joined Date */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Joined In (Month & Year)</label>
                                    <input
                                        type="text"
                                        value={joinedDate}
                                        onChange={(e) => setJoinedDate(e.target.value)}
                                        placeholder="e.g. March 2026"
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-aira-cyan/50"
                                    />
                                </div>

                                {/* Dynamic Field: Quote */}
                                <div>
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Welcome Quote / Statement</label>
                                    <textarea
                                        rows={2}
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50 resize-none"
                                    />
                                </div>

                                {/* Photo URL */}
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

                            {/* Export Action Buttons */}
                            <div className="pt-4 border-t border-white/10 space-y-2.5">
                                <button
                                    disabled={downloading}
                                    onClick={handleDownloadPoster}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-aira-cyan via-purple-600 to-aira-magenta text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" /> Generating High-Res PNG...
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

                        {/* ══ RIGHT SIDE: LIVE POSTER PREVIEW (1080x1080 CANVAS) ══ */}
                        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/50 p-4 rounded-xl border border-white/5">
                            <span className="text-[11px] text-slate-400 font-orbitron mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={12} className="text-aira-cyan" /> Live 1080×1080 Instagram Canvas Preview
                            </span>

                            {/* Container with fixed ratio preview */}
                            <div className="w-full max-w-[500px] aspect-square overflow-hidden shadow-2xl rounded-xl border border-purple-500/30 relative group">
                                
                                {/* ══ ACTUAL 1080x1080 POSTER DOM NODE TO CAPTURE ══ */}
                                <div
                                    id="onboarding-poster-canvas"
                                    ref={posterRef}
                                    style={{
                                        width: "1080px",
                                        height: "1080px",
                                        transform: "scale(0.462963)",
                                        transformOrigin: "top left",
                                    }}
                                    className="relative bg-[#06050C] text-white p-12 select-none flex flex-col justify-between overflow-hidden font-sans"
                                >
                                    {/* Cosmic background effects */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-[#070614] to-[#040308] pointer-events-none" />
                                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
                                    <div className="absolute top-1/2 -left-32 w-80 h-80 bg-aira-cyan/20 rounded-full blur-[100px] pointer-events-none" />
                                    
                                    {/* Dot grid accent overlay */}
                                    <div 
                                        className="absolute inset-0 opacity-[0.07] pointer-events-none"
                                        style={{
                                            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                                            backgroundSize: "24px 24px",
                                        }}
                                    />

                                    {/* Tech line graphic accents */}
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent pointer-events-none" />

                                    {/* ══ TOP ROW: LOGO & HEADER ══ */}
                                    <div className="relative z-10 flex items-start justify-between">
                                        {/* Left Header */}
                                        <div className="space-y-2">
                                            {/* Logo */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 border border-purple-400/40 shadow-lg shadow-purple-600/40 flex items-center justify-center text-white font-orbitron font-extrabold text-xl tracking-wider">
                                                    ▲
                                                </div>
                                                <div>
                                                    <div className="font-orbitron font-extrabold text-2xl tracking-widest text-white leading-none">
                                                        AIRA <span className="text-purple-400">LAB</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Proud to Welcome */}
                                            <div className="flex items-center gap-3 pt-3">
                                                <div className="w-8 h-[2px] bg-purple-500/60" />
                                                <span className="text-xs font-orbitron font-semibold text-purple-300 tracking-[0.25em] uppercase">
                                                    PROUD TO WELCOME
                                                </span>
                                                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                            </div>

                                            {/* Big Title */}
                                            <div className="pt-1">
                                                <h1 className="font-orbitron font-extrabold text-5xl text-white tracking-wide leading-none">
                                                    WELCOME
                                                </h1>
                                                <div className="flex items-center gap-3 my-0.5">
                                                    <span className="font-script text-4xl text-purple-400 -rotate-6 font-bold tracking-wide">
                                                        to
                                                    </span>
                                                    <span className="font-orbitron font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-aira-cyan tracking-wide">
                                                        AIRA LAB
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-orbitron tracking-[0.25em] text-slate-400 pt-1 uppercase">
                                                    A NEW MIND. A NEW ENERGY. A NEW IMPACT.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Top Right Quote Box */}
                                        <div className="relative p-4 rounded-xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-md max-w-[280px]">
                                            <div className="text-purple-400 font-serif text-3xl leading-none mb-1">“</div>
                                            <p className="text-[11px] font-orbitron font-medium text-slate-300 tracking-wider leading-relaxed uppercase">
                                                THE FUTURE IS CREATED BY THOSE WHO DARE TO BUILD IT.
                                            </p>
                                        </div>
                                    </div>

                                    {/* ══ MIDDLE BODY: DYNAMIC FIELDS & PORTRAIT ══ */}
                                    <div className="relative z-10 grid grid-cols-12 gap-8 items-center py-4">
                                        
                                        {/* Left Side: 3 Pills + Quote */}
                                        <div className="col-span-6 space-y-4">
                                            
                                            {/* Pill 1: Role */}
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-md shadow-md">
                                                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                                                    <User size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-orbitron tracking-widest text-purple-400 uppercase block">
                                                        ROLE
                                                    </span>
                                                    <span className="font-bold text-lg text-white truncate block">
                                                        {role || "Team Member"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Pill 2: Department */}
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-md shadow-md">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-900/40 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                                                    <Layers size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-orbitron tracking-widest text-purple-400 uppercase block">
                                                        DEPARTMENT
                                                    </span>
                                                    <span className="font-bold text-lg text-white truncate block">
                                                        {department || "Technical Wing"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Pill 3: Joined Date */}
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 backdrop-blur-md shadow-md">
                                                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                                                    <Calendar size={22} />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] font-orbitron tracking-widest text-purple-400 uppercase block">
                                                        JOINED IN
                                                    </span>
                                                    <span className="font-bold text-lg text-white truncate block">
                                                        {joinedDate || "March 2026"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quote Box */}
                                            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/20 backdrop-blur-md relative">
                                                <span className="text-purple-400 font-serif text-2xl font-bold leading-none">“</span>
                                                <p className="text-xs text-slate-300 italic leading-relaxed px-2">
                                                    {quote}
                                                </p>
                                                <span className="text-purple-400 font-serif text-2xl font-bold leading-none block text-right">”</span>
                                            </div>
                                        </div>

                                        {/* Right Side: Portrait Frame */}
                                        <div className="col-span-6 relative flex justify-center">
                                            
                                            {/* Frame Box */}
                                            <div className="relative w-full aspect-[4/5] rounded-3xl p-1.5 bg-gradient-to-b from-purple-500/50 via-indigo-500/30 to-purple-900/60 shadow-2xl overflow-hidden border border-purple-400/40">
                                                
                                                {/* Official Member Badge */}
                                                <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-slate-950/80 border border-purple-400/40 text-[10px] font-orbitron font-semibold text-white tracking-wider flex items-center gap-1.5 shadow-lg">
                                                    <span>OFFICIAL MEMBER</span>
                                                    <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                                                </div>

                                                {/* Vertical Accent Text */}
                                                <div className="absolute top-12 left-3 z-20 text-[9px] font-orbitron tracking-[0.3em] text-slate-400/80 uppercase [writing-mode:vertical-lr] rotate-180">
                                                    WELCOME ABOARD, INNOVATOR!
                                                </div>

                                                {/* Image Container with starry glow */}
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

                                                    {/* Bottom Corner Overlay with Cursive Signature */}
                                                    <div className="absolute bottom-0 right-0 left-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-end p-4 z-10">
                                                        <div className="text-right">
                                                            <div className="font-script text-4xl text-purple-300 font-bold drop-shadow-[0_2px_10px_rgba(168,85,247,0.8)] -rotate-3">
                                                                {signatureName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ══ BOTTOM SECTION: 4 PILLAR CARDS & FOOTER ══ */}
                                    <div className="relative z-10 space-y-4 pt-2">
                                        
                                        {/* 4 Pillar Cards */}
                                        <div className="grid grid-cols-4 gap-3">
                                            
                                            {/* Pillar 1 */}
                                            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-center flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-300 flex items-center justify-center mb-1.5">
                                                    <Rocket size={16} />
                                                </div>
                                                <span className="text-[11px] font-orbitron font-bold text-white tracking-wider block">
                                                    INNOVATE
                                                </span>
                                                <span className="text-[9px] text-slate-400 block pt-0.5">
                                                    Ideas into Impact
                                                </span>
                                            </div>

                                            {/* Pillar 2 */}
                                            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-center flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-900/30 text-indigo-300 flex items-center justify-center mb-1.5">
                                                    <Search size={16} />
                                                </div>
                                                <span className="text-[11px] font-orbitron font-bold text-white tracking-wider block">
                                                    RESEARCH
                                                </span>
                                                <span className="text-[9px] text-slate-400 block pt-0.5">
                                                    Explore. Learn. Grow
                                                </span>
                                            </div>

                                            {/* Pillar 3 */}
                                            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-center flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-purple-900/30 text-purple-300 flex items-center justify-center mb-1.5">
                                                    <Code size={16} />
                                                </div>
                                                <span className="text-[11px] font-orbitron font-bold text-white tracking-wider block">
                                                    COLLABORATE
                                                </span>
                                                <span className="text-[9px] text-slate-400 block pt-0.5">
                                                    Together We Build
                                                </span>
                                            </div>

                                            {/* Pillar 4 */}
                                            <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 text-center flex flex-col items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-900/30 text-indigo-300 flex items-center justify-center mb-1.5">
                                                    <Star size={16} />
                                                </div>
                                                <span className="text-[11px] font-orbitron font-bold text-white tracking-wider block">
                                                    EXCEL
                                                </span>
                                                <span className="text-[9px] text-slate-400 block pt-0.5">
                                                    Excellence is Habit
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Bar */}
                                        <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-orbitron text-slate-400 tracking-wider">
                                            <div className="flex items-center gap-1.5 text-purple-300">
                                                <Globe size={13} /> www.aira-lab.in
                                            </div>

                                            <div className="tracking-[0.2em] text-slate-400">
                                                INNOVATION  •  RESEARCH  •  EXCELLENCE
                                            </div>

                                            <div className="flex items-center gap-3 text-slate-300 font-bold">
                                                <span>[IG]</span>
                                                <span>[in]</span>
                                                <span>[X]</span>
                                                <span>[YT]</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
