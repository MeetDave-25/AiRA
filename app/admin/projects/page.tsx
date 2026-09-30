"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Star, Heart, ExternalLink, Github, Trash2,
    CheckCircle2, XCircle, Eye, Sparkles, RefreshCw,
    Filter, Clock, Layers, AlertTriangle, Check, X,
    ChevronDown, Globe, BarChart3, Bot
} from "lucide-react";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";

const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    PENDING:   "bg-amber-500/20  text-amber-300  border-amber-500/40",
    REJECTED:  "bg-rose-500/20   text-rose-300   border-rose-500/40",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    PUBLISHED: <CheckCircle2 size={12} />,
    PENDING:   <Clock size={12} />,
    REJECTED:  <XCircle size={12} />,
};

type FilterStatus = "ALL" | "PENDING" | "PUBLISHED" | "REJECTED";

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("ALL");
    const [processing, setProcessing] = useState<string | null>(null);

    // Delete modal
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Reject modal
    const [rejectTarget, setRejectTarget] = useState<any | null>(null);
    const [rejecting, setRejecting] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/projects");
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load projects");
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const filtered = useMemo(() => {
        return projects.filter((p) => {
            const matchFilter = filter === "ALL" || p.status === filter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                (p.title || "").toLowerCase().includes(q) ||
                (p.authorName || "").toLowerCase().includes(q) ||
                (p.category || "").toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });
    }, [projects, filter, search]);

    const counts = useMemo(() => ({
        ALL:       projects.length,
        PENDING:   projects.filter(p => p.status === "PENDING").length,
        PUBLISHED: projects.filter(p => p.status === "PUBLISHED").length,
        REJECTED:  projects.filter(p => p.status === "REJECTED").length,
    }), [projects]);

    // ─── Actions ──────────────────────────────────────────────────────────────

    const updateStatus = async (id: string, status: string, label: string) => {
        setProcessing(id + status);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
            toast.success(`Project ${label}!`);
        } catch {
            toast.error(`Failed to ${label.toLowerCase()} project`);
        } finally {
            setProcessing(null);
        }
    };

    const toggleFeatured = async (project: any) => {
        const next = !project.featured;
        setProcessing(project.id + "feat");
        try {
            const res = await fetch(`/api/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featured: next }),
            });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, featured: next } : p));
            toast.success(next ? "⭐ Marked as Featured!" : "Removed from Featured");
        } catch {
            toast.error("Failed to update featured status");
        } finally {
            setProcessing(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
            toast.success("Project deleted.");
            setDeleteTarget(null);
        } catch {
            toast.error("Failed to delete project");
        } finally {
            setDeleting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectTarget) return;
        setRejecting(true);
        await updateStatus(rejectTarget.id, "REJECTED", "Rejected");
        setRejecting(false);
        setRejectTarget(null);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-aira-cyan font-orbitron text-xs tracking-widest uppercase mb-1">Admin Panel</p>
                    <h1 className="font-orbitron font-black text-3xl text-white">
                        Project <span className="gradient-text">Moderation</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Approve, reject, feature, or remove community-submitted projects.
                    </p>
                </div>
                <button
                    onClick={fetchProjects}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/15 text-slate-300 hover:text-white hover:border-aira-cyan/40 transition-all text-sm font-medium"
                >
                    <RefreshCw size={15} className={loading ? "animate-spin text-aira-cyan" : ""} />
                    Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(["ALL", "PENDING", "PUBLISHED", "REJECTED"] as FilterStatus[]).map((s) => (
                    <motion.button
                        key={s}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFilter(s)}
                        className={`glass rounded-2xl p-4 border text-left transition-all ${
                            filter === s
                                ? "border-aira-cyan/60 bg-aira-cyan/10 shadow-lg shadow-aira-cyan/10"
                                : "border-white/10 hover:border-white/25"
                        }`}
                    >
                        <p className={`font-orbitron font-black text-2xl mb-0.5 ${
                            s === "PENDING" ? "text-amber-400" :
                            s === "PUBLISHED" ? "text-emerald-400" :
                            s === "REJECTED" ? "text-rose-400" :
                            "text-aira-cyan"
                        }`}>{counts[s]}</p>
                        <p className="text-slate-400 text-xs font-medium capitalize">{s === "ALL" ? "Total" : s.toLowerCase()}</p>
                    </motion.button>
                ))}
            </div>

            {/* Search + Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by title, author, or category…"
                        className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(["ALL", "PENDING", "PUBLISHED", "REJECTED"] as FilterStatus[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold capitalize transition-all border ${
                                filter === s
                                    ? "bg-aira-cyan text-aira-bg border-aira-cyan"
                                    : "glass border-white/15 text-slate-300 hover:border-white/30"
                            }`}
                        >
                            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                            <span className="ml-1.5 opacity-70">({counts[s]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Table */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="glass rounded-2xl h-24 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass rounded-3xl border border-white/10 p-16 text-center">
                    <Bot size={48} className="mx-auto mb-4 text-aira-cyan/30" />
                    <p className="font-orbitron font-bold text-white text-lg">No projects found</p>
                    <p className="text-slate-400 text-sm mt-1">
                        {filter !== "ALL" ? `No ${filter.toLowerCase()} projects.` : "No projects submitted yet."}
                    </p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                >
                    {filtered.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                            className="glass rounded-2xl border border-white/10 hover:border-white/20 transition-all p-5 group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Cover thumbnail */}
                                <div className="w-full sm:w-24 h-24 sm:h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                                    {project.coverImage ? (
                                        <img
                                            src={project.coverImage}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                            onError={e => { (e.target as HTMLImageElement).src = ""; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-aira-cyan/30">
                                            <Layers size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        {/* Status badge */}
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-orbitron font-bold ${STATUS_COLORS[project.status] || STATUS_COLORS.PENDING}`}>
                                            {STATUS_ICONS[project.status]}
                                            {project.status}
                                        </span>
                                        {/* Featured badge */}
                                        {project.featured && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-orbitron font-bold">
                                                <Star size={10} fill="currentColor" /> FEATURED
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded-full border border-white/10">
                                            {project.category}
                                        </span>
                                    </div>

                                    <h3 className="font-orbitron font-bold text-white text-sm group-hover:text-aira-cyan transition-colors truncate">
                                        {project.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                                        {project.tagline || project.description?.slice(0, 100)}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full bg-aira-cyan/20 inline-flex items-center justify-center text-[9px] font-bold text-aira-cyan">
                                                {project.authorName?.[0]?.toUpperCase() || "?"}
                                            </span>
                                            {project.authorName || "Anonymous"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart size={10} className="text-pink-400" />
                                            {project.likes || 0} likes
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={10} className="text-amber-400" />
                                            {project.reviewCount || project.reviews?.length || 0} reviews
                                        </span>
                                        <span>{new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-row sm:flex-col gap-2 sm:items-end shrink-0">
                                    {/* Approve */}
                                    {project.status !== "PUBLISHED" && (
                                        <button
                                            onClick={() => updateStatus(project.id, "PUBLISHED", "Approved")}
                                            disabled={processing === project.id + "PUBLISHED"}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 text-xs font-orbitron font-bold transition-all disabled:opacity-50"
                                        >
                                            <Check size={13} />
                                            {processing === project.id + "PUBLISHED" ? "…" : "Approve"}
                                        </button>
                                    )}
                                    {/* Reject */}
                                    {project.status !== "REJECTED" && (
                                        <button
                                            onClick={() => setRejectTarget(project)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-300 text-xs font-orbitron font-bold transition-all"
                                        >
                                            <X size={13} />
                                            Reject
                                        </button>
                                    )}
                                    {/* Feature toggle */}
                                    <button
                                        onClick={() => toggleFeatured(project)}
                                        disabled={processing === project.id + "feat"}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-orbitron font-bold border transition-all disabled:opacity-50 ${
                                            project.featured
                                                ? "bg-amber-400/20 border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
                                                : "glass border-white/15 text-slate-400 hover:border-amber-400/40 hover:text-amber-300"
                                        }`}
                                        title={project.featured ? "Unfeature" : "Mark as Featured"}
                                    >
                                        <Star size={13} fill={project.featured ? "currentColor" : "none"} />
                                        {project.featured ? "Featured" : "Feature"}
                                    </button>

                                    {/* View + Delete row */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            target="_blank"
                                            className="p-2 rounded-xl glass border border-white/15 text-slate-400 hover:text-aira-cyan hover:border-aira-cyan/40 transition-all"
                                            title="View public project page"
                                        >
                                            <Eye size={14} />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteTarget(project)}
                                            className="p-2 rounded-xl glass border border-white/15 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                                            title="Delete project"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* ── DELETE CONFIRMATION MODAL ── */}
            <AnimatedModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Project"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                        <AlertTriangle size={20} className="text-rose-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-white">This action is irreversible</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                All reviews and likes for <strong className="text-white">"{deleteTarget?.title}"</strong> will be permanently deleted.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="flex-1 py-2.5 rounded-xl glass border border-white/15 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 py-2.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/40 border border-rose-500/50 text-rose-300 text-sm font-orbitron font-bold transition-all disabled:opacity-50"
                        >
                            {deleting ? "Deleting…" : "Delete Project"}
                        </button>
                    </div>
                </div>
            </AnimatedModal>

            {/* ── REJECT CONFIRMATION MODAL ── */}
            <AnimatedModal
                open={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                title="Reject Project"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-300">
                        Reject <strong className="text-white">"{rejectTarget?.title}"</strong>? The project will be hidden from public view but not deleted.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setRejectTarget(null)}
                            className="flex-1 py-2.5 rounded-xl glass border border-white/15 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={rejecting}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 text-sm font-orbitron font-bold transition-all disabled:opacity-50"
                        >
                            {rejecting ? "Rejecting…" : "Reject Project"}
                        </button>
                    </div>
                </div>
            </AnimatedModal>
        </div>
    );
}
