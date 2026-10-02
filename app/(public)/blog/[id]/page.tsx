"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Send } from "lucide-react";
import Link from "next/link";
import MediumArticleContent from "@/components/ui/MediumArticleContent";
import { Btn, Button, Card, EASE, Empty, SkeletonCard, Tag, inputClass } from "@/components/nb/kit";

import GoogleAdSlot from "@/components/ui/GoogleAdSlot";
function Avatar({ person, size = "w-10 h-10" }: { person: any; size?: string }) {
    return person?.avatar ? (
        <img src={person.avatar} alt="" className={`${size} rounded-full border-2 border-nb-ink object-cover`} />
    ) : (
        <span className={`${size} rounded-full border-2 border-nb-ink bg-nb-sun flex items-center justify-center font-bold`}>{person?.name?.[0]}</span>
    );
}

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
            <div className="min-h-screen pt-36 px-5 max-w-3xl mx-auto">
                <SkeletonCard className="h-96" />
            </div>
        );
    }
    if (!post) {
        return (
            <div className="min-h-screen pt-36 px-5 max-w-3xl mx-auto">
                <Empty title="Post not found" desc="It may have been unpublished.">
                    <Btn href="/blog" tone="white">← Back to the blog</Btn>
                </Empty>
            </div>
        );
    }

    return (
        <article className="min-h-screen pt-32 sm:pt-36 pb-24 px-5 max-w-3xl mx-auto">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 font-brico font-bold text-sm hover:text-nb-violet transition-colors">
                <ArrowLeft size={16} /> Back to the blog
            </button>

            <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-6">
                {post.topic?.title && <Tag className="bg-nb-lilac">{post.topic.title}</Tag>}
                <h1 className="mt-4 font-brico font-extrabold tracking-[-0.035em] leading-[1.02] text-[clamp(2.2rem,5.5vw,3.75rem)]">{post.title}</h1>
                {post.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((t: string) => (
                            <span key={t} className="font-mono text-xs text-nb-violet">#{t}</span>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 pb-6 border-b-2 border-nb-ink">
                    <div className="flex items-center gap-3">
                        <Avatar person={post.author} />
                        <div>
                            <p className="font-brico font-bold leading-tight">{post.author?.name}</p>
                            <p className="text-xs text-nb-muted">{post.author?.role}</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-nb-muted"><Clock size={14} /> {post.readTime ?? "5 min read"}</span>
                    {avgRating && (
                        <span className="flex items-center gap-1 text-sm font-semibold">
                            <Star size={14} className="fill-nb-sun" /> {avgRating} ({post.reviews.length} reviews)
                        </span>
                    )}
                    {post.publishedAt && (
                        <span className="text-sm text-nb-muted">
                            {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                    )}
                </div>
            </motion.header>

            {post.coverImage && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease: EASE }} className="my-10">
                    <img src={post.coverImage} alt={post.title} className="w-full aspect-[16/8] object-cover rounded-[22px] border-2 border-nb-ink shadow-nb-lg" />
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-10 mb-16">
                <MediumArticleContent content={post.content} variant="light" className="text-[17px] sm:text-[19px]" />
            </motion.div>

            {/* Ad: end of article */}
            <GoogleAdSlot className="mb-16" />

            {/* Reviews */}
            <section className="pt-10 border-t-2 border-nb-ink">
                <h2 className="font-brico font-extrabold text-3xl tracking-tight">
                    Community reviews <span className="text-nb-muted">({post.reviews?.length ?? 0})</span>
                </h2>

                {session ? (
                    <Card className="mt-6 p-5 sm:p-6" color="bg-nb-sun">
                        <p className="font-brico font-bold">Leave your review</p>
                        <div className="mt-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} aria-label={`${s} stars`} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                                    <Star size={26} className={s <= rating ? "fill-nb-ink text-nb-ink" : "text-nb-ink/30"} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reviewBody}
                            onChange={(e) => setReviewBody(e.target.value)}
                            rows={3}
                            placeholder="Share your thoughts about this article…"
                            className={`${inputClass} mt-3 resize-none`}
                        />
                        {reviewMsg && <p className="mt-2 text-sm font-semibold">{reviewMsg}</p>}
                        <Button onClick={submitReview} disabled={submitting || !reviewBody.trim()} tone="ink" className="mt-4">
                            <Send size={15} /> {submitting ? "Posting…" : "Post review"}
                        </Button>
                    </Card>
                ) : (
                    <Card className="mt-6 p-5 text-center" color="bg-nb-lilac">
                        <p>
                            <Link href="/portal/login" className="font-bold underline underline-offset-4">Log in</Link> to leave a review.
                        </p>
                    </Card>
                )}

                {post.reviews?.length === 0 ? (
                    <p className="mt-8 text-center text-nb-muted">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="mt-8 space-y-4">
                        {post.reviews.map((review: any) => (
                            <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="p-5">
                                    <div className="flex items-center gap-3">
                                        <Avatar person={review.author} size="w-9 h-9" />
                                        <div>
                                            <p className="font-brico font-bold leading-tight">{review.author?.name}</p>
                                            <div className="flex gap-0.5 mt-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} size={12} className={s <= review.rating ? "fill-nb-ink text-nb-ink" : "text-nb-ink/25"} />
                                                ))}
                                            </div>
                                        </div>
                                        <span className="ml-auto font-mono text-xs text-nb-muted">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-nb-ink/80 leading-relaxed">{review.body}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </article>
    );
}
