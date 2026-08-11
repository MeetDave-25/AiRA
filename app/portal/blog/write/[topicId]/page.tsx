"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Save, 
    Send, 
    Image as ImageIcon, 
    Eye, 
    EyeOff, 
    Tag, 
    X, 
    ArrowLeft, 
    Loader2,
    Bold,
    Italic,
    Heading2,
    Heading3,
    Quote,
    Minus,
    List,
    ListOrdered,
    Code,
    Link as LinkIcon,
    Sparkles,
    Columns,
    Maximize2,
    Lightbulb,
    FileText
} from "lucide-react";
import MediumArticleContent from "@/components/ui/MediumArticleContent";

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
    const [viewMode, setViewMode]   = useState<"write" | "split" | "preview">("write");
    const [saving, setSaving]       = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [msg, setMsg]             = useState("");
    const [postId, setPostId]       = useState<string | null>(editId);
    
    const fileRef                   = useRef<HTMLInputElement>(null);
    const textareaRef               = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetch("/api/blog/topics?all=true")
            .then(r => r.json())
            .then((topics: any[]) => {
                const t = Array.isArray(topics) ? topics.find(t => t.id === topicId) : null;
                setTopic(t ?? null);
            })
            .catch(() => setTopic(null));
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

    // Calculate words, characters, and estimated reading time
    const stats = {
        words: content.trim() ? content.trim().split(/\s+/).length : 0,
        chars: content.length,
        readTime: `${Math.max(1, Math.round((content.trim().split(/\s+/).length || 1) / 200))} min read`
    };

    // Helper to insert markdown formatting at current cursor selection
    const insertFormatting = (prefix: string, suffix = "", defaultText = "text") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.substring(start, end) || defaultText;
        const replacement = `${prefix}${selected}${suffix}`;

        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);

        // Reset cursor focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        }, 50);
    };

    const insertBlock = (blockText: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setContent(prev => prev + blockText);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = content.substring(0, start);
        const after = content.substring(end);
        
        // Ensure separation
        const needsNewlineBefore = before.length > 0 && !before.endsWith("\n\n");
        const sepBefore = needsNewlineBefore ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
        
        const newContent = before + sepBefore + blockText + after;
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            const newPos = start + sepBefore.length + blockText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 50);
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
                    body: JSON.stringify({ ...body, readTime: stats.readTime }),
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
        <div className="space-y-6 max-w-6xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="font-orbitron font-bold text-xl sm:text-2xl text-white">
                            {editId ? "Edit Article" : "Write Article"}
                        </h1>
                        {topic && <p className="text-xs text-aira-cyan mt-0.5 font-medium">Topic: {topic.title}</p>}
                    </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10">
                    <button
                        onClick={() => setViewMode("write")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            viewMode === "write" ? "bg-white/15 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                        title="Focus on Writing"
                    >
                        <FileText size={13} /> Write
                    </button>
                    <button
                        onClick={() => setViewMode("split")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hidden md:flex ${
                            viewMode === "split" ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "text-slate-400 hover:text-white"
                        }`}
                        title="Side-by-side Writing & Medium Preview"
                    >
                        <Columns size={13} /> Split View
                    </button>
                    <button
                        onClick={() => setViewMode("preview")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            viewMode === "preview" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
                        }`}
                        title="Full Medium Article Preview"
                    >
                        <Eye size={13} /> Medium Preview
                    </button>
                </div>
            </div>

            {/* Top Controls & Publishing Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 glass border border-white/10 hover:border-aira-cyan/40 rounded-xl text-xs text-slate-200 hover:text-white transition-all shadow-sm"
                    >
                        <ImageIcon size={14} className="text-aira-cyan" /> {coverUrl ? "Change Cover" : "Add Cover Image"}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />

                    <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                    <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-white/5 rounded-lg">
                        {stats.words} words · {stats.readTime}
                    </span>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => save(false)}
                        disabled={saving || publishing}
                        className="flex items-center gap-1.5 px-4 py-2 glass border border-white/15 hover:border-white/30 rounded-xl text-xs text-slate-200 hover:text-white transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => save(true)}
                        disabled={publishing || saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-aira-cyan to-sky-400 text-black font-semibold rounded-xl text-xs hover:brightness-110 transition-all shadow-lg shadow-aira-cyan/20 disabled:opacity-50 active:scale-95"
                    >
                        {publishing ? <Loader2 size={14} className="animate-spin text-black" /> : <Send size={14} />}
                        Submit for Review
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${
                    msg.startsWith("✅") ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                }`}>
                    <span>{msg}</span>
                </div>
            )}

            {/* Cover preview */}
            {coverUrl && (
                <div className="relative rounded-2xl overflow-hidden aspect-[16/6] border border-white/10 shadow-2xl">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    <button
                        onClick={() => setCoverUrl("")}
                        className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-rose-600 rounded-full text-white transition-colors"
                        title="Remove cover photo"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Title Input */}
            <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title: Crafting the Future of AI & Robotics..."
                className="w-full bg-transparent border-0 border-b border-white/15 pb-4 text-2xl sm:text-4xl font-orbitron font-bold text-white placeholder-slate-600 focus:outline-none focus:border-aira-cyan transition-colors"
            />

            {/* Tags Selector */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
                {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-900/40 border border-purple-500/30 rounded-full text-purple-300 text-xs font-mono">
                        #{t}
                        <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-white">
                            <X size={12} />
                        </button>
                    </span>
                ))}
                {tags.length < 6 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <Tag size={12} className="text-slate-400" />
                        <input
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), addTag())}
                            placeholder="Add tag (e.g. ai, robotics)..."
                            className="bg-transparent text-xs text-slate-300 placeholder-slate-500 focus:outline-none w-44"
                        />
                    </div>
                )}
            </div>

            {/* ══ MEDIUM-STYLE FORMATTING TOOLBAR (Visible in Write & Split Mode) ══ */}
            {viewMode !== "preview" && (
                <div className="sticky top-20 z-40 p-2 glass rounded-2xl border border-white/15 flex items-center gap-1.5 flex-wrap backdrop-blur-xl shadow-2xl">
                    <button
                        type="button"
                        onClick={() => insertFormatting("**", "**", "bold text")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Bold (**text**)"
                    >
                        <Bold size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting("*", "*", "italic text")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Italic (*text*)"
                    >
                        <Italic size={15} />
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button
                        type="button"
                        onClick={() => insertBlock("## Section Heading\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Major Section Heading (##)"
                    >
                        <Heading2 size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertBlock("### Sub-section Title\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Subheading (###)"
                    >
                        <Heading3 size={15} />
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* Medium 3-Dots Divider / Section Break */}
                    <button
                        type="button"
                        onClick={() => insertBlock("\n\n---\n\n")}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-serif flex items-center gap-1.5 transition-all shadow-sm"
                        title="Insert Medium-Style 3-Dots Section Divider (· · ·)"
                    >
                        <Minus size={14} /> Medium Divider (· · ·)
                    </button>

                    {/* Leave Extra Vertical Space */}
                    <button
                        type="button"
                        onClick={() => insertBlock("\n\n<br/>\n\n")}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                        title="Leave Extra Blank Space in Article"
                    >
                        <span className="font-mono text-[11px]">↵ Space Break</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button
                        type="button"
                        onClick={() => insertBlock("> \"Your impactful pull quote or highlighted statement goes here...\"\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Medium Pull Quote (> )"
                    >
                        <Quote size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertBlock("> 💡 **Key Takeaway:** Highlight your crucial insight or concept here.\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Insight Callout Box"
                    >
                        <Lightbulb size={15} className="text-amber-400" />
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button
                        type="button"
                        onClick={() => insertBlock("- First key point\n- Second key point\n- Third key point\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Bullet List (- )"
                    >
                        <List size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertBlock("1. Step one\n2. Step two\n3. Step three\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Numbered List (1. )"
                    >
                        <ListOrdered size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => insertBlock("```typescript\n// Code snippet\nconst agent = new AutonomousAgent({\n    model: 'aira-neural-v4',\n    role: 'Autonomous Researcher'\n});\n```\n\n")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Code Snippet Block"
                    >
                        <Code size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => insertFormatting("[", "](https://example.com)", "link title")}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Hyperlink [text](url)"
                    >
                        <LinkIcon size={15} />
                    </button>
                </div>
            )}

            {/* ══ WORKSPACE: WRITE / SPLIT / PREVIEW ══ */}
            {viewMode === "preview" ? (
                /* Full Medium Article Preview Presentation */
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-6 sm:p-12 border border-white/10 max-w-4xl mx-auto shadow-2xl"
                >
                    <div className="border-b border-white/10 pb-8 mb-10">
                        {topic && (
                            <span className="px-3 py-1 rounded-full bg-aira-cyan/20 text-aira-cyan text-xs font-orbitron border border-aira-cyan/30 inline-block mb-4">
                                {topic.title}
                            </span>
                        )}
                        <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-white mb-4 leading-tight">
                            {title || "Untitled Article"}
                        </h1>
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
                            <span>By {session?.user?.name || "Author"}</span>
                            <span>·</span>
                            <span>{stats.readTime}</span>
                            <span>·</span>
                            <span>{new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                    </div>

                    {content ? (
                        <MediumArticleContent content={content} />
                    ) : (
                        <p className="text-slate-500 italic text-center py-16 font-sans">
                            No content written yet. Switch back to Write mode to craft your article!
                        </p>
                    )}
                </motion.div>
            ) : viewMode === "split" ? (
                /* Side-by-Side Split Workspace */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px]">
                    {/* Left: Textarea */}
                    <div className="flex flex-col">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder={`Start writing in Markdown...\n\nUse --- to create a Medium 3-dots section break (· · ·).\n\nLeave empty lines to add generous breathing room between thoughts.`}
                            className="flex-1 w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 text-sm sm:text-base text-slate-100 font-mono placeholder-slate-600 resize-none focus:outline-none focus:border-aira-cyan/40 leading-relaxed min-h-[600px]"
                        />
                    </div>

                    {/* Right: Live Medium Preview */}
                    <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 overflow-y-auto max-h-[700px] shadow-2xl">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-3 mb-6">
                            <span>Live Medium Rendering</span>
                            <span className="text-sky-300">{stats.readTime}</span>
                        </div>
                        {content ? (
                            <MediumArticleContent content={content} />
                        ) : (
                            <p className="text-slate-500 italic text-sm">Live preview will render here...</p>
                        )}
                    </div>
                </div>
            ) : (
                /* Full Write Canvas */
                <div className="space-y-4">
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={`Start writing your article...\n\nTip: Press Enter to create natural paragraph breaks.\nUse the "Medium Divider (· · ·)" button or type "---" on a new line to create clean 3-dot section separators.\nUse "> " for elegant pull quotes and insights.`}
                        rows={26}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 text-base sm:text-lg text-slate-100 font-mono placeholder-slate-600 resize-none focus:outline-none focus:border-aira-cyan/40 leading-relaxed shadow-2xl"
                    />

                    {/* Bottom Writing Tips */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-aira-cyan" />
                            <span>Supports Medium-level spacing, <code>---</code> dividers, multi-line formatting, pull quotes & code blocks</span>
                        </div>
                        <div className="font-mono text-slate-400">
                            {stats.words} words · {stats.chars} characters
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
