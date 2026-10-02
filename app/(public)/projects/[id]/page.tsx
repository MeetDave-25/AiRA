"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Heart, ExternalLink, Github, Share2, Calendar, Sparkles, MessageSquare, Send, Bot } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import MediumArticleContent from "@/components/ui/MediumArticleContent";
import { Btn, Button, Card, EASE, Empty, Mask, SkeletonCard, Tag, inputClass } from "@/components/nb/kit";

import GoogleAdSlot from "@/components/ui/GoogleAdSlot";
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
            <div className="min-h-screen pt-36 px-5 max-w-5xl mx-auto">
                <SkeletonCard className="h-[60vh]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen pt-36 px-5 max-w-3xl mx-auto">
                <Empty icon={<Bot size={24} />} title="Project not found" desc="It may be under review or removed.">
                    <Btn href="/projects" tone="white">← Back to the showcase</Btn>
                </Empty>
            </div>
        );
    }

    const reviews = project.reviews || [];

    return (
        <div className="min-h-screen pt-32 sm:pt-36 pb-24 px-5 max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-3">
                <button onClick={() => router.push("/projects")} className="inline-flex items-center gap-2 font-brico font-bold text-sm hover:text-nb-violet transition-colors">
                    <ArrowLeft size={16} /> Back to the showcase
                </button>
                <div className="flex items-center gap-2">
                    <Button onClick={handleLike} tone={liked ? "sun" : "white"} size="sm">
                        <Heart size={15} className={liked ? "fill-nb-ink" : ""} /> {likesCount}
                    </Button>
                    <Button onClick={handleShare} tone="white" size="sm" title="Copy link">
                        <Share2 size={15} />
                    </Button>
                </div>
            </div>

            <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-8">
                <div className="flex flex-wrap items-center gap-2">
                    <Tag className="bg-nb-sky">{project.category}</Tag>
                    {project.featured && <Tag className="bg-nb-sun">★ Featured</Tag>}
                    <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs text-nb-muted">
                        <Calendar size={13} />
                        {new Date(project.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>
                <h1 className="mt-5 font-brico font-extrabold tracking-[-0.04em] leading-[0.98] text-[clamp(2.4rem,6vw,4.75rem)]">
                    <Mask play>{project.title}</Mask>
                </h1>
                {project.tagline && <p className="mt-4 text-xl text-nb-muted leading-relaxed max-w-3xl">{project.tagline}</p>}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-5 border-t-2 border-nb-ink">
                    <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center font-brico font-extrabold">
                            {project.authorName?.[0] || "A"}
                        </span>
                        <div>
                            <p className="font-brico font-bold">{project.authorName || "AiRA member"}</p>
                            <p className="text-xs text-nb-muted">Built in the AiRA community</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-nb-ink bg-white px-3 py-1.5 font-bold shadow-nb-sm">
                        <Star size={15} className="fill-nb-sun" /> {project.avgRating ?? "5.0"} / 5
                        <span className="font-normal text-nb-muted text-sm">({reviews.length} reviews)</span>
                    </span>
                </div>

                {(project.demoUrl || project.githubUrl) && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        {project.demoUrl && (
                            <Btn href={project.demoUrl} external>
                                <ExternalLink size={16} /> Launch live demo
                            </Btn>
                        )}
                        {project.githubUrl && (
                            <Btn href={project.githubUrl} external tone="white">
                                <Github size={16} /> View source
                            </Btn>
                        )}
                    </div>
                )}
            </motion.header>

            {project.coverImage && (
                <motion.div initial={{ opacity: 0, y: 20, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: EASE }} className="mt-10">
                    <img src={project.coverImage} alt={project.title} className="w-full aspect-[16/8] object-cover rounded-[22px] border-2 border-nb-ink shadow-nb-lg" />
                </motion.div>
            )}

            <Card className="mt-10 p-6 sm:p-10">
                <h2 className="flex items-center gap-2 font-brico font-extrabold text-2xl pb-4 mb-6 border-b-2 border-nb-ink">
                    <Sparkles size={20} /> Case study
                </h2>
                <MediumArticleContent content={project.description} variant="light" className="text-[17px] sm:text-[19px]" />
                {/* Ad: after the case study */}
                <GoogleAdSlot className="my-10" />
                {project.tags?.length > 0 && (
                    <div className="mt-10 pt-6 border-t-2 border-dashed border-nb-ink/20">
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-nb-muted mb-3">Built with</p>
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag: string) => (
                                <Tag key={tag} className="bg-nb-lilac text-xs px-3 py-1">#{tag}</Tag>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* Reviews */}
            <section className="mt-14">
                <h2 className="flex items-center gap-2 font-brico font-extrabold text-3xl tracking-tight">
                    <MessageSquare size={24} /> Community reviews ({reviews.length})
                </h2>

                <Card className="mt-6 p-6 sm:p-8" color="bg-nb-sun">
                    <h3 className="font-brico font-extrabold text-xl">Leave a review</h3>
                    <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    aria-label={`${star} stars`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-0.5 transition-transform hover:scale-125"
                                >
                                    <Star size={28} className={(hoverRating || rating) >= star ? "fill-nb-ink text-nb-ink" : "text-nb-ink/30"} />
                                </button>
                            ))}
                            <span className="ml-2 font-mono text-sm font-bold">{rating} / 5</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-brico font-bold text-sm mb-1.5">Your name</label>
                                <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="e.g. Alex Johnson" className={inputClass} />
                            </div>
                            <div>
                                <label className="block font-brico font-bold text-sm mb-1.5">Email (optional)</label>
                                <input type="email" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} placeholder="alex@example.com" className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className="block font-brico font-bold text-sm mb-1.5">Your review *</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="What did you think of the idea, the build and the result?"
                                className={`${inputClass} resize-y`}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={submittingReview} tone="ink">
                                <Send size={15} /> {submittingReview ? "Submitting…" : "Submit review"}
                            </Button>
                        </div>
                    </form>
                </Card>

                {reviews.length === 0 ? (
                    <p className="mt-8 text-center text-nb-muted">No reviews yet — be the first!</p>
                ) : (
                    <div className="mt-8 space-y-4">
                        {reviews.map((rev: any) => (
                            <motion.div key={rev.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="p-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-9 h-9 rounded-full border-2 border-nb-ink bg-nb-lilac flex items-center justify-center font-bold">
                                                {rev.authorName?.[0]?.toUpperCase() || "U"}
                                            </span>
                                            <div>
                                                <p className="font-brico font-bold leading-tight">{rev.authorName}</p>
                                                <p className="font-mono text-[11px] text-nb-muted">
                                                    {new Date(rev.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(rev.rating || 5)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-nb-ink text-nb-ink" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-nb-ink/80 leading-relaxed">{rev.comment}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
