"use client";

import { useState, useEffect, useRef } from "react";
import { 
    Sparkles, Download, Copy, RefreshCw, User, Layers, Calendar, 
    Quote, Rocket, Search, Code, Star, Globe, Check, Image as ImageIcon,
    UserCheck, FileText, ChevronDown, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

interface Candidate {
    id: string;
    name: string;
    email?: string;
    role?: string;
    interest?: string | null;
    message?: string | null;
    photo?: string | null;
    avatar?: string | null;
    createdAt?: string;
    type: "APPLICATION" | "USER";
}

export default function PostersPage() {
    const posterRef = useRef<HTMLDivElement>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Dynamic poster fields state
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

    // Load candidates (applications + registered users)
    useEffect(() => {
        const loadCandidates = async () => {
            setIsLoading(true);
            try {
                const [appsRes, usersRes] = await Promise.all([
                    fetch("/api/applications"),
                    fetch("/api/users")
                ]);

                const appsData = appsRes.ok ? await appsRes.json() : [];
                const usersData = usersRes.ok ? await usersRes.json() : [];

                const combined: Candidate[] = [
                    ...appsData.map((app: any) => ({
                        id: `app_${app.id}`,
                        name: app.name,
                        email: app.email,
                        interest: app.interest,
                        message: app.message,
                        photo: app.photo,
                        createdAt: app.createdAt,
                        type: "APPLICATION" as const,
                    })),
                    ...usersData.map((usr: any) => ({
                        id: `usr_${usr.id}`,
                        name: usr.name,
                        email: usr.email,
                        role: usr.role,
                        avatar: usr.avatar,
                        createdAt: usr.createdAt,
                        type: "USER" as const,
                    }))
                ];

                setCandidates(combined);

                // Auto select first candidate if available
                if (combined.length > 0) {
                    selectCandidate(combined[0]);
                }
            } catch (error) {
                console.error("Error loading candidates:", error);
                toast.error("Failed to load candidates");
            } finally {
                setIsLoading(false);
            }
        };

        loadCandidates();
    }, []);

    // Select candidate and fill dynamic fields
    const selectCandidate = (cand: Candidate) => {
        setSelectedId(cand.id);
        setName(cand.name || "Team Member");
        setSignatureName(cand.name || "Team Member");
        setRole(cand.interest || cand.role || "Core Developer");
        setPhotoUrl(cand.photo || cand.avatar || "");

        // Format joined date: e.g. "March 2026" based on application or registration date
        const dateObj = cand.createdAt ? new Date(cand.createdAt) : new Date();
        const formattedDate = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        setJoinedDate(formattedDate);

        // Quote
        const defaultQuote = cand.message && cand.message.length > 5
            ? cand.message.length > 90 
                ? cand.message.substring(0, 87) + "..."
                : cand.message
            : "Building robust systems, scalable solutions and smarter tomorrows.";
        setQuote(defaultQuote);
    };

    // Filter candidates by search query
    const filteredCandidates = candidates.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.interest && c.interest.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Download poster PNG
    const handleDownloadPoster = async () => {
        if (!posterRef.current) return;
        setDownloading(true);
        const toastId = toast.loading("Exporting 1080×1080 high-res PNG...");

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));

            const canvas = await html2canvas(posterRef.current, {
                scale: 2,
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
                    throw new Error("Failed to export image");
                }
                setDownloading(false);
            }, "image/png");
        } catch (error: any) {
            console.error("Export error:", error);
            toast.error(error?.message || "Failed to download poster", { id: toastId });
            setDownloading(false);
        }
    };

    // Download raw photo
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

    // Copy IG caption
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
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Orbitron:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .font-script {
                    font-family: 'Dancing Script', 'Caveat', cursive;
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-6 border border-white/5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 border border-purple-500/40 flex items-center justify-center text-aira-cyan shadow-lg shadow-purple-600/30">
                            <Sparkles size={22} />
                        </div>
                        <div>
                            <h1 className="font-orbitron font-bold text-2xl text-white">
                                Onboarding Poster Studio
                            </h1>
                            <p className="text-xs text-slate-400">
                                Select a candidate to auto-populate their photo, role & join date for Instagram welcome cards
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ══ LEFT COLUMN: CANDIDATE SELECTOR & EDIT CONTROLS ══ */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Candidate Picker Box */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                        <h2 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <UserCheck size={16} className="text-aira-cyan" /> 1. Select Person
                        </h2>

                        {/* Search input */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50"
                            />
                        </div>

                        {/* Candidate Dropdown / Select List */}
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                            {isLoading ? (
                                <div className="p-4 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                                    <RefreshCw size={14} className="animate-spin text-aira-cyan" /> Loading candidates...
                                </div>
                            ) : filteredCandidates.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-xs">
                                    No candidates found
                                </div>
                            ) : (
                                filteredCandidates.map((cand) => {
                                    const isSelected = selectedId === cand.id;
                                    return (
                                        <button
                                            key={cand.id}
                                            type="button"
                                            onClick={() => selectCandidate(cand)}
                                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                                                isSelected
                                                    ? "bg-purple-900/40 border-purple-500/60 text-white shadow-md shadow-purple-900/20"
                                                    : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-900/60"
                                            }`}
                                        >
                                            {/* Avatar */}
                                            {cand.photo || cand.avatar ? (
                                                <img
                                                    src={cand.photo || cand.avatar || ""}
                                                    alt={cand.name}
                                                    className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-950 border border-white/10 flex items-center justify-center font-orbitron font-bold text-white text-xs shrink-0">
                                                    {cand.name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-xs text-white truncate block">
                                                        {cand.name}
                                                    </span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                                        cand.type === "APPLICATION" 
                                                            ? "bg-aira-cyan/15 text-aira-cyan border border-aira-cyan/30" 
                                                            : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                                    }`}>
                                                        {cand.type === "APPLICATION" ? "Applicant" : "Member"}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 truncate block">
                                                    {cand.interest || cand.role || "No role specified"}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Edit Poster Form Fields */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                        <h2 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" /> 2. Customize Poster Fields
                        </h2>

                        {/* Name */}
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

                        {/* Role */}
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

                        {/* Department */}
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

                        {/* Joined Date */}
                        <div>
                            <label className="text-xs text-slate-400 font-medium mb-1 block">Joined Date (Auto-Filled)</label>
                            <input
                                type="text"
                                value={joinedDate}
                                onChange={(e) => setJoinedDate(e.target.value)}
                                placeholder="e.g. March 2026"
                                className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-aira-cyan/50"
                            />
                        </div>

                        {/* Quote */}
                        <div>
                            <label className="text-xs text-slate-400 font-medium mb-1 block">Welcome Quote / Bio</label>
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

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
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
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                            >
                                {copiedCaption ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                {copiedCaption ? "Caption Copied!" : "Copy IG Caption"}
                            </button>

                            <button
                                onClick={handleDownloadRawPhoto}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                            >
                                <ImageIcon size={14} className="text-aira-cyan" />
                                Save Raw Photo
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ RIGHT COLUMN: LIVE 1080x1080 POSTER CANVAS PREVIEW ══ */}
                <div className="lg:col-span-7 flex flex-col items-center justify-start bg-slate-950/60 p-6 rounded-2xl border border-white/5">
                    <div className="w-full flex items-center justify-between mb-4">
                        <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-aira-cyan" /> Live 1080×1080 Instagram Poster Preview
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                            Aspect Ratio 1:1
                        </span>
                    </div>

                    {/* Outer Box Container */}
                    <div className="w-full max-w-[540px] aspect-square overflow-hidden shadow-2xl rounded-2xl border border-purple-500/30 relative bg-[#06050C]">
                        
                        {/* ══ 1080x1080 DOM CANVAS TO EXPORT ══ */}
                        <div
                            id="onboarding-poster-canvas"
                            ref={posterRef}
                            style={{
                                width: "1080px",
                                height: "1080px",
                                transform: "scale(0.5)", // 540 / 1080 scale for crisp preview box
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
        </div>
    );
}
