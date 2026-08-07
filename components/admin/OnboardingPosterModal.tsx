"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Download, Copy, Sparkles, User, Layers, Calendar, Quote, 
    Rocket, Search, Code, Star, Globe, Check, Image as ImageIcon,
    RefreshCw, Move, RotateCcw, ZoomIn, ZoomOut, Maximize2, Type, CheckCircle2,
    Upload, Trash2
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
        status?: string;
        createdAt?: string;
    } | null;
}

type AspectRatioType = "1:1" | "4:5" | "9:16" | "16:9";

export function OnboardingPosterModal({ open, onClose, applicant }: OnboardingPosterModalProps) {
    const exportRef = useRef<HTMLDivElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [downloading, setDownloading] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);

    // Aspect Ratio & Dimensions State (Default: 1:1 Square 1536x1536)
    const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
    const [previewScale, setPreviewScale] = useState(0.33);

    // Dynamic poster text & logo state
    const [customLogoUrl, setCustomLogoUrl] = useState<string>("" );
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
        { label: "1:1 Square (1536×1536 px)", value: "1:1" as AspectRatioType, desc: "Recommended Instagram & LinkedIn Export" },
        { label: "4:5 Portrait (1536×1920 px)", value: "4:5" as AspectRatioType, desc: "High-Res IG Portrait Feed Post" },
        { label: "9:16 Story (1080×1920 px)", value: "9:16" as AspectRatioType, desc: "IG Story, Reels & WhatsApp Status" },
        { label: "16:9 Landscape (1920×1080 px)", value: "16:9" as AspectRatioType, desc: "LinkedIn & X / Twitter Banner" }
    ];

    const getDimensions = (ratio: AspectRatioType) => {
        switch (ratio) {
            case "4:5": return { width: 1536, height: 1920 };
            case "9:16": return { width: 1080, height: 1920 };
            case "16:9": return { width: 1920, height: 1080 };
            case "1:1":
            default: return { width: 1536, height: 1536 };
        }
    };

    const currentDim = getDimensions(aspectRatio);

    useEffect(() => {
        const updateScale = () => {
            if (previewContainerRef.current) {
                const boxWidth = previewContainerRef.current.clientWidth;
                if (boxWidth > 0) {
                    setPreviewScale(boxWidth / currentDim.width);
                }
            }
        };

        const timer = setTimeout(updateScale, 100);
        window.addEventListener("resize", updateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("resize", updateScale);
        };
    }, [aspectRatio, currentDim.width, open]);

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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCustomLogoUrl(event.target.result as string);
                    toast.success("Custom logo loaded!");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setPhotoUrl(event.target.result as string);
                    toast.success("Candidate photo uploaded!");
                }
            };
            reader.readAsDataURL(file);
        }
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
                scale: 1, // 1536x1536 native pixel resolution
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
                    const filename = `AiRA_Welcome_${name.replace(/\s+/g, "_")}_${currentDim.width}x${currentDim.height}.png`;
                    saveAs(blob, filename);
                    toast.success(`Poster downloaded in ${currentDim.width}×${currentDim.height} px!`, { id: toastId });
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
            className="bg-[#06050e] text-white p-14 select-none flex flex-col justify-between relative overflow-hidden font-sans"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/35 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "36px 36px",
                }}
            />

            <div className="relative z-10 flex items-start justify-between">
                <motion.div 
                    key={`header_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`space-y-4 ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-2xl p-2" : ""}`}
                >
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            {customLogoUrl ? (
                                <img
                                    src={customLogoUrl}
                                    alt="Logo"
                                    className="w-16 h-16 object-contain rounded-2xl border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] bg-[#0d0b1f]"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-700 to-indigo-950 border border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center justify-center text-white font-orbitron font-extrabold text-3xl tracking-tighter">
                                    ▲
                                </div>
                            )}
                            <div className="leading-tight">
                                <div className="font-orbitron font-black text-3xl tracking-widest text-white">AIRA</div>
                                <div className="font-orbitron font-bold text-sm tracking-[0.35em] text-purple-400">LAB</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-400/80 font-orbitron text-sm tracking-[0.25em] uppercase">
                            <div className="w-16 h-[1.5px] bg-gradient-to-r from-purple-500/80 to-purple-500/20" />
                            <span>PROUD TO WELCOME</span>
                            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
                        </div>
                    </div>

                    <div className="pt-2">
                        <h1 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setWelcomeText(e.currentTarget.textContent || "WELCOME")}
                            className="font-orbitron font-black text-8xl text-white tracking-tight leading-none uppercase outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1"
                        >
                            {welcomeText}
                        </h1>
                        <div className="flex items-center gap-3 my-1 relative">
                            <span className="font-script text-7xl text-purple-400 -rotate-6 font-bold tracking-wide -mt-3 -mb-3 z-10 drop-shadow-[0_4px_12px_rgba(168,85,247,0.8)]">
                                to
                            </span>
                            <span className="font-orbitron font-black text-8xl text-white tracking-tight leading-none uppercase">
                                AIRA LAB
                            </span>
                        </div>
                        <p 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setTaglineText(e.currentTarget.textContent || "")}
                            className="text-sm font-orbitron tracking-[0.3em] text-purple-300/90 pt-3 uppercase font-medium outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1"
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
                    className={`relative p-7 rounded-3xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md max-w-[420px] shadow-2xl ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50" : ""}`}
                >
                    <div className="text-purple-400 font-serif text-5xl leading-none mb-2">“</div>
                    <p 
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setTopQuoteText(e.currentTarget.textContent || "")}
                        className="text-sm font-orbitron font-bold text-slate-200 tracking-widest leading-relaxed uppercase outline-none focus:ring-2 focus:ring-purple-400/60 rounded p-1"
                    >
                        {topQuoteText}
                    </p>
                    <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    </div>
                </motion.div>
            </div>

            <div className={`relative z-10 grid grid-cols-12 gap-10 items-center py-6 flex-1 ${aspectRatio === "4:5" || aspectRatio === "9:16" ? "my-6 space-y-6" : "my-2"}`}>
                <motion.div 
                    key={`lefttimeline_${resetKey}`}
                    drag={enableDrag}
                    dragMomentum={false}
                    dragElastic={0}
                    className={`col-span-6 space-y-6 relative ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-3xl p-3" : ""}`}
                >
                    <div className="absolute top-10 bottom-32 left-12 w-[3px] bg-gradient-to-b from-purple-500/60 via-purple-500/40 to-transparent z-0" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0 p-4">
                            <User size={30} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-1">
                                ROLE
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setRole(e.currentTarget.textContent || "")}
                                className="font-bold text-2xl text-white truncate block tracking-wide outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1"
                            >
                                {role || "Chief Technical Officer"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0 p-4">
                            <Layers size={30} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-1">
                                DEPARTMENT
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setDepartment(e.currentTarget.textContent || "")}
                                className="font-bold text-2xl text-white truncate block tracking-wide outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1"
                            >
                                {department || "Technical Wing"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-violet-600 via-purple-800 to-slate-950 border-2 border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-white shrink-0 p-4">
                            <Calendar size={30} className="text-purple-200" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-orbitron tracking-[0.25em] text-purple-400 uppercase font-bold block mb-1">
                                JOINED IN
                            </span>
                            <span 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setJoinedDate(e.currentTarget.textContent || "")}
                                className="font-bold text-2xl text-white truncate block tracking-wide outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1"
                            >
                                {joinedDate || "March 2026"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 p-7 rounded-3xl bg-[#0c0a1b]/90 border border-purple-500/30 backdrop-blur-md relative shadow-xl flex gap-4">
                        <div className="w-8 shrink-0 grid grid-cols-2 gap-2 opacity-30 self-center">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-purple-400" />
                            ))}
                        </div>

                        <div className="flex-1">
                            <span className="text-purple-400 font-serif text-4xl font-bold leading-none">“</span>
                            <p 
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setQuote(e.currentTarget.textContent || "")}
                                className="text-sm text-slate-200 italic leading-relaxed px-1 py-1 font-sans outline-none focus:ring-2 focus:ring-purple-400/60 rounded"
                            >
                                {quote}
                            </p>
                            <span className="text-purple-400 font-serif text-4xl font-bold leading-none block text-right">”</span>
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
                    <div className="relative w-full aspect-[4/5] rounded-[36px] p-3 bg-gradient-to-b from-purple-500/50 via-indigo-600/30 to-purple-900/60 shadow-[0_0_40px_rgba(168,85,247,0.35)] overflow-hidden border border-purple-400/50">
                        <div className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full bg-slate-950/90 border border-purple-400/50 text-xs font-orbitron font-bold text-white tracking-wider flex items-center gap-2 shadow-xl">
                            <span>OFFICIAL MEMBER</span>
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                        </div>

                        <div 
                            className="absolute top-1/2 left-3 z-20 text-xs font-orbitron tracking-[0.3em] text-slate-400/90 uppercase font-semibold pointer-events-none"
                            style={{
                                transform: "translateY(-50%) rotate(-90deg)",
                                transformOrigin: "center center",
                                whiteSpace: "nowrap"
                            }}
                        >
                            WELCOME ABOARD, INNOVATOR!
                        </div>

                        <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-gradient-to-b from-purple-950 via-slate-950 to-black flex items-center justify-center">
                            <div className="absolute top-1/4 w-96 h-96 bg-purple-600/40 rounded-full blur-3xl pointer-events-none" />

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
                                    <User size={80} className="mb-3 text-purple-400/40" />
                                    <span className="text-sm font-orbitron">No Photo Provided</span>
                                </div>
                            )}

                            <div className="absolute bottom-0 right-0 left-0 h-44 bg-gradient-to-t from-black via-black/85 to-transparent flex items-end justify-end p-6 z-20">
                                <div className="absolute bottom-6 right-6 text-purple-900/30 text-8xl font-orbitron font-black pointer-events-none">
                                    ▲
                                </div>
                                <div className="text-right relative z-10">
                                    <div 
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => setSignatureName(e.currentTarget.textContent || "")}
                                        className="font-script text-6xl text-purple-300 font-bold drop-shadow-[0_4px_16px_rgba(168,85,247,0.9)] -rotate-3 tracking-wide outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-2"
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
                className={`relative z-10 space-y-4 pt-2 ${enableDrag ? "cursor-move hover:ring-1 hover:ring-purple-400/50 hover:rounded-3xl p-2" : ""}`}
            >
                <div className="grid grid-cols-4 gap-5 p-2 rounded-3xl bg-[#0c0a1b]/60 border border-purple-500/20 backdrop-blur-md">
                    <div className="p-4 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center mb-2 border border-purple-500/30">
                            <Rocket size={22} />
                        </div>
                        <span className="text-sm font-orbitron font-bold text-white tracking-wider block">
                            INNOVATE
                        </span>
                        <span className="text-xs text-slate-400 block pt-0.5">
                            Ideas into Impact
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-indigo-900/40 text-indigo-300 flex items-center justify-center mb-2 border border-indigo-500/30">
                            <Search size={22} />
                        </div>
                        <span className="text-sm font-orbitron font-bold text-white tracking-wider block">
                            RESEARCH
                        </span>
                        <span className="text-xs text-slate-400 block pt-0.5">
                            Explore. Learn. Grow
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center mb-2 border border-purple-500/30">
                            <Code size={22} />
                        </div>
                        <span className="text-sm font-orbitron font-bold text-white tracking-wider block">
                            COLLABORATE
                        </span>
                        <span className="text-xs text-slate-400 block pt-0.5">
                            Together We Build
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0d0b1f]/90 border border-purple-500/30 text-center flex flex-col items-center justify-center shadow-lg">
                        <div className="w-11 h-11 rounded-xl bg-indigo-900/40 text-indigo-300 flex items-center justify-center mb-2 border border-indigo-500/30">
                            <Star size={22} />
                        </div>
                        <span className="text-sm font-orbitron font-bold text-white tracking-wider block">
                            EXCEL
                        </span>
                        <span className="text-xs text-slate-400 block pt-0.5">
                            Excellence is Habit
                        </span>
                    </div>
                </div>

                <div className="pt-4 border-t border-purple-500/30 flex items-center justify-between text-sm font-orbitron text-slate-400 tracking-wider">
                    <div className="flex items-center gap-2.5 text-purple-300 font-semibold">
                        <Globe size={18} /> 
                        <span 
                            contentEditable 
                            suppressContentEditableWarning 
                            onBlur={(e) => setFooterUrl(e.currentTarget.textContent || "www.aira-lab.in")}
                            className="outline-none focus:ring-2 focus:ring-purple-400/60 rounded px-1.5"
                        >
                            {footerUrl}
                        </span>
                    </div>

                    <div className="tracking-[0.25em] text-slate-300 font-medium">
                        INNOVATION  •  RESEARCH  •  EXCELLENCE
                    </div>

                    <div className="flex items-center gap-4 text-slate-300 font-bold text-sm">
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

                {/* Hidden File Upload Inputs */}
                <input 
                    ref={logoInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                />
                <input 
                    ref={photoInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                />

                {/* Hidden offscreen node for 1536×1536 html2canvas export */}
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
                                    1536×1536 px Instagram Export, Custom Logo Upload & Free Element Dragging
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
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] block">{ratio.label}</span>
                                                    {aspectRatio === ratio.value && <CheckCircle2 size={11} className="text-aira-cyan shrink-0" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Logo Upload */}
                                <div className="p-3 bg-slate-900/90 border border-white/10 rounded-xl space-y-2">
                                    <span className="text-xs font-semibold text-purple-300 block flex items-center gap-1.5">
                                        <Sparkles size={14} /> Custom Logo
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {customLogoUrl ? (
                                            <img
                                                src={customLogoUrl}
                                                alt="Custom Logo"
                                                className="w-10 h-10 object-contain rounded-lg border border-purple-400/40 bg-slate-950 p-0.5"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-950 border border-purple-400/40 flex items-center justify-center text-white font-orbitron font-bold text-lg">
                                                ▲
                                            </div>
                                        )}

                                        <div className="flex-1 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg text-xs font-semibold text-purple-200 transition-colors"
                                            >
                                                <Upload size={12} /> Upload Logo
                                            </button>
                                            {customLogoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCustomLogoUrl("")}
                                                    className="p-1.5 bg-slate-900 hover:bg-rose-950/40 border border-white/10 text-rose-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
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
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-slate-400 font-medium">Photo Image URL or File</label>
                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current?.click()}
                                            className="text-[10px] text-aira-cyan hover:underline flex items-center gap-1"
                                        >
                                            <Upload size={10} /> Upload Photo
                                        </button>
                                    </div>
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
                                            <Download size={16} /> Download {aspectRatio} Poster PNG ({currentDim.width}×{currentDim.height} px)
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
                                <Sparkles size={12} className="text-aira-cyan" /> Live Preview ({aspectRatio} - {currentDim.width}×{currentDim.height}px)
                            </span>

                            <div 
                                ref={previewContainerRef}
                                style={{
                                    width: "100%",
                                    maxWidth: aspectRatio === "16:9" ? "600px" : "440px",
                                    aspectRatio: `${currentDim.width} / ${currentDim.height}`,
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: "1rem",
                                }}
                                className="shadow-2xl border border-purple-500/30 bg-[#06050e] relative"
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
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
