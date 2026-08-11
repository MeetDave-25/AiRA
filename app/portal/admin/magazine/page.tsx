"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    BookOpen, 
    Check, 
    X, 
    Trash2, 
    Eye, 
    GripVertical, 
    Loader2, 
    Image as ImageIcon, 
    Edit2, 
    UploadCloud, 
    Save, 
    ExternalLink,
    Sparkles,
    CheckCircle2,
    Clock
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { uploadDirectFile } from "@/lib/upload-client";

export default function AdminMagazinePage() {
    const [magazines, setMagazines]   = useState<any[]>([]);
    const [allPosts, setAllPosts]     = useState<any[]>([]);
    const [selected, setSelected]     = useState<any | null>(null);
    const [loading, setLoading]       = useState(false);

    // Create modal state
    const [showCreate, setShowCreate] = useState(false);
    const [formTitle, setFormTitle]   = useState("");
    const [formEdition, setFormEdition] = useState("");
    const [formDesc, setFormDesc]     = useState("");
    const [formCover, setFormCover]   = useState("");
    const [creating, setCreating]     = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const createCoverFileRef          = useRef<HTMLInputElement>(null);

    // Edit modal state
    const [editingMag, setEditingMag] = useState<any | null>(null);
    const [editTitle, setEditTitle]   = useState("");
    const [editEdition, setEditEdition] = useState("");
    const [editDesc, setEditDesc]     = useState("");
    const [editCover, setEditCover]   = useState("");
    const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isUploadingEditCover, setIsUploadingEditCover] = useState(false);
    const editCoverFileRef            = useRef<HTMLInputElement>(null);

    const loadMagazines = () => {
        setLoading(true);
        fetch("/api/magazine")
            .then(r => r.json())
            .then(d => setMagazines(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    };

    const loadPublishedPosts = () => {
        fetch("/api/blog/posts")
            .then(r => r.json())
            .then(d => setAllPosts(Array.isArray(d) ? d : []));
    };

    useEffect(() => { 
        loadMagazines(); 
        loadPublishedPosts(); 
    }, []);

    // Handle Cover Upload for New Edition
    const handleCreateCoverUpload = async (file: File) => {
        if (!file) return;
        setUploadingCover(true);
        const toastId = toast.loading("Uploading magazine cover...");
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "magazine" });
            if (uploaded?.url) {
                setFormCover(uploaded.url);
                toast.success("Cover image uploaded!", { id: toastId });
            }
        } catch (error: any) {
            toast.error(error?.message || "Cover upload failed", { id: toastId });
        } finally {
            setUploadingCover(false);
        }
    };

    // Handle Cover Upload for Edit Edition
    const handleEditCoverUpload = async (file: File) => {
        if (!file) return;
        setIsUploadingEditCover(true);
        const toastId = toast.loading("Uploading magazine cover...");
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "magazine" });
            if (uploaded?.url) {
                setEditCover(uploaded.url);
                toast.success("Cover image updated!", { id: toastId });
            }
        } catch (error: any) {
            toast.error(error?.message || "Cover upload failed", { id: toastId });
        } finally {
            setIsUploadingEditCover(false);
        }
    };

    const createMagazine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formEdition.trim()) {
            toast.error("Title and edition are required");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch("/api/magazine", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title: formTitle.trim(), 
                    edition: formEdition.trim(), 
                    description: formDesc.trim() || null, 
                    coverImage: formCover.trim() || null 
                }),
            });
            const data = await res.json();
            if (res.ok && data.id) {
                toast.success("Magazine edition created!");
                setFormTitle(""); 
                setFormEdition(""); 
                setFormDesc(""); 
                setFormCover("");
                setShowCreate(false);
                loadMagazines();
                setSelected(data);
            } else {
                toast.error(data.error || "Failed to create magazine");
            }
        } catch {
            toast.error("Network error while creating magazine");
        } finally {
            setCreating(false);
        }
    };

    const openEditModal = (mag: any) => {
        setEditingMag(mag);
        setEditTitle(mag.title || "");
        setEditEdition(mag.edition || "");
        setEditDesc(mag.description || "");
        setEditCover(mag.coverImage || "");
        setEditStatus(mag.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMag) return;
        if (!editTitle.trim() || !editEdition.trim()) {
            toast.error("Title and edition are required");
            return;
        }

        setIsSavingEdit(true);
        try {
            const res = await fetch(`/api/magazine/${editingMag.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    edition: editEdition.trim(),
                    description: editDesc.trim(),
                    coverImage: editCover.trim(),
                    status: editStatus,
                }),
            });
            const data = await res.json();
            if (res.ok && data.id) {
                toast.success("Magazine edition updated!");
                setEditingMag(null);
                loadMagazines();
                if (selected?.id === data.id) {
                    setSelected(data);
                }
            } else {
                toast.error(data.error || "Failed to update magazine");
            }
        } catch {
            toast.error("Error saving magazine changes");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const addPostToMag = async (postId: string) => {
        if (!selected) return;
        const res = await fetch(`/api/magazine/${selected.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ addPostId: postId }),
        });
        const d = await res.json();
        if (d.id) { 
            setSelected(d); 
            loadMagazines(); 
            toast.success("Article added to edition!");
        }
    };

    const removePostFromMag = async (postId: string) => {
        if (!selected) return;
        const res = await fetch(`/api/magazine/${selected.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ removePostId: postId }),
        });
        const d = await res.json();
        if (d.id) { 
            setSelected(d); 
            loadMagazines(); 
            toast.success("Article removed from edition");
        }
    };

    const publishMagazine = async (id: string, pub: boolean) => {
        const res = await fetch(`/api/magazine/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: pub ? "PUBLISHED" : "DRAFT" }),
        });
        const d = await res.json();
        if (d.id) {
            toast.success(pub ? "Magazine published to public!" : "Set to draft.");
            loadMagazines();
            if (selected?.id === id) setSelected(d);
        }
    };

    const deleteMagazine = async (id: string) => {
        if (!confirm("Are you sure you want to delete this magazine edition permanently?")) return;
        await fetch(`/api/magazine/${id}`, { method: "DELETE" });
        toast.success("Magazine deleted");
        if (selected?.id === id) setSelected(null);
        loadMagazines();
    };

    const selectedPostIds = new Set(selected?.posts?.map((mp: any) => mp.post.id) ?? []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 rounded-3xl border border-white/10">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                        Magazine Studio
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Create magazine editions, upload custom cover photos, edit metadata, and curate articles.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/magazine"
                        target="_blank"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                        <ExternalLink size={14} className="text-sky-400" /> View Public Shelf
                    </Link>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-aira-magenta to-pink-500 text-white rounded-xl text-xs sm:text-sm font-semibold hover:scale-105 transition-transform shadow-lg shadow-pink-500/20"
                    >
                        <Plus size={16} /> New Edition
                    </button>
                </div>
            </div>

            {/* ══ MODAL: CREATE NEW MAGAZINE ══ */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/15 max-w-lg w-full space-y-5 bg-slate-950/95 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-aira-magenta/20 text-aira-magenta border border-aira-magenta/40">
                                        <BookOpen size={18} />
                                    </span>
                                    <h2 className="font-orbitron font-bold text-lg text-white">
                                        Create Magazine Edition
                                    </h2>
                                </div>
                                <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={createMagazine} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Magazine Title <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                        placeholder="e.g. AiRA Lab Quarterly: Frontiers of Robotics"
                                        required
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Edition / Volume Tag <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        value={formEdition}
                                        onChange={e => setFormEdition(e.target.value)}
                                        placeholder="e.g. Vol. 1 · Issue 4 (Q3 2026)"
                                        required
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Description / Editorial Abstract
                                    </label>
                                    <textarea
                                        value={formDesc}
                                        onChange={e => setFormDesc(e.target.value)}
                                        rows={3}
                                        placeholder="Short synopsis about this magazine edition..."
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-magenta resize-none"
                                    />
                                </div>

                                {/* Cover Image Upload */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Cover Photo
                                    </label>
                                    {formCover ? (
                                        <div className="relative rounded-2xl overflow-hidden aspect-[16/8] border border-white/10 group">
                                            <img src={formCover} alt="Cover preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormCover("")}
                                                className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-rose-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => createCoverFileRef.current?.click()}
                                            disabled={uploadingCover}
                                            className="w-full py-4 border-2 border-dashed border-white/15 hover:border-aira-magenta/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white transition-all bg-white/[0.02]"
                                        >
                                            {uploadingCover ? (
                                                <Loader2 size={20} className="animate-spin text-aira-magenta" />
                                            ) : (
                                                <UploadCloud size={20} className="text-aira-magenta" />
                                            )}
                                            <span className="text-xs font-medium">
                                                {uploadingCover ? "Uploading Cover..." : "Click to Upload Magazine Cover Photo"}
                                            </span>
                                        </button>
                                    )}
                                    <input
                                        ref={createCoverFileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => e.target.files?.[0] && void handleCreateCoverUpload(e.target.files[0])}
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || uploadingCover}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aira-magenta to-pink-500 text-white font-semibold text-xs flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                                    >
                                        {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                        <span>Create Edition</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══ MODAL: EDIT EXISTING MAGAZINE ══ */}
            <AnimatePresence>
                {Boolean(editingMag) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-strong p-6 sm:p-8 rounded-3xl border border-white/15 max-w-lg w-full space-y-5 bg-slate-950/95 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
                                        <Edit2 size={18} />
                                    </span>
                                    <h2 className="font-orbitron font-bold text-lg text-white">
                                        Edit Magazine Edition
                                    </h2>
                                </div>
                                <button onClick={() => setEditingMag(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEdit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Magazine Title <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Edition / Volume Tag <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        value={editEdition}
                                        onChange={e => setEditEdition(e.target.value)}
                                        required
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={editDesc}
                                        onChange={e => setEditDesc(e.target.value)}
                                        rows={3}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 resize-none"
                                    />
                                </div>

                                {/* Status Switch */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Publication Status
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditStatus("DRAFT")}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                                editStatus === "DRAFT"
                                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                                    : "bg-white/5 border-white/10 text-slate-400"
                                            }`}
                                        >
                                            <Clock size={14} /> Draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditStatus("PUBLISHED")}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                                editStatus === "PUBLISHED"
                                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                                    : "bg-white/5 border-white/10 text-slate-400"
                                            }`}
                                        >
                                            <CheckCircle2 size={14} /> Published
                                        </button>
                                    </div>
                                </div>

                                {/* Cover Image Upload */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Cover Photo
                                    </label>
                                    {editCover ? (
                                        <div className="relative rounded-2xl overflow-hidden aspect-[16/8] border border-white/10 group">
                                            <img src={editCover} alt="Cover preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => editCoverFileRef.current?.click()}
                                                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xs font-medium"
                                                >
                                                    Change Photo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditCover("")}
                                                    className="p-1.5 bg-rose-600 rounded-xl text-white text-xs"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => editCoverFileRef.current?.click()}
                                            disabled={isUploadingEditCover}
                                            className="w-full py-4 border-2 border-dashed border-white/15 hover:border-sky-400/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-white transition-all bg-white/[0.02]"
                                        >
                                            {isUploadingEditCover ? (
                                                <Loader2 size={20} className="animate-spin text-sky-400" />
                                            ) : (
                                                <UploadCloud size={20} className="text-sky-400" />
                                            )}
                                            <span className="text-xs font-medium">
                                                {isUploadingEditCover ? "Uploading Cover..." : "Upload New Magazine Cover Photo"}
                                            </span>
                                        </button>
                                    )}
                                    <input
                                        ref={editCoverFileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => e.target.files?.[0] && void handleEditCoverUpload(e.target.files[0])}
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMag(null)}
                                        className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingEdit || isUploadingEditCover}
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                                    >
                                        {isSavingEdit ? <Loader2 size={14} className="animate-spin text-slate-950" /> : <Save size={14} />}
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ══ TWO COLUMN WORKSPACE ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left: Magazine Editions list (5 cols) ── */}
                <div className="lg:col-span-5 space-y-3">
                    <h2 className="font-orbitron text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        All Editions ({magazines.length})
                    </h2>
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)
                    ) : magazines.length === 0 ? (
                        <div className="glass rounded-3xl border border-white/10 p-8 text-center text-slate-500 space-y-3">
                            <BookOpen size={36} className="mx-auto text-aira-magenta/40" />
                            <p className="text-sm">No magazine editions created yet.</p>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="px-4 py-2 rounded-xl bg-aira-magenta/20 text-aira-magenta border border-aira-magenta/30 text-xs font-semibold"
                            >
                                Create First Edition
                            </button>
                        </div>
                    ) : (
                        magazines.map((mag: any, i: number) => (
                            <motion.div
                                key={mag.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => setSelected(mag)}
                                className={`glass rounded-2xl border p-4 cursor-pointer transition-all ${
                                    selected?.id === mag.id 
                                        ? "border-aira-magenta/60 bg-aira-magenta/10 shadow-lg shadow-aira-magenta/10" 
                                        : "border-white/10 hover:border-white/20"
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    {mag.coverImage ? (
                                        <img src={mag.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-900/60 to-pink-900/30 flex items-center justify-center shrink-0 border border-white/10">
                                            <BookOpen size={20} className="text-aira-magenta" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-sm text-white truncate">{mag.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-orbitron font-semibold border ${
                                                mag.status === "PUBLISHED" 
                                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" 
                                                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                            }`}>
                                                {mag.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono">{mag.edition}</p>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            {mag.posts?.length ?? 0} curated articles
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => openEditModal(mag)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/40 text-slate-300 hover:text-sky-300 transition-all"
                                            title="Edit Edition & Cover Image"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                        <Link
                                            href={`/magazine/${mag.id}`}
                                            target="_blank"
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-center"
                                            title="Read Edition"
                                        >
                                            <Eye size={13} />
                                        </Link>
                                        <button
                                            onClick={() => deleteMagazine(mag.id)}
                                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-all"
                                            title="Delete Edition"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* ── Right: Article Curator & Live Edition Manager (7 cols) ── */}
                <div className="lg:col-span-7">
                    {!selected ? (
                        <div className="glass rounded-3xl border border-white/10 p-12 text-center text-slate-500 min-h-[400px] flex items-center justify-center flex-col gap-3">
                            <GripVertical size={32} className="opacity-30 text-aira-magenta" />
                            <p className="text-sm font-medium">Select a magazine edition on the left to curate and organize articles</p>
                        </div>
                    ) : (
                        <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
                            {/* Selected Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                                <div>
                                    <span className="text-xs font-orbitron font-bold text-aira-magenta uppercase tracking-wider">
                                        Active Edition
                                    </span>
                                    <h2 className="font-orbitron font-bold text-xl text-white mt-1">
                                        {selected.title}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selected.edition}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(selected)}
                                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                                    >
                                        <Edit2 size={13} className="text-sky-400" /> Edit Info
                                    </button>
                                    <button
                                        onClick={() => publishMagazine(selected.id, selected.status !== "PUBLISHED")}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all ${
                                            selected.status === "PUBLISHED"
                                                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                        }`}
                                    >
                                        {selected.status === "PUBLISHED" ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                                        <span>{selected.status === "PUBLISHED" ? "Set to Draft" : "Publish to Web"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Articles Currently in this Edition */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-orbitron font-bold text-slate-300 uppercase tracking-widest">
                                        Articles in this Edition ({selected.posts?.length ?? 0})
                                    </p>
                                    <span className="text-[11px] text-slate-500">Readers swipe through these articles in order</span>
                                </div>

                                {(selected.posts ?? []).length === 0 ? (
                                    <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-slate-500 text-xs">
                                        No articles added to this edition yet. Select published articles from below.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selected.posts.map((mp: any, i: number) => (
                                            <div key={mp.post.id} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                                                <span className="text-xs font-mono font-bold text-aira-magenta w-6 shrink-0 text-center">
                                                    #{i + 1}
                                                </span>
                                                {mp.post.coverImage ? (
                                                    <img src={mp.post.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-9 rounded-lg bg-purple-900/40 flex items-center justify-center shrink-0">
                                                        <BookOpen size={14} className="text-purple-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">{mp.post.title}</p>
                                                    <p className="text-[10px] text-slate-400">{mp.post.author?.name || "Author"} · {mp.post.readTime ?? "5 min"}</p>
                                                </div>
                                                <button
                                                    onClick={() => removePostFromMag(mp.post.id)}
                                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors shrink-0"
                                                    title="Remove from magazine"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Published Posts */}
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <p className="text-xs font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                                    Add from Published Blog Articles
                                </p>

                                {allPosts.filter(p => !selectedPostIds.has(p.id)).length === 0 ? (
                                    <p className="text-slate-500 text-xs p-4 rounded-xl bg-white/[0.02] text-center">
                                        All available published articles are already included in this edition.
                                    </p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {allPosts.filter(p => !selectedPostIds.has(p.id)).map((post: any) => (
                                            <div key={post.id} className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 rounded-2xl transition-all">
                                                {post.coverImage ? (
                                                    <img src={post.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                                        <BookOpen size={14} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">{post.title}</p>
                                                    <p className="text-[10px] text-slate-500">{post.author?.name || "Author"} · {post.topic?.title || "Topic"}</p>
                                                </div>
                                                <button
                                                    onClick={() => addPostToMag(post.id)}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-aira-magenta to-pink-500 hover:brightness-110 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shrink-0 shadow-md shadow-pink-500/20"
                                                >
                                                    <Plus size={13} /> Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
