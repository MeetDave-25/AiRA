"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Star,
    Heart,
    ExternalLink,
    Github,
    Plus,
    Layers,
    Code,
    Cpu,
    Bot,
    Globe,
    Trophy,
    X,
    Upload,
    Lock,
    LogIn,
    UserCheck,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { BLOCK_COLORS, Btn, Button, Chip, EASE, Empty, PageHero, SearchInput, SkeletonCard, WRAP, inputClass } from "@/components/nb/kit";

const CATEGORIES = [
    { id: "ALL", label: "All projects", icon: Layers },
    { id: "Web & Cloud Platforms", label: "Software & web", icon: Globe },
    { id: "AI & Machine Learning", label: "AI & ML", icon: Cpu },
    { id: "Autonomous Robotics", label: "Robotics", icon: Bot },
    { id: "IoT & Hardware", label: "IoT & hardware", icon: Code },
    { id: "Hackathon Winner", label: "Hackathon wins", icon: Trophy },
];

function SubmitProjectModal({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: (p: any) => void }) {
    const { data: session } = useSession();
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
            toast.success("Project submitted to the showcase! 🚀");
            onCreated(created);
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to submit project");
        } finally {
            setSubmitting(false);
        }
    };

    const label = "block font-brico font-bold text-sm mb-1.5";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] bg-nb-ink/60 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.94, opacity: 0, y: 20, rotate: -1.5 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0.94, opacity: 0, y: 20 }}
                    className="rounded-[24px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-nb-lg p-6 sm:p-8 max-w-2xl w-full my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!session?.user ? (
                        <div className="text-center py-4">
                            <span className="mx-auto w-16 h-16 rounded-2xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-nb">
                                <Lock size={26} />
                            </span>
                            <h3 className="mt-5 font-brico font-extrabold text-2xl">Log in to submit a project</h3>
                            <p className="mt-2 text-nb-muted max-w-md mx-auto leading-relaxed">
                                Anyone can browse, upvote and review projects. To publish your own work to the showcase, sign in to your member account.
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Btn href="/portal/login?callbackUrl=/projects">
                                    <LogIn size={16} /> Log in to submit
                                </Btn>
                                <Button type="button" onClick={onClose} tone="white">Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-nb-ink">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl border-2 border-nb-ink bg-nb-sky flex items-center justify-center">
                                        <Sparkles size={18} />
                                    </span>
                                    <div>
                                        <h3 className="font-brico font-extrabold text-xl">Showcase your project</h3>
                                        <p className="text-xs text-nb-muted flex items-center gap-1">
                                            <UserCheck size={12} /> Posting as <strong className="text-nb-ink">{session.user.name}</strong>
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg border-2 border-nb-ink bg-white">
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                <div>
                                    <label className={label}>Project title *</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Autonomous Planetary Rover Mk-II" className={inputClass} required />
                                </div>
                                <div>
                                    <label className={label}>One-line tagline</label>
                                    <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. SLAM rover with LiDAR mapping & obstacle avoidance" className={inputClass} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Category</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                                            <option value="Autonomous Robotics">Autonomous Robotics</option>
                                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                                            <option value="Web & Cloud Platforms">Web & Cloud Platforms</option>
                                            <option value="IoT & Hardware">IoT & Hardware</option>
                                            <option value="Hackathon Winner">Hackathon Winner</option>
                                            <option value="Cybersecurity">Cybersecurity</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={label}>Creator / team name</label>
                                        <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your name or team name" className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className={label}>Cover image URL or upload</label>
                                    <div className="flex gap-2">
                                        <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://… or upload" className={`${inputClass} flex-1`} />
                                        <label className="shrink-0 inline-flex items-center gap-1.5 cursor-pointer rounded-xl border-2 border-nb-ink bg-nb-sun px-4 font-brico font-bold text-sm shadow-nb-sm">
                                            <Upload size={15} /> {uploading ? "Uploading…" : "Upload"}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={label}>Live demo URL</label>
                                        <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://yourdemo.com" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={label}>GitHub repository URL</label>
                                        <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you/project" className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className={label}>Tech stack tags (comma separated)</label>
                                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ROS2, YOLOv8, Python, Three.js" className={inputClass} />
                                </div>
                                <div>
                                    <label className={label}>Case study / description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        placeholder="Describe the problem, architecture, hardware, algorithms and key outcomes…"
                                        className={`${inputClass} resize-y`}
                                        required
                                    />
                                </div>
                                <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-nb-ink/15">
                                    <Button type="button" onClick={onClose} tone="white">Cancel</Button>
                                    <Button type="submit" disabled={submitting}>{submitting ? "Publishing…" : "Publish project"}</Button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, [string, string, any]> = {
        PUBLISHED: ["bg-nb-mint", "Live", CheckCircle2],
        REJECTED: ["bg-nb-peach", "Rejected", XCircle],
    };
    const [color, text, Icon] = map[status] || ["bg-nb-sun", "Under review", Clock];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border-2 border-nb-ink px-2.5 py-0.5 text-xs font-bold ${color}`}>
            <Icon size={12} /> {text}
        </span>
    );
}

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<any[]>([]);
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCat, setActiveCat] = useState("ALL");
    const [activeTab, setActiveTab] = useState<"showcase" | "mine">("showcase");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"popular" | "topRated" | "newest">("popular");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

    const fetchPublished = () => {
        setLoading(true);
        fetch("/api/projects")
            .then((r) => r.json())
            .then((d) => setProjects(Array.isArray(d) ? d : []))
            .catch(() => setProjects([]))
            .finally(() => setLoading(false));
    };

    const fetchMyProjects = () => {
        if (!session?.user) return;
        fetch("/api/projects/mine")
            .then(r => r.ok ? r.json() : [])
            .then(d => setMyProjects(Array.isArray(d) ? d : []))
            .catch(() => setMyProjects([]));
    };

    useEffect(() => { fetchPublished(); }, []);
    useEffect(() => { fetchMyProjects(); }, [session]);

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
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Built by the community"
                title="Project showcase."
                says="Software, AI and robotics — all built by students here. Tap a heart if you like one!"
                desc="Real software, AI models and robots built by AiRA Lab members. Upvote your favourites and leave a review."
            >
                <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={17} /> Submit your project
                    </Button>
                    {session?.user && (
                        <Button onClick={() => setActiveTab(activeTab === "mine" ? "showcase" : "mine")} tone={activeTab === "mine" ? "ink" : "white"}>
                            <UserCheck size={16} /> My submissions
                            {myProjects.length > 0 && <span className="rounded-full border-2 border-current px-1.5 text-xs">{myProjects.length}</span>}
                        </Button>
                    )}
                </div>
            </PageHero>

            <div className={WRAP}>
                {activeTab === "mine" && session?.user && (
                    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
                        <h2 className="font-brico font-extrabold text-2xl mb-4 flex items-center gap-2">
                            <UserCheck size={20} /> My submitted projects
                        </h2>
                        {myProjects.length === 0 ? (
                            <Empty icon={<Bot size={24} />} title="No submissions yet" desc="Submit your first project using the button above!" />
                        ) : (
                            <div className="space-y-3">
                                {myProjects.map((p: any) => (
                                    <div key={p.id} className="flex items-center gap-4 rounded-2xl border-2 border-nb-ink bg-white shadow-nb-sm p-3.5">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-nb-ink bg-nb-lilac shrink-0 flex items-center justify-center">
                                            {p.coverImage ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" /> : <Layers size={20} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-brico font-bold truncate">{p.title}</p>
                                            <p className="text-sm text-nb-muted truncate">{p.tagline || p.description?.slice(0, 80)}</p>
                                        </div>
                                        <StatusBadge status={p.status} />
                                        {p.status === "PUBLISHED" && (
                                            <Link href={`/projects/${p.id}`} aria-label="Open project" className="p-2 rounded-xl border-2 border-nb-ink bg-white hover:bg-nb-sun">
                                                <ExternalLink size={15} />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>
                )}

                {/* Filters */}
                <div className="mb-10 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Chip key={cat.id} active={activeCat === cat.id} onClick={() => setActiveCat(cat.id)}>
                                    <span className="inline-flex items-center gap-1.5"><Icon size={14} /> {cat.label}</span>
                                </Chip>
                            );
                        })}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search projects, tech, tags…" />
                        <label className="flex items-center gap-2 font-brico font-bold text-sm">
                            Sort
                            <select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)} className={`${inputClass} py-2.5 w-auto`}>
                                <option value="popular">🔥 Most popular</option>
                                <option value="topRated">⭐ Highest rated</option>
                                <option value="newest">🕒 Newest first</option>
                            </select>
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} className="h-[420px]" />)}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <Empty icon={<Bot size={24} />} title="No projects found" desc="Be the first to submit one in this category!">
                        <Button onClick={() => setIsModalOpen(true)}><Plus size={16} /> Submit project</Button>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project: any, i: number) => (
                            <motion.article
                                key={project.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.06 }}
                                className="group flex flex-col rounded-[22px] border-2 border-nb-ink bg-white shadow-nb overflow-hidden transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg"
                            >
                                <div className={`relative aspect-[16/9] border-b-2 border-nb-ink overflow-hidden ${BLOCK_COLORS[i % BLOCK_COLORS.length]}`}>
                                    {project.coverImage ? (
                                        <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <span className="w-full h-full flex items-center justify-center font-brico font-extrabold text-6xl text-nb-ink/15 select-none">
                                            {(project.title || "AI").slice(0, 2)}
                                        </span>
                                    )}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                        <span className="rounded-full border-2 border-nb-ink bg-white px-2.5 py-0.5 text-[11px] font-bold">{project.category}</span>
                                        {project.featured && <span className="rounded-full border-2 border-nb-ink bg-nb-sun px-2.5 py-0.5 text-[11px] font-bold">★ Featured</span>}
                                    </div>
                                    <button
                                        onClick={(e) => handleLike(e, project.id)}
                                        aria-label="Upvote"
                                        className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full border-2 border-nb-ink px-2.5 py-1 text-xs font-bold shadow-nb-sm transition-colors ${
                                            likedIds[project.id] ? "bg-nb-peach" : "bg-white hover:bg-nb-peach"
                                        }`}
                                    >
                                        <Heart size={13} className={likedIds[project.id] ? "fill-nb-ink" : ""} />
                                        {project.likes || 0}
                                    </button>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <Link href={`/projects/${project.id}`}>
                                        <h2 className="font-brico font-extrabold text-xl tracking-tight leading-snug line-clamp-2 group-hover:text-nb-violet transition-colors">{project.title}</h2>
                                    </Link>
                                    {project.tagline && <p className="mt-1.5 text-sm text-nb-muted line-clamp-2">{project.tagline}</p>}
                                    {project.tags?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                                            {project.tags.slice(0, 4).map((tag: string) => (
                                                <span key={tag} className="font-mono text-[11px] text-nb-violet">#{tag}</span>
                                            ))}
                                            {project.tags.length > 4 && <span className="font-mono text-[11px] text-nb-muted">+{project.tags.length - 4}</span>}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4">
                                        <div className="pt-3 border-t-2 border-dashed border-nb-ink/15 flex items-center justify-between text-sm">
                                            <span className="truncate max-w-[60%] font-medium">By {project.authorName || "AiRA member"}</span>
                                            <span className="flex items-center gap-1 font-bold">
                                                <Star size={14} className="fill-nb-sun" /> {project.avgRating ?? "5.0"}
                                                <span className="font-normal text-nb-muted text-xs">({project.reviewCount ?? 0})</span>
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                {project.demoUrl && (
                                                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" title="Live demo" className="p-2 rounded-lg border-2 border-nb-ink bg-white hover:bg-nb-sky">
                                                        <ExternalLink size={15} />
                                                    </a>
                                                )}
                                                {project.githubUrl && (
                                                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" title="GitHub repository" className="p-2 rounded-lg border-2 border-nb-ink bg-white hover:bg-nb-lilac">
                                                        <Github size={15} />
                                                    </a>
                                                )}
                                            </div>
                                            <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 rounded-lg border-2 border-nb-ink bg-nb-violet text-white px-3 py-1.5 font-brico font-bold text-sm shadow-nb-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                                                Details <ArrowUpRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>

            <SubmitProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={(newProj) => {
                    // New projects are PENDING — add to my submissions, not public list
                    setMyProjects((prev) => [newProj, ...prev]);
                    setActiveTab("mine");
                    fetchMyProjects();
                }}
            />
        </div>
    );
}
