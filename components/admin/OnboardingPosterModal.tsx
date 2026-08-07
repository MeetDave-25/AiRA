"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Download, Copy, Sparkles, User, Layers, Calendar, Quote, 
    Rocket, Search, Code, Star, Globe, Check, Image as ImageIcon,
    RefreshCw, Move, RotateCcw, ZoomIn, ZoomOut, Maximize2, Type
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

type AspectRatioType = "1:1" | "4:5" | "9:16" | "16:9";

export function OnboardingPosterModal({ open, onClose, applicant }: OnboardingPosterModalProps) {
    const exportRef = useRef<HTMLDivElement>(null);
    const previewBoxRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);

    // Aspect Ratio & Dimensions State
    const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
    const [previewScale, setPreviewScale] = useState(0.44);

    // Dynamic poster text state
    const [welcomeText, setWelcomeText] = useState("WELCOME");
    const [taglineText, setTaglineText] = useState("A NEW MIND. A NEW ENERGY. A NEW IMPACT.");
    const [topQuoteText, setTopQuoteText] = useState("THE FUTURE IS CREATED BY THOSE WHO DARE TO BUILD IT.");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("Technical Wing");
    const [joinedDate, setJoinedDate] = useState("");
    const [quote, setQuote] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [signatureName, setSignatureName] = useState("");
    const [footerUrl, setFooterUrl] = useState("www.aira-lab.in");

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

    const aspectRatios = [
        { label: "1:1 Square (1080×1080)", value: "1:1" as AspectRatioType, desc: "IG Feed & LinkedIn" },
        { label: "4:5 Portrait (1080×1350)", value: "4:5" as AspectRatioType, desc: "Best IG Portrait Post" },
        { label: "9:16 Story (1080×1920)", value: "9:16" as AspectRatioType, desc: "IG Story & Reels" },
        { label: "16:9 Landscape (1920×1080)", value: "16:9" as AspectRatioType, desc: "LinkedIn & X Banner" }
    ];

    const getDimensions = (ratio: AspectRatioType) => {
        switch (ratio) {
            case "4:5": return { width: 1080, height: 1350 };
            case "9:16": return { width: 1080, height: 1920 };
            case "16:9": return { width: 1920, height: 1080 };
            case "1:1":
            default: return { width: 1080, height: 1080 };
        }
    };

    const currentDim = getDimensions(aspectRatio);

    useEffect(() => {
        const updateScale = () => {
            if (previewBoxRef.current) {
                const boxWidth = previewBoxRef.current.clientWidth;
                if (boxWidth > 0) {
                    setPreviewScale(boxWidth / currentDim.width);
                }
            }
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [aspectRatio, currentDim.width]);

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

            setPhotoScale(1);
            setPhotoY(0);
        }
    }, [applicant, open]);

    if (!open || !applicant) return null;

    const handleResetPositions = () => {
        setResetKey((prev) => prev + 1);
        setPhotoScale(1);
        setPhotoY(0);
        toast.success("Element positions & zoom reset to default!");
    };

    const handleDownloadPoster = async () => {
        if (!exportRef.current) return;
        setDownloading(true);
        const toastId = toast.loading(`Exporting ${currentDim.width}×${currentDim.height} HD poster...`);

        try {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }

            await document.fonts.ready;
            await new Promise((resolve) => setTimeout(resolve, 400));

            const canvas = await html2canvas(exportRef.current, {
                width: currentDim.width,
                height: currentDim.height,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#06050e",
                logging: false,
                scrollX: 0,
                scrollY: 0,
                windowWidth: currentDim.width,
                windowHeight: currentDim.height,
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const filename = `AiRA_Welcome_${name.replace(/\s+/g, "_")}_${aspectRatio.replace(":", "x")}.png`;
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
        <div 
            style={{ 
                width: `${currentDim.width}px`, 
                height: `${currentDim.height}px`, 
                boxSizing: "border-box" 
            }}
            className="bg-[#06050e] text-white p-12 select-none flex flex-col justify-between relative overflow-hidden font-sans"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-purple-600/35 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }}
            />

            <div className="relative z-10 flex items-start justify-between">
                <motion.div 
                    key={`header_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`space-y-3 ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-1" : ""}`}
                >
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

                    <div className="pt-1">
                        <h1 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setWelcomeText(e.currentTarget.textContent || "WELCOME")}
                            className="font-orbitron font-black text-6xl text-white tracking-tight leading-none uppercase outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                        >
                            {welcomeText}
                        </h1>
                        <div className="flex items-center gap-2 my-0.5 relative">
                            <span className="font-script text-5xl text-purple-400 -rotate-6 font-bold tracking-wide -mt-2 -mb-2 z-10 drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]">
                                to
                            </span>
                            <span className="font-orbitron font-black text-6xl text-white tracking-tight leading-none uppercase">
                                AIRA LAB
                            </span>
                        </div>
                        <p 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setTaglineText(e.currentTarget.textContent || "")}
                            className="text-[11px] font-orbitron tracking-[0.3em] text-purple-300/90 pt-2 uppercase font-medium outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                        >
                            {taglineText}
                        </p>
                    </div>
                </motion.div>

                <motion.div 
                    key={`topquote_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`relative p-5 rounded-2xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md max-w-[310px] shadow-2xl ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50" : ""}`}
                >
                    <div className="text-purple-400 font-serif text-3xl leading-none mb-1">“</div>
                    <p 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setTopQuoteText(e.currentTarget.textContent || "")}
                        className="text-[11px] font-orbitron font-bold text-slate-200 tracking-widest leading-relaxed uppercase outline-none focus:ring-1 focus:ring-purple-400/60 rounded p-1"
                    >
                        {topQuoteText}
                    </p>
                    <div className="absolute bottom-2 right-2 flex gap-1 opacity-40">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                    </div>
                </motion.div>
            </div>

            <div className={`relative z-10 grid grid-cols-12 gap-8 items-center py-4 flex-1 ${aspectRatio === "9:16" ? "my-6 space-y-6" : "my-2"}`}>
                <motion.div 
                    key={`lefttimeline_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`col-span-6 space-y-5 relative ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-2" : ""}`}
                >
                    <div className="absolute top-7 bottom-24 left-9 w-[2px] bg-gradient-to-b from-purple-500/60 via-purple-500/40 to-transparent z-0" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
                            <User size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                ROLE
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setRole(e.currentTarget.textContent || "")}
                                className="font-bold text-xl text-white truncate block tracking-wide outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                            >
                                {role || "Chief Technical Officer"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
                            <Layers size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                DEPARTMENT
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setDepartment(e.currentTarget.textContent || "")}
                                className="font-bold text-xl text-white truncate block tracking-wide outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                            >
                                {department || "Technical Wing"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0">
                            <Calendar size={24} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[11px] font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-0.5">
                                JOINED IN
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setJoinedDate(e.currentTarget.textContent || "")}
                                className="font-bold text-xl text-white truncate block tracking-wide outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                            >
                                {joinedDate || "March 2026"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-5 rounded-2xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md relative shadow-xl flex gap-3">
                        <div className="w-6 shrink-0 grid grid-cols-2 gap-1.5 opacity-30 self-center">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            ))}
                        </div>

                        <div className="flex-1">
                            <span className="text-purple-400 font-serif text-3xl font-bold leading-none">“</span>
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setQuote(e.currentTarget.textContent || "")}
                                className="text-xs text-slate-200 italic leading-relaxed px-1 py-1 font-sans outline-none focus:ring-1 focus:ring-purple-400/60 rounded"
                            >
                                {quote}
                            </p>
                            <span className="text-purple-400 font-serif text-3xl font-bold leading-none block text-right">”</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    key={`portrait_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`col-span-6 relative flex justify-center ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-3xl p-1" : ""}`}
                >
                    <div className={`relative w-full ${aspectRatio === "4:5" ? "aspect-[4/5.4]" : "aspect-[4/5]"} rounded-3xl p-2 bg-gradient-to-b from-purple-500/50 via-indigo-600/30 to-purple-900/60 shadow-[0_0_30px_rgba(168,85,247,0.3)] overflow-hidden border border-purple-400/50`}>
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

                            <div className="absolute bottom-0 right-0 left-0 h-36 bg-gradient-to-t from-black via-black/85 to-transparent flex items-end justify-end p-5 z-20">
                                <div className="absolute bottom-4 right-4 text-purple-900/30 text-7xl font-orbitron font-black pointer-events-none">
                                    ▲
                                </div>
                                <div className="text-right relative z-10">
                                    <div 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => setSignatureName(e.currentTarget.textContent || "")}
                                        className="font-script text-5xl text-purple-300 font-bold drop-shadow-[0_2px_12px_rgba(168,85,247,0.9)] -rotate-3 tracking-wide outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                                    >
                                        {signatureName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

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

                <div className="pt-3 border-t border-purple-500/30 flex items-center justify-between text-xs font-orbitron text-slate-400 tracking-wider">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold">
                        <Globe size={14} /> 
                        <span 
                            contentEditable 
                            suppressContentEditableWarning 
                            onBlur={(e) => setFooterUrl(e.currentTarget.textContent || "www.aira-lab.in")}
                            className="outline-none focus:ring-1 focus:ring-purple-400/60 rounded px-1"
                        >
                            {footerUrl}
                        </span>
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
                        width: `${currentDim.width}px`,
                        height: `${currentDim.height}px`,
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
                                    Aspect Ratios ({aspectRatio}), Direct Click-to-Edit text & free element dragging
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleResetPositions}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-all"
                            >
                                <RotateCcw size={13} /> Reset Layout
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-6 gap-6">
                        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                {/* Aspect Ratio Selector */}
                                <div className="p-3 bg-slate-900/90 border border-white/10 rounded-xl space-y-2">
                                    <span className="text-xs font-semibold text-purple-300 block flex items-center gap-1.5">
                                        <Maximize2 size={14} /> Aspect Ratio Format
                                    </span>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {aspectRatios.map((ratio) => (
                                            <button
                                                key={ratio.value}
                                                type="button"
                                                onClick={() => setAspectRatio(ratio.value)}
                                                className={`px-2.5 py-1.5 rounded-lg text-left border transition-all ${
                                                    aspectRatio === ratio.value
                                                        ? "bg-purple-600/30 border-purple-400 text-white font-bold"
                                                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200"
                                                }`}
                                            >
                                                <span className="text-[11px] block">{ratio.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

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

                            <div className="pt-4 border-t border-white/10 space-y-2.5">
                                <button
                                    disabled={downloading}
                                    onClick={handleDownloadPoster}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-aira-cyan via-purple-600 to-aira-magenta text-white font-bold rounded-xl text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" /> Exporting {currentDim.width}×{currentDim.height} PNG...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={16} /> Download {aspectRatio} Poster PNG ({currentDim.width}×{currentDim.height})
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
                                <Sparkles size={12} className="text-aira-cyan" /> Live Preview ({aspectRatio}) - ✍️ Click text directly to edit
                            </span>

                            <div 
                                ref={previewBoxRef}
                                style={{
                                    width: "100%",
                                    maxWidth: aspectRatio === "16:9" ? "600px" : "440px",
                                    aspectRatio: `${currentDim.width} / ${currentDim.height}`,
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: "1rem",
                                }}
                                className="shadow-2xl border border-purple-500/30 bg-[#06050e] relative flex items-center justify-center"
                            >
                                <div
                                    style={{
                                        width: `${currentDim.width}px`,
                                        height: `${currentDim.height}px`,
                                        transform: `scale(${previewScale})`,
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
