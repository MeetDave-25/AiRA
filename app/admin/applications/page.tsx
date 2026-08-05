"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
    Check, 
    X, 
    Mail, 
    Phone, 
    Search, 
    ShieldCheck, 
    UserCheck, 
    ExternalLink, 
    Copy, 
    Key, 
    Sparkles, 
    Trash2, 
    RefreshCw,
    Clock,
    Filter,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    AlertTriangle,
    CheckSquare,
    Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";

export default function ApplicationsPage() {
    const [apps, setApps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    
    // Delete single application modal state
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [cascadeDeleteUser, setCascadeDeleteUser] = useState(false);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    // Modal state for newly approved credentials
    const [approvedModalData, setApprovedModalData] = useState<{
        applicant: any;
        credentials?: {
            userCreated?: boolean;
            loginId?: string;
            password?: string;
            userId?: string;
            profileId?: string;
        };
    } | null>(null);

    const fetchApps = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/applications");
            const data = res.ok ? await res.json() : [];
            setApps(Array.isArray(data) ? data : []);
        } catch {
            setApps([]);
            toast.error("Failed to load applications.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handleUpdateStatus = async (app: any, status: "APPROVED" | "REJECTED" | "PENDING") => {
        setIsProcessing(app.id);
        try {
            const res = await fetch(`/api/applications/${app.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update application");

            if (status === "APPROVED") {
                toast.success(`${app.name} approved and registered in People!`);
                if (data.credentials) {
                    setApprovedModalData({
                        applicant: app,
                        credentials: data.credentials,
                    });
                }
            } else if (status === "REJECTED") {
                toast.success(`Marked application as rejected`);
            } else {
                toast.success(`Application marked as pending`);
            }

            await fetchApps();
        } catch (error: any) {
            toast.error(error?.message || "Status update failed");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDeleteSingle = async () => {
        if (!deleteTarget) return;
        setIsProcessing(deleteTarget.id);
        try {
            const query = cascadeDeleteUser ? "?deleteUser=true" : "";
            const res = await fetch(`/api/applications/${deleteTarget.id}${query}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete application");
            
            toast.success(cascadeDeleteUser 
                ? `Application and linked profile for ${deleteTarget.name} deleted` 
                : `Application for ${deleteTarget.name} deleted`
            );
            
            setDeleteTarget(null);
            setCascadeDeleteUser(false);
            setSelectedIds(prev => prev.filter(id => id !== deleteTarget.id));
            await fetchApps();
        } catch (error: any) {
            toast.error(error?.message || "Delete failed");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleting(true);
        try {
            for (const id of selectedIds) {
                await fetch(`/api/applications/${id}`, { method: "DELETE" });
            }
            toast.success(`Successfully deleted ${selectedIds.length} application(s)`);
            setSelectedIds([]);
            setShowBulkDeleteModal(false);
            await fetchApps();
        } catch (error: any) {
            toast.error("Failed to delete some applications");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const copyText = async (text: string, label: string) => {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const filteredApps = useMemo(() => {
        return apps.filter((app) => {
            const matchesStatus = filterStatus === "ALL" || (app.status || "PENDING") === filterStatus;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = 
                !q || 
                (app.name && app.name.toLowerCase().includes(q)) || 
                (app.email && app.email.toLowerCase().includes(q)) ||
                (app.interest && app.interest.toLowerCase().includes(q)) ||
                (app.message && app.message.toLowerCase().includes(q));
            return matchesStatus && matchesSearch;
        });
    }, [apps, filterStatus, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: apps.length,
            pending: apps.filter(a => (a.status || "PENDING") === "PENDING").length,
            approved: apps.filter(a => a.status === "APPROVED").length,
            rejected: apps.filter(a => a.status === "REJECTED").length,
        };
    }, [apps]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredApps.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredApps.map(a => a.id));
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-60 h-60 bg-aira-purple/10 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-2xl border border-white/5 animated-border">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">Join Applications</h1>
                        <p className="text-slate-400 text-sm mt-1">Review, accept, or delete applicant submissions. Accepted applicants auto-register into People.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchApps}
                            className="p-2.5 rounded-xl glass border border-white/10 text-slate-300 hover:text-aira-cyan hover:border-aira-cyan/30 transition-all flex items-center gap-2 text-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin text-aira-cyan" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-aira-cyan/15 border border-aira-cyan/30 text-aira-cyan text-sm font-semibold hover:bg-aira-cyan/25 transition-all"
                        >
                            <UserCheck size={16} /> View People & Users
                        </Link>
                    </div>
                </div>

                {/* Stats & Filters Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <button
                        onClick={() => setFilterStatus("ALL")}
                        className={`p-3 rounded-xl border text-left transition-all ${filterStatus === "ALL" ? "bg-white/10 border-white/30 shadow-md shadow-black/40" : "bg-slate-900/40 border-white/5 hover:border-white/15"}`}
                    >
                        <p className="text-xs text-slate-400 font-medium">All Applications</p>
                        <p className="text-xl font-bold font-orbitron text-white mt-1">{stats.total}</p>
                    </button>
                    <button
                        onClick={() => setFilterStatus("PENDING")}
                        className={`p-3 rounded-xl border text-left transition-all ${filterStatus === "PENDING" ? "bg-aira-gold/15 border-aira-gold/40 shadow-md shadow-aira-gold/10" : "bg-slate-900/40 border-white/5 hover:border-white/15"}`}
                    >
                        <p className="text-xs text-amber-300/80 font-medium flex items-center gap-1.5"><Clock size={13} /> Pending</p>
                        <p className="text-xl font-bold font-orbitron text-amber-300 mt-1">{stats.pending}</p>
                    </button>
                    <button
                        onClick={() => setFilterStatus("APPROVED")}
                        className={`p-3 rounded-xl border text-left transition-all ${filterStatus === "APPROVED" ? "bg-emerald-500/15 border-emerald-500/40 shadow-md shadow-emerald-500/10" : "bg-slate-900/40 border-white/5 hover:border-white/15"}`}
                    >
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 size={13} /> Accepted / Registered</p>
                        <p className="text-xl font-bold font-orbitron text-emerald-400 mt-1">{stats.approved}</p>
                    </button>
                    <button
                        onClick={() => setFilterStatus("REJECTED")}
                        className={`p-3 rounded-xl border text-left transition-all ${filterStatus === "REJECTED" ? "bg-aira-magenta/15 border-aira-magenta/40 shadow-md shadow-aira-magenta/10" : "bg-slate-900/40 border-white/5 hover:border-white/15"}`}
                    >
                        <p className="text-xs text-aira-magenta font-medium flex items-center gap-1.5"><XCircle size={13} /> Rejected</p>
                        <p className="text-xl font-bold font-orbitron text-aira-magenta mt-1">{stats.rejected}</p>
                    </button>
                </div>

                {/* Search & Bulk Bar */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by applicant name, email, domain, or message..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-500 text-sm outline-none focus:border-aira-cyan/50 transition-colors"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">
                                Clear
                            </button>
                        )}
                    </div>

                    {filteredApps.length > 0 && (
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <button
                                onClick={toggleSelectAll}
                                className="px-3 py-2 rounded-xl glass border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-2 transition-colors"
                            >
                                {selectedIds.length === filteredApps.length ? (
                                    <>
                                        <CheckSquare size={14} className="text-aira-cyan" /> Deselect All
                                    </>
                                ) : (
                                    <>
                                        <Square size={14} className="text-slate-400" /> Select All ({filteredApps.length})
                                    </>
                                )}
                            </button>

                            {selectedIds.length > 0 && (
                                <button
                                    onClick={() => setShowBulkDeleteModal(true)}
                                    className="px-3.5 py-2 rounded-xl bg-aira-magenta/20 border border-aira-magenta/40 text-aira-magenta hover:bg-aira-magenta/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Applications List */}
            <div className="space-y-4">
                {isLoading && (
                    <div className="glass p-12 rounded-2xl border border-white/5 text-center">
                        <RefreshCw size={28} className="animate-spin text-aira-cyan mx-auto mb-3" />
                        <p className="text-slate-300">Loading applications...</p>
                    </div>
                )}

                {!isLoading && filteredApps.length === 0 && (
                    <div className="glass p-12 rounded-2xl border border-white/5 text-center space-y-3">
                        <p className="text-slate-400 text-base">No applications found matching your current filter.</p>
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="px-4 py-2 rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/10 text-sm">
                                Clear Search Filter
                            </button>
                        )}
                    </div>
                )}

                {!isLoading && filteredApps.map((app, idx) => {
                    const status = app.status || "PENDING";
                    const isApproved = status === "APPROVED";
                    const isRejected = status === "REJECTED";
                    const isPending = status === "PENDING";
                    const isSelected = selectedIds.includes(app.id);

                    return (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`glass rounded-2xl border p-5 sm:p-6 transition-all ${
                                isSelected
                                    ? "border-aira-cyan/60 bg-aira-cyan/5 ring-1 ring-aira-cyan/30"
                                    : isApproved 
                                        ? "border-emerald-500/30 bg-emerald-950/10" 
                                        : isRejected 
                                            ? "border-aira-magenta/20 bg-aira-magenta/5 opacity-80" 
                                            : "border-white/10 hover:border-aira-cyan/30"
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Selection checkbox */}
                                    <button
                                        onClick={() => toggleSelect(app.id)}
                                        className="mt-1 p-1 text-slate-400 hover:text-aira-cyan transition-colors"
                                        title={isSelected ? "Deselect" : "Select"}
                                    >
                                        {isSelected ? (
                                            <CheckSquare size={18} className="text-aira-cyan" />
                                        ) : (
                                            <Square size={18} className="text-slate-600 hover:text-slate-400" />
                                        )}
                                    </button>

                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="font-orbitron font-bold text-lg text-white truncate">{app.name}</h3>
                                            
                                            {/* Status Badge */}
                                            {isApproved && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                                    <CheckCircle2 size={13} /> Accepted & Registered in People
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                    <Clock size={13} /> Pending Review
                                                </span>
                                            )}
                                            {isRejected && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-aira-magenta/20 text-aira-magenta border border-aira-magenta/40">
                                                    <XCircle size={13} /> Rejected
                                                </span>
                                            )}

                                            {app.interest && (
                                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium border border-aira-cyan/30 bg-aira-cyan/10 text-aira-cyan">
                                                    {app.interest}
                                                </span>
                                            )}
                                        </div>

                                        {/* Contact Details */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                                            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-aira-cyan text-slate-300 hover:underline">
                                                <Mail size={13} className="text-aira-cyan" /> {app.email}
                                            </a>
                                            {app.phone && (
                                                <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-aira-cyan text-slate-300">
                                                    <Phone size={13} className="text-emerald-400" /> {app.phone}
                                                </a>
                                            )}
                                            <span className="text-slate-500">
                                                Applied {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Applicant Statement */}
                                        {app.message && (
                                            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                                                <span className="text-slate-500 block text-[11px] mb-1 font-semibold uppercase tracking-wider">Statement / Why AiRA:</span>
                                                "{app.message}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 lg:w-48 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                                    {isPending && (
                                        <>
                                            <button
                                                disabled={isProcessing === app.id}
                                                onClick={() => handleUpdateStatus(app, "APPROVED")}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl text-xs hover:scale-105 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                            >
                                                <Check size={15} /> Accept & Register
                                            </button>
                                            <button
                                                disabled={isProcessing === app.id}
                                                onClick={() => handleUpdateStatus(app, "REJECTED")}
                                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-aira-magenta/40 text-aira-magenta hover:bg-aira-magenta/10 text-xs transition-colors disabled:opacity-50"
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        </>
                                    )}

                                    {isApproved && (
                                        <>
                                            <Link
                                                href="/admin/users"
                                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-aira-cyan/15 border border-aira-cyan/40 text-aira-cyan hover:bg-aira-cyan/25 text-xs font-semibold transition-all text-center"
                                            >
                                                <UserCheck size={14} /> Edit User Account <ArrowUpRight size={13} />
                                            </Link>
                                            <Link
                                                href="/admin/team-members"
                                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-aira-purple/15 border border-aira-purple/40 text-violet-300 hover:bg-aira-purple/25 text-xs font-medium transition-all text-center"
                                            >
                                                <Sparkles size={13} /> Edit Public Profile <ArrowUpRight size={13} />
                                            </Link>
                                            <button
                                                onClick={() => handleUpdateStatus(app, "PENDING")}
                                                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors text-center py-1"
                                            >
                                                Mark as Pending
                                            </button>
                                        </>
                                    )}

                                    {isRejected && (
                                        <>
                                            <button
                                                disabled={isProcessing === app.id}
                                                onClick={() => handleUpdateStatus(app, "APPROVED")}
                                                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition-all"
                                            >
                                                <Check size={14} /> Accept & Register
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(app, "PENDING")}
                                                className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors text-center py-1"
                                            >
                                                Restore to Pending
                                            </button>
                                        </>
                                    )}

                                    {/* Prominent Delete Button */}
                                    <button
                                        onClick={() => {
                                            setDeleteTarget(app);
                                            setCascadeDeleteUser(isApproved);
                                        }}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors font-medium mt-1"
                                        title="Delete Application"
                                    >
                                        <Trash2 size={14} /> Delete Application
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ══ Approval & Registration Celebration Modal ══ */}
            <AnimatedModal
                open={!!approvedModalData}
                onClose={() => setApprovedModalData(null)}
                title="Applicant Accepted & Registered 🎉"
                subtitle="Login credentials provisioned and welcome dispatch initiated from info@aira-lab.in"
                size="lg"
                footer={
                    <div className="flex flex-wrap justify-between items-center w-full gap-3">
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-aira-cyan text-slate-950 font-semibold text-xs hover:scale-105 transition-transform"
                        >
                            <UserCheck size={15} /> Go to User Accounts (Manage Roles)
                        </Link>
                        <button
                            onClick={() => setApprovedModalData(null)}
                            className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 text-xs"
                        >
                            Done
                        </button>
                    </div>
                }
            >
                {approvedModalData && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                            <p className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 size={16} /> {approvedModalData.applicant.name} is now an active member!
                            </p>
                            <p className="text-xs text-slate-300">
                                User account has been registered, in-app welcome notification sent, and member card created in <strong>People Profiles</strong>.
                            </p>
                        </div>

                        {approvedModalData.credentials?.userCreated && approvedModalData.credentials.password ? (
                            <div className="rounded-2xl border border-aira-gold/40 bg-aira-gold/10 p-4 sm:p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-aira-gold font-bold flex items-center gap-1.5">
                                        <Key size={14} /> Member Portal Credentials
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">From: info@aira-lab.in</span>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 w-24">Portal URL:</span>
                                        <code className="flex-1 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-aira-cyan border border-white/10 font-mono truncate">
                                            {typeof window !== "undefined" ? `${window.location.origin}/portal/login` : "https://aira-lab.in/portal/login"}
                                        </code>
                                        <button
                                            onClick={() => copyText(typeof window !== "undefined" ? `${window.location.origin}/portal/login` : "https://aira-lab.in/portal/login", "Portal URL")}
                                            className="p-1.5 rounded-lg border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                            title="Copy Portal URL"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 w-24">Login ID:</span>
                                        <code className="flex-1 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200 border border-white/10 font-mono truncate">
                                            {approvedModalData.credentials.loginId}
                                        </code>
                                        <button
                                            onClick={() => copyText(approvedModalData.credentials?.loginId || "", "Login ID")}
                                            className="p-1.5 rounded-lg border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                            title="Copy Login ID"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 w-24">Temp Password:</span>
                                        <code className="flex-1 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs text-amber-300 border border-white/10 font-mono font-bold">
                                            {approvedModalData.credentials.password}
                                        </code>
                                        <button
                                            onClick={() => copyText(approvedModalData.credentials?.password || "", "Password")}
                                            className="p-1.5 rounded-lg border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/10"
                                            title="Copy Password"
                                        >
                                            <Copy size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    <a
                                        href={`mailto:${encodeURIComponent(approvedModalData.applicant.email)}?subject=${encodeURIComponent(`🎉 Welcome to AiRA Labs! Your Portal Login Credentials`)}&body=${encodeURIComponent(
                                            `Welcome to AiRA Labs! 🎉\n\nDear ${approvedModalData.applicant.name},\n\nYour application has been accepted!\n\nPortal URL: ${typeof window !== "undefined" ? window.location.origin : "https://aira-lab.in"}/portal/login\nLogin ID: ${approvedModalData.credentials.loginId}\nPassword: ${approvedModalData.credentials.password}\n\nPlease log in and update your password in Settings.\n\nBest regards,\nAiRA Labs Team\ninfo@aira-lab.in`
                                        )}`}
                                        className="py-2.5 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Mail size={14} /> Send via Email Client
                                    </a>

                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(
                                            `🎉 Welcome to AiRA Labs, ${approvedModalData.applicant.name}!\n\nYour application has been accepted!\n\nPortal URL: ${typeof window !== "undefined" ? window.location.origin : "https://aira-lab.in"}/portal/login\nLogin ID: ${approvedModalData.credentials.loginId}\nPassword: ${approvedModalData.credentials.password}\n\nPlease log in and update your password in Settings.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <ExternalLink size={14} /> Share on WhatsApp
                                    </a>

                                    <button
                                        onClick={() => copyText(
                                            `Welcome to AiRA Labs! 🎉\n\nDear ${approvedModalData.applicant.name},\nYour application has been accepted!\n\nPortal Login URL: ${typeof window !== "undefined" ? window.location.origin : "https://aira-lab.in"}/portal/login\nLogin ID: ${approvedModalData.credentials?.loginId}\nPassword: ${approvedModalData.credentials?.password}\n\nPlease log in and change your password in Settings.\n\nBest regards,\nAiRA Labs Team\ninfo@aira-lab.in`,
                                            "Welcome credentials message"
                                        )}
                                        className="sm:col-span-2 py-2.5 px-3 rounded-xl border border-aira-gold/40 text-aira-gold hover:bg-aira-gold/15 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Copy size={14} /> Copy Full Welcome & Credentials Message
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-slate-300">
                                ℹ️ Existing account was found with this email ({approvedModalData.applicant.email}). Profile has been linked and updated.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/admin/users"
                                className="p-3 rounded-xl border border-white/10 bg-slate-900/40 hover:border-aira-cyan/40 hover:bg-aira-cyan/5 transition-all text-left group"
                            >
                                <p className="text-xs text-aira-cyan font-semibold flex items-center justify-between">
                                    Edit in User Accounts <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">Change their system role (Admin, Team Lead, Manager) or reset password.</p>
                            </Link>

                            <Link
                                href="/admin/team-members"
                                className="p-3 rounded-xl border border-white/10 bg-slate-900/40 hover:border-aira-purple/40 hover:bg-aira-purple/5 transition-all text-left group"
                            >
                                <p className="text-xs text-violet-300 font-semibold flex items-center justify-between">
                                    Edit Public Team Profile <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">Upload their photo, edit their bio and showcase title for the About orbit.</p>
                            </Link>
                        </div>
                    </div>
                )}
            </AnimatedModal>

            {/* ══ Delete Single Application Modal ══ */}
            <AnimatedModal
                open={!!deleteTarget}
                onClose={() => {
                    setDeleteTarget(null);
                    setCascadeDeleteUser(false);
                }}
                title="Delete Application"
                subtitle="Are you sure you want to remove this application?"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setDeleteTarget(null);
                                setCascadeDeleteUser(false);
                            }}
                            className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isProcessing === deleteTarget?.id}
                            onClick={handleDeleteSingle}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Trash2 size={14} />
                            {isProcessing === deleteTarget?.id ? "Deleting..." : "Delete Application"}
                        </button>
                    </div>
                }
            >
                {deleteTarget && (
                    <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-1">
                            <p className="font-semibold text-white text-sm">{deleteTarget.name}</p>
                            <p className="text-slate-400">{deleteTarget.email}</p>
                            {deleteTarget.interest && (
                                <p className="text-aira-cyan text-[11px]">Domain: {deleteTarget.interest}</p>
                            )}
                        </div>

                        {deleteTarget.status === "APPROVED" && (
                            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-xs text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={cascadeDeleteUser}
                                    onChange={(e) => setCascadeDeleteUser(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded accent-red-500"
                                />
                                <div>
                                    <span className="font-semibold text-red-300 block">Also remove associated User Account & Public Profile</span>
                                    <span className="text-[11px] text-slate-400">
                                        Check this if you want to completely wipe the login account and team card created when this application was approved.
                                    </span>
                                </div>
                            </label>
                        )}

                        <p className="text-xs text-slate-400">
                            This action will permanently delete the application record from the database.
                        </p>
                    </div>
                )}
            </AnimatedModal>

            {/* ══ Bulk Delete Modal ══ */}
            <AnimatedModal
                open={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                title="Bulk Delete Applications"
                subtitle={`You have selected ${selectedIds.length} application(s) for deletion.`}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowBulkDeleteModal(false)}
                            className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isBulkDeleting}
                            onClick={handleBulkDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <Trash2 size={14} />
                            {isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.length} Applications`}
                        </button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span>Are you sure you want to permanently remove {selectedIds.length} application(s)? This action cannot be undone.</span>
                    </div>
                </div>
            </AnimatedModal>
        </div>
    );
}
