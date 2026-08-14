"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Search,
    Star,
    Heart,
    ExternalLink,
    Github,
    Plus,
    Filter,
    Layers,
    Code,
    Cpu,
    Bot,
    Globe,
    Trophy,
    MessageSquare,
    X,
    Upload,
    Check,
    Lock,
    LogIn,
    UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const CATEGORIES = [
    { id: "ALL", label: "All Projects", icon: Layers },
    { id: "Autonomous Robotics", label: "Autonomous Robotics", icon: Bot },
    { id: "AI & Machine Learning", label: "AI & Neural Models", icon: Cpu },
    { id: "Web & Cloud Platforms", label: "Web & Platforms", icon: Globe },
    { id: "IoT & Hardware", label: "IoT & Hardware", icon: Code },
    { id: "Hackathon Winner", label: "Hackathon Champions", icon: Trophy },
];

function SubmitProjectModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: (p: any) => void }) {
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("AI & Machine Learning");
    const [coverImage, setCoverImage] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [tags, setTags] = useState("");
    const [authorName, setAuthorName] = useState(session?.user?.name || "");
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setAuthorName(session.user.name);
        }
    }, [session]);

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.url) {
                setCoverImage(data.url);
                toast.success("Cover image uploaded!");
            } else {
                toast.error("Upload failed");
            }
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            toast.error("You must be logged in to submit a project");
            return;
        }

        if (!title.trim() || !description.trim()) {
            toast.error("Title and description are required");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    tagline,
                    description,
                    category,
                    coverImage,
                    demoUrl,
                    githubUrl,
                    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                    authorName: authorName || session.user.name || "AiRA Lab Member",
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to create project");
            }

            const created = await res.json();
            toast.success("Project published to Community Showcase! 🚀");
            onCreated(created);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to submit project");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 20 }}
                    className="glass-strong rounded-3xl border border-white/20 p-6 sm:p-8 max-w-2xl w-full my-8 relative shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* If user is NOT logged in: Show clear Login Prompt */}
                    {!session?.user ? (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
                                <Lock size={28} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
                                    Login Required to Upload Projects
                                </h3>
                                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                                    Anyone can browse projects, upvote, and leave reviews! To submit and publish your own engineering project to the AiRA showcase, please sign into your account.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <Link
                                    href="/portal/login?callbackUrl=/projects"
                                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-aira-cyan/25"
                                >
                                    <LogIn size={15} />
                                    <span>Log In to Submit Project</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-aira-cyan/20 border border-aira-cyan/40 flex items-center justify-center text-aira-cyan">
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-bold text-lg text-white">Showcase Your Project</h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <UserCheck size={12} className="text-emerald-400" />
                                            Posting as <strong className="text-slate-200">{session.user.name}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Project Title *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Autonomous Planetary Rover Mk-II"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">One-line Tagline</label>
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={(e) => setTagline(e.target.value)}
                                        placeholder="e.g. SLAM-based exploration rover with LIDAR mapping & obstacle avoidance"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs outline-none focus:border-aira-cyan/60"
                                        >
                                            <option value="Autonomous Robotics">Autonomous Robotics</option>
                                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                                            <option value="Web & Cloud Platforms">Web & Cloud Platforms</option>
                                            <option value="IoT & Hardware">IoT & Hardware</option>
                                            <option value="Hackathon Winner">Hackathon Winner</option>
                                            <option value="Cybersecurity">Cybersecurity</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Creator / Team Name</label>
                                        <input
                                            type="text"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            placeholder="Your Name or Team Name"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cover Image URL or Upload</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={coverImage}
                                            onChange={(e) => setCoverImage(e.target.value)}
                                            placeholder="https://images.unsplash.com/... or upload"
                                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                        />
                                        <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0">
                                            <Upload size={14} />
                                            <span>{uploading ? "Uploading..." : "Upload"}</span>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Live Demo URL</label>
                                        <input
                                            type="url"
                                            value={demoUrl}
                                            onChange={(e) => setDemoUrl(e.target.value)}
                                            placeholder="https://yourdemo.com"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">GitHub Repository URL</label>
                                        <input
                                            type="url"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/username/project"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Tech Stack Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        placeholder="ROS2, YOLOv8, Python, Three.js, PyTorch"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Detailed Case Study / Description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        placeholder="Describe the problem, engineering architecture, hardware components, algorithms, and key outcomes..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60 resize-y"
                                        required
                                    />
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-aira-cyan/25 cursor-pointer disabled:opacity-50"
                                    >
                                        {submitting ? "Publishing..." : "Publish Project"}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCat, setActiveCat] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"popular" | "topRated" | "newest">("popular");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch("/api/projects")
            .then((r) => r.json())
            .then((d) => setProjects(Array.isArray(d) ? d : []))
            .catch(() => setProjects([]))
            .finally(() => setLoading(false));
    }, []);

    const handleLike = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (likedIds[projectId]) return;

        setLikedIds((prev) => ({ ...prev, [projectId]: true }));
        setProjects((prev) =>
            prev.map((p) => (p.id === projectId ? { ...p, likes: (p.likes || 0) + 1 } : p))
        );

        try {
            await fetch(`/api/projects/${projectId}/like`, { method: "POST" });
            toast.success("Project upvoted! ❤️");
        } catch {
            // ignore
        }
    };

    const filteredProjects = projects
        .filter((p) => {
            const matchesCat =
                activeCat === "ALL" || (p.category || "").toLowerCase().includes(activeCat.toLowerCase());
            const matchesSearch =
                !searchQuery ||
                (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.tagline || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === "popular") return (b.likes || 0) - (a.likes || 0);
            if (sortBy === "topRated") return (b.avgRating || 0) - (a.avgRating || 0);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-aira-cyan/15 via-indigo-600/10 to-pink-500/15 blur-[130px] pointer-events-none" />

            {/* ══ HERO BANNER: COMMUNITY PROJECT SHOWCASE ══ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aira-cyan/15 border border-aira-cyan/30 text-aira-cyan text-xs font-orbitron font-bold uppercase tracking-wider mb-4 shadow-lg shadow-aira-cyan/10">
                    <Sparkles size={13} className="text-aira-cyan animate-pulse" />
                    Community Project Showcase &amp; Innovation Lab
                </div>

                <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4 tracking-tight">
                    Engineering <span className="gradient-text-cyan">Showcase</span>
                </h1>

                <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8 font-sans">
                    Explore real-world autonomous robotics, AI neural models, embedded systems, and software platforms developed by AiRA Lab innovators. View live demos, read case studies, and leave reviews!
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-aira-cyan/25 cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Submit Your Project</span>
                    </button>
                </div>
            </motion.div>

            {/* ══ CATEGORY TABS & SEARCH BAR ══ */}
            <div className="space-y-4 mb-10 relative z-10">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = activeCat === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-orbitron font-semibold transition-all border flex items-center gap-2 ${
                                    isSelected
                                        ? "bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 border-transparent shadow-md shadow-aira-cyan/25 scale-105"
                                        : "glass border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Icon size={14} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto pt-2">
                    <div className="relative flex-1 min-w-[260px]">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects, hardware, neural models, tags..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 hidden sm:inline">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs outline-none focus:border-aira-cyan/50"
                        >
                            <option value="popular">🔥 Most Popular (Likes)</option>
                            <option value="topRated">⭐ Highest Rated</option>
                            <option value="newest">🕒 Newest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ══ PROJECTS GRID ══ */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass rounded-3xl h-[440px] animate-pulse border border-white/10" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-24 glass rounded-3xl border border-white/10 max-w-lg mx-auto p-8">
                    <Bot size={56} className="mx-auto mb-4 text-aira-cyan opacity-40" />
                    <p className="font-orbitron text-lg font-bold text-white">No projects found</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Be the first to submit an innovation to this category!
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-aira-cyan text-slate-950 text-xs font-orbitron font-bold hover:scale-105 transition-transform"
                    >
                        <Plus size={14} /> Submit Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project: any, i: number) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.06 }}
                            className="group"
                        >
                            <div className="glass-strong rounded-3xl border border-white/15 overflow-hidden flex flex-col justify-between h-full group-hover:border-aira-cyan/60 group-hover:shadow-[0_0_35px_rgba(0,212,255,0.2)] transition-all duration-300">
                                {/* Cover Photo with badges */}
                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                                    {project.coverImage ? (
                                        <img
                                            src={project.coverImage}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950">
                                            <span className="font-orbitron font-black text-3xl text-white/20">AiRA LAB</span>
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-orbitron font-bold text-aira-cyan border border-aira-cyan/30">
                                            {project.category}
                                        </span>
                                        {project.featured && (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-orbitron font-black uppercase">
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    {/* Like Button */}
                                    <button
                                        onClick={(e) => handleLike(e, project.id)}
                                        className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 hover:border-pink-500 hover:text-pink-400 transition-colors shadow-lg cursor-pointer"
                                    >
                                        <Heart
                                            size={13}
                                            className={likedIds[project.id] ? "fill-pink-500 text-pink-500" : ""}
                                        />
                                        <span>{project.likes || 0}</span>
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <Link href={`/projects/${project.id}`}>
                                            <h2 className="font-orbitron font-bold text-lg text-white group-hover:text-aira-cyan transition-colors leading-snug line-clamp-2">
                                                {project.title}
                                            </h2>
                                        </Link>

                                        {project.tagline && (
                                            <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 font-sans leading-relaxed">
                                                {project.tagline}
                                            </p>
                                        )}

                                        {/* Tags */}
                                        {project.tags && project.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {project.tags.slice(0, 4).map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 font-mono"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                                {project.tags.length > 4 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] text-slate-500">
                                                        +{project.tags.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Author + Ratings Bar */}
                                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                                        <span className="truncate max-w-[140px] font-medium text-slate-300">
                                            By {project.authorName || "AiRA Contributor"}
                                        </span>

                                        <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                                            <Star size={13} fill="currentColor" />
                                            <span>{project.avgRating ?? "5.0"}</span>
                                            <span className="text-slate-500 text-[10px] font-normal">
                                                ({project.reviewCount ?? 0})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-1 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5">
                                            {project.demoUrl && (
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-aira-cyan transition-colors"
                                                    title="Live Demo"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a
                                                    href={project.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                                                    title="GitHub Repository"
                                                >
                                                    <Github size={14} />
                                                </a>
                                            )}
                                        </div>

                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 font-orbitron font-bold text-[11px] flex items-center gap-1 hover:scale-105 transition-transform shadow-md shadow-aira-cyan/20"
                                        >
                                            <span>Review &amp; Details</span>
                                            <MessageSquare size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Submit Project Modal */}
            <SubmitProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={(newProj) => {
                    setProjects((prev) => [newProj, ...prev]);
                }}
            />
        </div>
    );
}
