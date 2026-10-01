"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock } from "lucide-react";
import { BLOCK_COLORS, Btn, Chip, EASE, Empty, PageHero, SearchInput, SkeletonCard, WRAP } from "@/components/nb/kit";

export default function BlogPage() {
    const [posts, setPosts]     = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState("");
    const [tag, setTag]         = useState("");

    useEffect(() => {
        const url = tag ? `/api/blog/posts?tag=${encodeURIComponent(tag)}` : "/api/blog/posts";
        setLoading(true);
        fetch(url)
            .then(r => r.ok ? r.json() : [])
            .then(d => {
                setPosts(Array.isArray(d) ? d : []);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, [tag]);

    const allTags = Array.from(new Set(posts.flatMap((p: any) => p.tags ?? [])));

    const filtered = posts.filter((p: any) =>
        search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
    );

    return (
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Community notes"
                title="The AiRA blog."
                says="Everything here is written by students in our community — tutorials, research notes and build logs."
                desc="Insights, research notes and build stories written by AiRA Lab members."
            >
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                    <SearchInput value={search} onChange={setSearch} placeholder="Search articles…" />
                    <div className="flex flex-wrap gap-2">
                        <Chip active={!tag} onClick={() => setTag("")}>All</Chip>
                        {allTags.slice(0, 8).map((t) => (
                            <Chip key={t} active={tag === t} onClick={() => setTag(t === tag ? "" : t)}>
                                #{t}
                            </Chip>
                        ))}
                    </div>
                </div>
            </PageHero>

            <div className={WRAP}>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <Empty icon={<BookOpen size={24} />} title="No articles found yet." desc="Be the first to publish — log in and write a blog!">
                        <Btn href="/portal/login">Write a post</Btn>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((post: any, i: number) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: EASE, delay: (i % 3) * 0.06 }}
                            >
                                <Link
                                    href={`/blog/${post.id}`}
                                    className="group block h-full rounded-[22px] border-2 border-nb-ink bg-white shadow-nb overflow-hidden transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg"
                                >
                                    <div className={`relative aspect-[16/9] border-b-2 border-nb-ink overflow-hidden ${BLOCK_COLORS[i % BLOCK_COLORS.length]}`}>
                                        {post.coverImage ? (
                                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BookOpen size={40} className="text-nb-ink/30" />
                                            </div>
                                        )}
                                        {post.topic?.title && (
                                            <span className="absolute top-3 left-3 rounded-full border-2 border-nb-ink bg-white px-2.5 py-0.5 text-[11px] font-bold">{post.topic.title}</span>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h2 className="font-brico font-extrabold text-xl tracking-tight leading-snug line-clamp-2 group-hover:text-nb-violet transition-colors">{post.title}</h2>
                                        {post.tags?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {post.tags.slice(0, 3).map((t: string) => (
                                                    <span key={t} className="font-mono text-[11px] text-nb-violet">#{t}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 pt-4 border-t-2 border-dashed border-nb-ink/15 flex items-center justify-between text-sm text-nb-muted">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {post.author?.avatar ? (
                                                    <img src={post.author.avatar} alt="" className="w-7 h-7 rounded-full border-2 border-nb-ink object-cover" />
                                                ) : (
                                                    <span className="w-7 h-7 rounded-full border-2 border-nb-ink bg-nb-sun flex items-center justify-center text-xs font-bold text-nb-ink">
                                                        {(post.author?.name || post.authorName || "A")[0]}
                                                    </span>
                                                )}
                                                <span className="truncate font-medium text-nb-ink">{post.author?.name || post.authorName}</span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                {post._count?.reviews > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Star size={13} className="fill-nb-sun text-nb-ink" /> {post._count.reviews}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} /> {post.readTime ?? "5 min"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
