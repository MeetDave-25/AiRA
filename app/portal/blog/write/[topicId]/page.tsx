"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Save, Send, Image as ImageIcon, Eye, EyeOff, Tag, X, ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogWritePage() {
    const { topicId }    = useParams<{ topicId: string }>();
    const searchParams   = useSearchParams();
    const editId         = searchParams.get("edit");
    const router         = useRouter();
    const { data: session } = useSession();

    const [topic, setTopic]         = useState<any>(null);
    const [title, setTitle]         = useState("");
    const [content, setContent]     = useState("");
    const [coverUrl, setCoverUrl]   = useState("");
    const [tags, setTags]           = useState<string[]>([]);
    const [tagInput, setTagInput]   = useState("");
    const [preview, setPreview]     = useState(false);
    const [saving, setSaving]       = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [msg, setMsg]             = useState("");
    const [postId, setPostId]       = useState<string | null>(editId);
    const fileRef                   = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/blog/topics").then(r => r.json()).then((topics: any[]) => {
            const t = topics.find(t => t.id === topicId);
            setTopic(t ?? null);
        });
    }, [topicId]);

    useEffect(() => {
        if (!editId) return;
        fetch(`/api/blog/posts/${editId}`)
            .then(r => r.json())
            .then(d => {
                if (d.id) {
                    setTitle(d.title);
                    setContent(d.content);
                    setCoverUrl(d.coverImage ?? "");
                    setTags(d.tags ?? []);
                }
            });
    }, [editId]);

    const handleImageUpload = async (file: File) => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/blog/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data.url) setCoverUrl(data.url);
    };

    const addTag = () => {
        const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
        if (t && !tags.includes(t) && tags.length < 6) {
            setTags(prev => [...prev, t]);
        }
        setTagInput("");
    };

    const calcReadTime = (text: string) => {
        const words = text.trim().split(/\s+/).length;
        return `${Math.max(1, Math.round(words / 200))} min read`;
    };

    const save = async (submit = false) => {
        if (!title.trim() || !content.trim()) {
            setMsg("Title and content are required.");
            return;
        }
        submit ? setPublishing(true) : setSaving(true);
        try {
            const body = { topicId, title, content, coverImage: coverUrl || null, tags };
            let res: Response;
            if (postId) {
                // update existing
                res = await fetch(`/api/blog/posts/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...body, readTime: calcReadTime(content) }),
                });
            } else {
                // create new
                res = await fetch("/api/blog/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                const d = await res.json();
                if (d.id) setPostId(d.id);
            }
            const data = await res.json();
            if (res.ok && data.id) {
                if (submit) {
                    setMsg("✅ Submitted for admin review!");
                } else {
                    setMsg("✅ Draft saved!");
                }
                setPostId(data.id);
            } else {
                setMsg(data.error ?? "Error saving.");
            }
        } finally {
            setSaving(false);
            setPublishing(false);
            setTimeout(() => setMsg(""), 3500);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="font-orbitron font-bold text-xl text-white">
                        {editId ? "Edit Article" : "Write Article"}
                    </h1>
                    {topic && <p className="text-xs text-aira-cyan mt-0.5">Topic: {topic.title}</p>}
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setPreview(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:border-aira-cyan/30 transition-all"
                >
                    {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                    {preview ? "Edit" : "Preview"}
                </button>
                <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white hover:border-aira-cyan/30 transition-all"
                >
                    <ImageIcon size={13} /> Cover Image
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />

                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => save(false)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 glass border border-white/10 rounded-lg text-xs text-slate-300 hover:text-white transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => save(true)}
                        disabled={publishing}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-aira-cyan text-black rounded-lg text-xs font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50"
                    >
                        {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        Submit for Review
                    </button>
                </div>
            </div>

            {msg && (
                <p className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {msg}
                </p>
            )}

            {/* Cover preview */}
            {coverUrl && (
                <div className="relative rounded-xl overflow-hidden aspect-[16/6]">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    <button
                        onClick={() => setCoverUrl("")}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Title */}
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full bg-transparent border-0 border-b border-white/10 pb-3 text-2xl sm:text-3xl font-orbitron font-bold text-white placeholder-slate-600 focus:outline-none focus:border-aira-cyan/50 transition-colors"
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
                {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-purple-900/40 rounded-full text-purple-300 text-[11px] font-mono">
                        #{t}
                        <button onClick={() => setTags(prev => prev.filter(x => x !== t))}><X size={10} /></button>
                    </span>
                ))}
                {tags.length < 6 && (
                    <div className="flex items-center gap-1">
                        <Tag size={12} className="text-slate-500" />
                        <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), addTag())}
                            placeholder="Add tag…"
                            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-20"
                        />
                    </div>
                )}
            </div>

            {/* Editor / Preview */}
            {preview ? (
                <div className="glass rounded-2xl border border-white/10 p-6 min-h-[400px] prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-orbitron prose-a:text-aira-cyan prose-code:bg-white/10 prose-code:rounded prose-pre:bg-black/40 prose-pre:rounded-xl">
                    {content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    ) : (
                        <p className="text-slate-500 italic">Nothing to preview yet. Switch back to Edit to write.</p>
                    )}
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`Start writing your article in Markdown...\n\n## Introduction\n\nYour story begins here...\n\n## Key Points\n\n- Point one\n- Point two\n\n## Conclusion\n\nWrap up your thoughts...`}
                    rows={24}
                    className="w-full bg-aira-card border border-white/10 rounded-2xl p-5 text-sm text-slate-200 font-mono placeholder-slate-600 resize-none focus:outline-none focus:border-aira-cyan/30 transition-colors leading-relaxed"
                />
            )}

            {/* Markdown help */}
            {!preview && (
                <p className="text-[11px] text-slate-600">
                    Supports **bold**, _italic_, # headings, - lists, `code`, ```code blocks```, &gt; blockquotes, [links](url), ![images](url)
                </p>
            )}
        </div>
    );
}
