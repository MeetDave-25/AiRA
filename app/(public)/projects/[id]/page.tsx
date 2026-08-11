"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Star,
    Heart,
    ExternalLink,
    Github,
    Share2,
    Calendar,
    User,
    Sparkles,
    MessageSquare,
    Send,
    Check,
    Copy,
    Bot,
    Globe2,
    Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import MediumArticleContent from "@/components/ui/MediumArticleContent";

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    // Review form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewerName, setReviewerName] = useState(session?.user?.name || "");
    const [reviewerEmail, setReviewerEmail] = useState(session?.user?.email || "");
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (session?.user?.name && !reviewerName) {
            setReviewerName(session.user.name);
        }
        if (session?.user?.email && !reviewerEmail) {
            setReviewerEmail(session.user.email);
        }
    }, [session]);

    useEffect(() => {
        fetch(`/api/projects/${id}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.id) {
                    setProject(d);
                    setLikesCount(d.likes || 0);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    const handleLike = async () => {
        if (liked) return;
        setLiked(true);
        setLikesCount((prev) => prev + 1);
        try {
            await fetch(`/api/projects/${id}/like`, { method: "POST" });
            toast.success("Project upvoted! ❤️");
        } catch {
            // ignore
        }
    };

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Project link copied to clipboard!");
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error("Please enter a review comment");
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/projects/${id}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    authorName: reviewerName.trim() || "Community Member",
                    authorEmail: reviewerEmail.trim() || null,
                    comment: comment.trim(),
                }),
            });

            if (!res.ok) throw new Error("Failed to submit review");
            const newRev = await res.json();

            setProject((prev: any) => {
                const updatedReviews = [newRev, ...(prev.reviews || [])];
                const newAvg = Number(
                    (
                        updatedReviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) /
                        updatedReviews.length
                    ).toFixed(1)
                );
                return {
                    ...prev,
                    reviews: updatedReviews,
                    avgRating: newAvg,
                    reviewCount: updatedReviews.length,
                };
            });

            setComment("");
            toast.success("Review posted successfully! ⭐");
        } catch (err: any) {
            toast.error(err.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-28 px-4 max-w-5xl mx-auto">
                <div className="glass rounded-3xl h-[70vh] animate-pulse border border-white/10" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen pt-28 text-center text-slate-400 px-4">
                <Bot size={56} className="mx-auto mb-4 opacity-30 text-aira-cyan" />
                <p className="font-orbitron text-2xl text-white font-bold">Project Not Found</p>
                <Link href="/projects" className="text-aira-cyan underline mt-4 inline-block font-medium">
                    ← Return to Projects Showcase
                </Link>
            </div>
        );
    }

    const reviews = project.reviews || [];

    return (
        <div className="min-h-screen pt-24 pb-24 px-4 max-w-5xl mx-auto relative text-white">
            {/* Ambient Backlight */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-aira-cyan/15 via-indigo-600/10 to-pink-500/15 blur-[140px] pointer-events-none" />

            {/* Back Link */}
            <div className="mb-6 flex items-center justify-between relative z-10">
                <button
                    onClick={() => router.push("/projects")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Showcase</span>
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            liked
                                ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
                        }`}
                    >
                        <Heart size={14} className={liked ? "fill-pink-500 text-pink-500" : ""} />
                        <span>{likesCount} Likes</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Share Project"
                    >
                        <Share2 size={14} />
                    </button>
                </div>
            </div>

            {/* ══ PROJECT HERO HEADER ══ */}
            <div className="glass-strong rounded-3xl border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-10 mb-10 relative z-10 space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-aira-cyan/20 text-aira-cyan text-xs font-orbitron font-bold border border-aira-cyan/40">
                        {project.category}
                    </span>
                    {project.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-orbitron font-black uppercase">
                            Featured Innovation
                        </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(project.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                </div>

                <div>
                    <h1 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-tight">
                        {project.title}
                    </h1>
                    {project.tagline && (
                        <p className="text-slate-300 text-base sm:text-lg mt-3 font-sans leading-relaxed">
                            {project.tagline}
                        </p>
                    )}
                </div>

                {/* Author & Rating Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-aira-cyan to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
                            {project.authorName?.[0] || "A"}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">{project.authorName || "AiRA Contributor"}</p>
                            <span className="text-[11px] text-slate-400">AiRA Community Project Lead</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-bold">
                            <Star size={14} fill="currentColor" />
                            <span>{project.avgRating ?? "5.0"} / 5.0</span>
                            <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* External Action Links */}
                <div className="flex flex-wrap gap-3 pt-2">
                    {project.demoUrl && (
                        <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/25"
                        >
                            <ExternalLink size={14} />
                            <span>Launch Live Demo</span>
                        </a>
                    )}
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-orbitron font-semibold text-xs flex items-center gap-2 hover:border-white/30 transition-all"
                        >
                            <Github size={14} />
                            <span>View Source Code</span>
                        </a>
                    )}
                </div>
            </div>

            {/* ══ COVER IMAGE BANNER ══ */}
            {project.coverImage && (
                <div className="rounded-3xl overflow-hidden aspect-[16/8] border border-white/15 shadow-2xl mb-10 bg-slate-950 relative z-10">
                    <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                </div>
            )}

            {/* ══ CASE STUDY & ARCHITECTURE CONTENT ══ */}
            <div className="glass rounded-3xl border border-white/15 p-6 sm:p-10 mb-12 relative z-10">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
                    <Sparkles size={16} className="text-aira-cyan" />
                    <h2 className="font-orbitron font-bold text-lg text-white">Project Case Study &amp; Technical Breakdown</h2>
                </div>

                <div className="text-base text-slate-200 leading-relaxed space-y-4">
                    <MediumArticleContent content={project.description} />
                </div>

                {/* Tech Stack Chips */}
                {project.tags && project.tags.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-white/10">
                        <p className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Technologies &amp; Frameworks Used
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-aira-cyan"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ══ COMMUNITY REVIEWS & COMMENTS SECTION ══ */}
            <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <MessageSquare size={20} className="text-aira-cyan" />
                        <h2 className="font-orbitron font-bold text-xl text-white">
                            Community Reviews &amp; Feedback ({reviews.length})
                        </h2>
                    </div>
                </div>

                {/* Write a Review Box */}
                <div className="glass-strong rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl space-y-5">
                    <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                        <span>Leave a Review &amp; Star Rating</span>
                    </h3>

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        {/* Interactive Star Picker */}
                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1.5">Rating Score</label>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 text-2xl transition-transform hover:scale-125 cursor-pointer"
                                    >
                                        <Star
                                            size={22}
                                            className={
                                                (hoverRating || rating) >= star
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-600"
                                            }
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-xs font-mono text-amber-400 font-bold">
                                    {rating} / 5 Stars
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-400 block mb-1.5">Your Name</label>
                                <input
                                    type="text"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                    placeholder="e.g. Alex Johnson"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-400 block mb-1.5">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={reviewerEmail}
                                    onChange={(e) => setReviewerEmail(e.target.value)}
                                    placeholder="alex@example.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1.5">Your Review / Comments *</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="What did you think of the architecture, testing outcomes, and engineering quality?"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white text-xs placeholder-slate-500 outline-none focus:border-aira-cyan/60 resize-y"
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-aira-cyan/25 cursor-pointer disabled:opacity-50"
                            >
                                <Send size={13} />
                                <span>{submittingReview ? "Submitting..." : "Submit Review"}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Reviews Stream */}
                {reviews.length === 0 ? (
                    <div className="glass rounded-3xl border border-white/10 p-10 text-center text-slate-400">
                        <Star size={40} className="mx-auto mb-2 text-amber-400/40" />
                        <p className="font-orbitron font-bold text-white text-sm">No reviews yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">Be the first to review this innovation above!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev: any) => (
                            <motion.div
                                key={rev.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-2xl border border-white/10 p-5 space-y-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-aira-cyan/30 to-purple-600/30 border border-white/15 flex items-center justify-center font-bold text-xs text-aira-cyan">
                                            {rev.authorName?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{rev.authorName}</p>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Star Badge */}
                                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                                        {[...Array(rev.rating || 5)].map((_, i) => (
                                            <Star key={i} size={13} fill="currentColor" />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-200 leading-relaxed pt-1 pl-10 font-sans">
                                    {rev.comment}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
