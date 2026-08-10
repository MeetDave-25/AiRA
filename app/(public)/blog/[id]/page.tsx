"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, User, BookOpen, Send } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPostPage() {
    const { id }       = useParams<{ id: string }>();
    const router       = useRouter();
    const { data: session } = useSession();

    const [post, setPost]               = useState<any>(null);
    const [loading, setLoading]         = useState(true);
    const [reviewBody, setReviewBody]   = useState("");
    const [rating, setRating]           = useState(5);
    const [submitting, setSubmitting]   = useState(false);
    const [reviewMsg, setReviewMsg]     = useState("");

    useEffect(() => {
        fetch(`/api/blog/posts/${id}`)
            .then(r => r.json())
            .then(d => { if (d.id) setPost(d); })
            .finally(() => setLoading(false));
    }, [id]);

    const avgRating = post?.reviews?.length
        ? (post.reviews.reduce((s: number, r: any) => s + r.rating, 0) / post.reviews.length).toFixed(1)
        : null;

    const submitReview = async () => {
        if (!reviewBody.trim()) return;
        setSubmitting(true);
        const res = await fetch(`/api/blog/posts/${id}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: reviewBody, rating }),
        });
        const data = await res.json();
        if (res.ok) {
            setPost((p: any) => ({ ...p, reviews: [data, ...(p?.reviews ?? [])] }));
            setReviewBody("");
            setReviewMsg("Review submitted!");
        } else {
            setReviewMsg(data.error ?? "Error submitting review");
        }
        setSubmitting(false);
        setTimeout(() => setReviewMsg(""), 3500);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-28 px-4 max-w-4xl mx-auto">
                <div className="glass rounded-2xl h-96 animate-pulse" />
            </div>
        );
    }
    if (!post) {
        return (
            <div className="min-h-screen pt-28 text-center text-slate-400">
                <p className="font-orbitron text-2xl">Post not found</p>
                <Link href="/blog" className="mt-4 inline-block text-aira-cyan underline">← Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
            {/* Back */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Back to Blog
            </motion.button>

            {/* Cover Image */}
            {post.coverImage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-2xl overflow-hidden aspect-[16/7] mb-8"
                >
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-aira-bg/80 via-transparent to-transparent" />
                </motion.div>
            )}

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-block px-3 py-1 rounded-full bg-aira-cyan/20 text-aira-cyan text-[11px] font-orbitron border border-aira-cyan/30 mb-4">
                    {post.topic?.title}
                </span>
                <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-white mb-4 leading-snug">
                    {post.title}
                </h1>

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((t: string) => (
                            <span key={t} className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 text-[11px] font-mono">#{t}</span>
                        ))}
                    </div>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        {post.author?.avatar ? (
                            <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-aira-purple flex items-center justify-center text-sm font-bold text-white">
                                {post.author?.name?.[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-white text-sm font-medium">{post.author?.name}</p>
                            <p className="text-[11px]">{post.author?.role}</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1"><Clock size={13} /> {post.readTime ?? "5 min read"}</span>
                    {avgRating && (
                        <span className="flex items-center gap-1 text-aira-gold">
                            <Star size={13} fill="currentColor" /> {avgRating} ({post.reviews.length} reviews)
                        </span>
                    )}
                    <span className="text-[12px]">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-orbitron prose-headings:text-white prose-a:text-aira-cyan prose-code:bg-white/10 prose-code:rounded prose-pre:bg-black/40 prose-pre:rounded-xl prose-blockquote:border-l-aira-cyan prose-blockquote:text-slate-300 mb-12"
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </motion.div>

            {/* ── Reviews Section ── */}
            <div className="border-t border-white/10 pt-10">
                <h2 className="font-orbitron font-bold text-lg text-white mb-6">
                    Community Reviews <span className="text-slate-500 font-normal text-base">({post.reviews?.length ?? 0})</span>
                </h2>

                {/* Submit review (members only) */}
                {session ? (
                    <div className="glass rounded-2xl p-5 border border-white/10 mb-8">
                        <p className="text-sm text-slate-300 font-medium mb-3">Leave Your Review</p>
                        {/* Star picker */}
                        <div className="flex gap-1 mb-3">
                            {[1,2,3,4,5].map(s => (
                                <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                                    <Star
                                        size={22}
                                        fill={s <= rating ? "#f59e0b" : "transparent"}
                                        className={s <= rating ? "text-aira-gold" : "text-slate-600"}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reviewBody}
                            onChange={e => setReviewBody(e.target.value)}
                            rows={3}
                            placeholder="Share your thoughts about this article..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-aira-cyan/40 mb-3"
                        />
                        {reviewMsg && <p className="text-xs mb-2 text-aira-cyan">{reviewMsg}</p>}
                        <button
                            onClick={submitReview}
                            disabled={submitting || !reviewBody.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-aira-cyan text-black rounded-xl text-sm font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        >
                            <Send size={14} /> {submitting ? "Posting…" : "Post Review"}
                        </button>
                    </div>
                ) : (
                    <div className="glass rounded-xl p-4 border border-white/10 mb-8 text-center">
                        <p className="text-slate-400 text-sm">
                            <Link href="/portal/login" className="text-aira-cyan hover:underline">Login</Link> to leave a review.
                        </p>
                    </div>
                )}

                {/* Reviews list */}
                {post.reviews?.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="space-y-4">
                        {post.reviews.map((review: any) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass rounded-xl p-4 border border-white/8"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {review.author?.avatar ? (
                                        <img src={review.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-aira-purple flex items-center justify-center text-xs font-bold text-white">
                                            {review.author?.name?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-white">{review.author?.name}</p>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} size={11} fill={s <= review.rating ? "#f59e0b" : "transparent"} className={s <= review.rating ? "text-aira-gold" : "text-slate-600"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="ml-auto text-[11px] text-slate-500">
                                        {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{review.body}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
