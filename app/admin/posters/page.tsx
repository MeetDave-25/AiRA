"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
    Sparkles, Download, Copy, RefreshCw, User, Layers, Calendar, 
    Rocket, Search, Code, Star, Globe, Check, Image as ImageIcon,
    UserCheck, Move, RotateCcw, ZoomIn, ZoomOut
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
    const exportRef = useRef<HTMLDivElement>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Dynamic poster text state
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("Technical Wing");
    const [joinedDate, setJoinedDate] = useState("");
    const [quote, setQuote] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [signatureName, setSignatureName] = useState("");

    // Interactive Drag & Photo Zoom Controls State
    const [enableDrag, setEnableDrag] = useState(true);
    const [resetKey, setResetKey] = useState(0);
    const [photoScale, setPhotoScale] = useState(1);
    const [photoY, setPhotoY] = useState(0);

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
        setRole(cand.interest || cand.role || "Chief Technical Officer");
        setPhotoUrl(cand.photo || cand.avatar || "");

        // Format joined date: e.g. "March 2026"
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

        // Reset photo zoom
        setPhotoScale(1);
        setPhotoY(0);
    };

    const filteredCandidates = candidates.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.interest && c.interest.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Reset element positions
    const handleResetPositions = () => {
        setResetKey((prev) => prev + 1);
        setPhotoScale(1);
        setPhotoY(0);
        toast.success("Element positions & zoom reset to default!");
    };

    // Export 1080x1080 PNG cleanly without cutoff
    const handleDownloadPoster = async () => {
        if (!exportRef.current) return;
        setDownloading(true);
        const toastId = toast.loading("Exporting 1080×1080 HD poster...");

        try {
            await document.fonts.ready;
            await new Promise((resolve) => setTimeout(resolve, 400));

            const canvas = await html2canvas(exportRef.current, {
                width: 1080,
                height: 1080,
                scale: 2, // 2160x2160 ultra sharp output
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#06050e",
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 1080,
                windowHeight: 1080,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = `AiRA_Welcome_${name.replace(/\s+/g, "_")}.png`;
                    saveAs(blob, filename);
                    toast.success("Poster PNG downloaded cleanly!", { id: toastId });
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

    // Poster Layout Template JSX - DRAGGABLE & FREE POSITIONING READY
    const PosterContent = () => (
        <div 
            style={{ width: "1080px", height: "1080px", boxSizing: "border-box" }}
            className="bg-[#06050e] text-white p-10 select-none flex flex-col justify-between relative overflow-hidden font-sans"
        >
            {/* Background glowing effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-purple-600/35 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Dot grid pattern */}
            <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            {/* ══ TOP ROW: LOGO & HEADLINE & QUOTE ══ */}
            <div className="relative z-10 flex items-start justify-between">
                
                {/* Left Header Draggable */}
                <motion.div 
                    key={`header_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`space-y-3 ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-1 transition-shadow" : ""}`}
                >
                    {/* Logo and Proud to Welcome line */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-700 to-indigo-950 border border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white font-orbitron font-extrabold text-2xl tracking-tighter">
                                ▲
                            </div>
                            <div className="leading-tight">
                                <div className="font-orbitron font-black text-2xl tracking-widest text-white">AIRA</div>
                                <div className="font-orbitron font-bold text-xs tracking-[0.35em] text-purple-400">LAB</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400/80 font-orbitron text-[11px] tracking-[0.25em] uppercase">
                            <div className="w-12 h-[1px] bg-gradient-to-r from-purple-500/80 to-purple-500/20" />
                            <span>PROUD TO WELCOME</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className="pt-1">
                        <h1 className="font-orbitron font-black text-6xl text-white tracking-tight leading-none uppercase">
                            WELCOME
                        </h1>
                        <div className="flex items-center gap-2 my-0.5 relative">
                            <span className="font-script text-5xl text-purple-400 -rotate-6 font-bold tracking-wide -mt-2 -mb-2 z-10 drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]">
                                to
                            </span>
                            <span className="font-orbitron font-black text-6xl text-white tracking-tight leading-none uppercase">
                                AIRA LAB
                            </span>
                        </div>
                        <p className="text-[11px] font-orbitron tracking-[0.3em] text-purple-300/90 pt-2 uppercase font-medium">
                            A NEW MIND. A NEW ENERGY. A NEW IMPACT.
                        </p>
                    </div>
                </motion.div>

                {/* Top Right Quote Box Draggable */}
                <motion.div 
                    key={`topquote_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`relative p-5 rounded-2xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md max-w-[310px] shadow-2xl ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50" : ""}`}
                >
                    <div className="text-purple-400 font-serif text-3xl leading-none mb-1">“</div>
                    <p className="text-[11px] font-orbitron font-bold text-slate-200 tracking-widest leading-relaxed uppercase">
                        THE FUTURE IS CREATED BY THOSE WHO DARE TO BUILD IT.
                    </p>
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-40">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                    </div>
                </motion.div>
            </div>

            {/* ══ MIDDLE BODY: TIMELINE & PORTRAIT ══ */}
            <div className="relative z-10 grid grid-cols-12 gap-8 items-center py-2 flex-1">
                
                {/* Left Side: 3 Connected Timeline Circle Nodes + Quote Card Draggable */}
                <motion.div 
                    key={`lefttimeline_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`col-span-6 space-y-4 relative ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-2" : ""}`}
                >
                    {/* Vertical Line */}
                    <div className="absolute top-7 bottom-24 left-9 w-[2px] bg-gradient-to-b from-purple-500/60 via-purple-500/40 to-transparent z-0" />

                    {/* Node 1: ROLE */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
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

                    {/* Node 2: DEPARTMENT */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
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

                    {/* Node 3: JOINED IN */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
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

                    {/* Quote Card */}
                    <div className="mt-4 p-5 rounded-2xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md relative shadow-xl flex gap-3">
                        <div className="w-6 shrink-0 grid grid-cols-2 gap-1.5 opacity-30 self-center">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            ))}
                        </div>

                        <div className="flex-1">
                            <span className="text-purple-400 font-serif text-3xl font-bold leading-none">“</span>
                            <p className="text-xs text-slate-200 italic leading-relaxed px-1 py-1 font-sans">
                                {quote}
                            </p>
                            <span className="text-purple-400 font-serif text-3xl font-bold leading-none block text-right">”</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Member Portrait Frame Draggable */}
                <motion.div 
                    key={`portrait_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`col-span-6 relative flex justify-center ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-3xl p-1" : ""}`}
                >
                    <div className="relative w-full aspect-[4/5] rounded-3xl p-2 bg-gradient-to-b from-purple-500/50 via-indigo-600/30 to-purple-900/60 shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden border border-purple-400/50">
                        
                        {/* Top Right Pill Badge */}
                        <div className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-purple-400/50 text-[10px] font-orbitron font-bold text-white tracking-wider flex items-center gap-1.5 shadow-xl">
                            <span>OFFICIAL MEMBER</span>
                            <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                        </div>

                        {/* Vertical Accent Text */}
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

                        {/* Photo Container with Photo Fit Scaling & Offset */}
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-black flex items-center justify-center">
                            <div className="absolute top-1/4 w-72 h-72 bg-purple-600/40 rounded-full blur-3xl pointer-events-none" />

                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={name}
                                    style={{
                                        transform: `scale(${photoScale}) translateY(${photoY}px)`,
                                        transition: "transform 0.15s ease-out"
                                    }}
                                    className="w-full h-full object-cover object-center relative z-10"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900 relative z-10">
                                    <User size={64} className="mb-2 text-purple-400/40" />
                                    <span className="text-xs font-orbitron">No Photo Provided</span>
                                </div>
                            )}

                            {/* Bottom Corner Overlay with Signature */}
                            <div className="absolute bottom-0 right-0 left-0 h-36 bg-gradient-to-t from-black via-black/85 to-transparent flex items-end justify-end p-5 z-20">
                                <div className="absolute bottom-4 right-4 text-purple-900/30 text-7xl font-orbitron font-black pointer-events-none">
                                    ▲
                                </div>
                                <div className="text-right relative z-10">
                                    <div className="font-script text-5xl text-purple-300 font-bold drop-shadow-[0_2px_12px_rgba(168,85,247,0.9)] -rotate-3 tracking-wide">
                                        {signatureName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ══ BOTTOM SECTION: 4 PILLAR CARDS & FOOTER BAR DRAGGABLE ══ */}
            <motion.div 
                key={`bottompillars_${resetKey}`}
                drag={enableDrag}
                dragMomentum={false}
                dragElastic={0}
                className={`relative z-10 space-y-3 pt-2 ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-1" : ""}`}
            >
                <div className="grid grid-cols-4 gap-4 p-1 rounded-2xl bg-[#0c0a1b]/60 border border-purple-500/20 backdrop-blur-md">
                    <div className="p-3 rounded-xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
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

                {/* Footer Bar */}
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
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@700&family=Orbitron:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .font-script {
                    font-family: 'Dancing Script', 'Caveat', cursive;
                }
            `}</style>

            {/* ══ HIDDEN OFFSCREEN UNTRANSFORMED DOM NODE FOR 1:1 EXACT HTML2CANVAS CAPTURE ══ */}
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

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-900 border border-purple-500/40 flex items-center justify-center text-aira-cyan shadow-lg shadow-purple-600/30">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl text-white">
                            Onboarding Poster Studio
                        </h1>
                        <p className="text-xs text-slate-400">
                            Drag any element to move it freely, zoom photo & export 1080×1080 PNG
                        </p>
                    </div>
                </div>

                {/* Reset Positions & Drag Toggle Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setEnableDrag(!enableDrag)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            enableDrag 
                                ? "bg-purple-600/30 border-purple-500 text-purple-200" 
                                : "bg-slate-900 border-white/10 text-slate-400"
                        }`}
                    >
                        <Move size={14} /> {enableDrag ? "Drag Mode Enabled" : "Drag Mode Disabled"}
                    </button>
                    <button
                        type="button"
                        onClick={handleResetPositions}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all"
                        title="Reset all element positions"
                    >
                        <RotateCcw size={14} /> Reset Positions
                    </button>
                </div>
            </div>

            {/* Main Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ══ LEFT COLUMN: CANDIDATE PICKER & CONTROLS ══ */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Candidate Picker Box */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                        <h2 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <UserCheck size={16} className="text-aira-cyan" /> 1. Select Candidate
                        </h2>

                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search candidate..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50"
                            />
                        </div>

                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
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

                    {/* Edit Form Fields & Photo Adjust */}
                    <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
                        <h2 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" /> 2. Edit Text & Photo Zoom
                        </h2>

                        {/* Photo Zoom & Position Sliders */}
                        <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-2">
                            <span className="text-xs font-semibold text-purple-300 block flex items-center justify-between">
                                <span>Adjust Photo Fit & Zoom</span>
                                <span className="text-[11px] text-slate-400">{Math.round(photoScale * 100)}%</span>
                            </span>
                            <div className="flex items-center gap-3">
                                <ZoomOut size={14} className="text-slate-400" />
                                <input
                                    type="range"
                                    min="0.8"
                                    max="2.5"
                                    step="0.05"
                                    value={photoScale}
                                    onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                                    className="w-full accent-purple-500 cursor-pointer"
                                />
                                <ZoomIn size={14} className="text-slate-400" />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[11px] text-slate-400">Vertical Offset (Nudge Up/Down)</span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPhotoY((prev) => prev - 10)}
                                        className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 hover:text-white"
                                    >
                                        ▲ Up
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPhotoY((prev) => prev + 10)}
                                        className="px-2 py-0.5 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 hover:text-white"
                                    >
                                        ▼ Down
                                    </button>
                                </div>
                            </div>
                        </div>

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

                {/* ══ RIGHT COLUMN: LIVE PREVIEW & DRAG CANVAS ══ */}
                <div className="lg:col-span-7 flex flex-col items-center justify-start bg-slate-950/60 p-6 rounded-2xl border border-white/5">
                    <div className="w-full flex items-center justify-between mb-4">
                        <span className="text-xs font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-aira-cyan" /> Interactive Drag-and-Move Canvas
                        </span>
                        <span className="text-[11px] text-purple-300 font-mono">
                            {enableDrag ? "✨ Drag any block on canvas below" : "Locked"}
                        </span>
                    </div>

                    {/* Display preview box */}
                    <div className="w-full max-w-[540px] aspect-square overflow-hidden shadow-2xl rounded-2xl border border-purple-500/40 relative bg-[#06050e]">
                        <div
                            style={{
                                width: "1080px",
                                height: "1080px",
                                transform: "scale(0.5)",
                                transformOrigin: "top left",
                            }}
                        >
                            <PosterContent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
