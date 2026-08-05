"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
    Crown, 
    Edit2, 
    Plus, 
    Trash2, 
    UploadCloud, 
    Shield, 
    ArrowRight,
    ExternalLink,
    Search,
    Users,
    Sparkles,
    Linkedin,
    Github,
    Eye,
    Check,
    RefreshCw,
    Database,
    AlertCircle,
    X,
    FileText,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";
import { uploadDirectFile } from "@/lib/upload-client";

type MemberForm = {
    name: string;
    role: string;
    bio: string;
    photo: string;
    linkedin: string;
    github: string;
    teamGroup: string;
    sortOrder: string;
    isPresident: boolean;
};

const MAX_BIO_WORDS = 500;
const MAX_BIO_CHARS = 3000;

const baseLeaderForm: MemberForm = {
    name: "",
    role: "Founder & Lead Architect",
    bio: "",
    photo: "",
    linkedin: "",
    github: "",
    teamGroup: "Founders & Executive Board",
    sortOrder: "1",
    isPresident: true,
};

const baseMemberForm: MemberForm = {
    name: "",
    role: "Robotics & AI Researcher",
    bio: "",
    photo: "",
    linkedin: "",
    github: "",
    teamGroup: "AI & Software Division",
    sortOrder: "10",
    isPresident: false,
};

const LEADERSHIP_GROUPS = [
    "Founders & Executive Board",
    "Technical Leads",
    "Chief Advisors & Mentors",
    "Domain Directors",
];

const PEOPLE_GROUPS = [
    "Robotics Division",
    "AI & Software Division",
    "Hardware & Embedded Systems",
    "Research Associates",
    "Core Team",
];

export default function TeamMembersAdminPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"LEADERSHIP" | "PEOPLE">("LEADERSHIP");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState<MemberForm>(baseLeaderForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSeeding, setIsSeeding] = useState(false);

    const fetchMembers = async () => {
        setIsLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch("/api/team-members", { signal: controller.signal });
            const data = res.ok ? await res.json() : [];
            setMembers(Array.isArray(data) ? data : []);
        } catch {
            setMembers([]);
            toast.error("Could not load profiles. Please refresh.");
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchMembers();
    }, []);

    // Bio word & character count calculations
    const bioWordCount = useMemo(() => {
        const trimmed = (form.bio || "").trim();
        return trimmed ? trimmed.split(/\s+/).length : 0;
    }, [form.bio]);

    const isBioOverLimit = bioWordCount > MAX_BIO_WORDS || (form.bio || "").length > MAX_BIO_CHARS;

    // Split profiles into Leadership vs People (About Us)
    const leadersList = useMemo(() => {
        return members.filter((m) => {
            const grp = (m.teamGroup || "").toLowerCase();
            return (
                m.isPresident === true ||
                grp.includes("founder") ||
                grp.includes("executive") ||
                grp.includes("director") ||
                grp.includes("advisor") ||
                grp.includes("mentor") ||
                grp.includes("lead")
            );
        });
    }, [members]);

    const peopleList = useMemo(() => {
        return members.filter((m) => {
            const grp = (m.teamGroup || "").toLowerCase();
            const isLead = (
                m.isPresident === true ||
                grp.includes("founder") ||
                grp.includes("executive") ||
                grp.includes("director") ||
                grp.includes("advisor") ||
                grp.includes("mentor") ||
                grp.includes("lead")
            );
            return !isLead;
        });
    }, [members]);

    const openCreateLeader = () => {
        setForm(baseLeaderForm);
        setEditing(null);
        setIsCreateOpen(true);
    };

    const openCreateMember = () => {
        setForm(baseMemberForm);
        setEditing(null);
        setIsCreateOpen(true);
    };

    const openEdit = (member: any) => {
        setEditing(member);
        setForm({
            name: member.name || "",
            role: member.role || "Member",
            bio: member.bio || "",
            photo: member.photo || "",
            linkedin: member.linkedin || "",
            github: member.github || "",
            teamGroup: member.teamGroup || (member.isPresident ? "Founders & Executive Board" : "Core Team"),
            sortOrder: String(member.sortOrder || 0),
            isPresident: Boolean(member.isPresident),
        });
    };

    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        toast.loading("Uploading profile photo...", { id: "photo-upload" });
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "leadership" });
            setForm((prev) => ({ ...prev, photo: uploaded.url || prev.photo }));
            toast.success("Photo uploaded successfully!", { id: "photo-upload" });
        } catch (error: any) {
            toast.error(error?.message || "Photo upload failed", { id: "photo-upload" });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = form.name.trim();
        if (!trimmedName) {
            toast.error("Please enter a name for the profile");
            return;
        }

        if (bioWordCount > MAX_BIO_WORDS) {
            toast.error(`Bio exceeds ${MAX_BIO_WORDS} words (currently ${bioWordCount} words). Please shorten it.`);
            return;
        }

        if ((form.bio || "").length > MAX_BIO_CHARS) {
            toast.error(`Bio statement exceeds maximum character limit (${MAX_BIO_CHARS} characters).`);
            return;
        }

        setIsSubmitting(true);
        try {
            const endpoint = editing ? `/api/team-members/${editing.id}` : "/api/team-members";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    name: trimmedName,
                    bio: form.bio.trim(),
                    teamGroup: form.teamGroup.trim()
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Operation failed");
            }

            toast.success(editing ? "Profile updated successfully!" : "New profile created!");
            setIsCreateOpen(false);
            setEditing(null);
            await fetchMembers();
        } catch (error: any) {
            toast.error(error?.message || "Failed to save profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/team-members/${deleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Profile permanently deleted");
            setDeleteId(null);
            await fetchMembers();
        } catch {
            toast.error("Failed to delete profile");
        }
    };

    const handleSeedProfiles = async () => {
        setIsSeeding(true);
        toast.loading("Seeding starter leadership and team profiles...", { id: "seed" });
        try {
            const res = await fetch("/api/team-members/seed", { method: "POST" });
            if (!res.ok) throw new Error();
            toast.success("Starter profiles added successfully!", { id: "seed" });
            await fetchMembers();
        } catch {
            toast.error("Failed to seed starter profiles", { id: "seed" });
        } finally {
            setIsSeeding(false);
        }
    };

    const currentList = activeTab === "LEADERSHIP" ? leadersList : peopleList;

    const displayedMembers = useMemo(() => {
        if (!searchQuery.trim()) return currentList;
        const q = searchQuery.toLowerCase();
        return currentList.filter(
            (m) =>
                (m.name || "").toLowerCase().includes(q) ||
                (m.role || "").toLowerCase().includes(q) ||
                (m.teamGroup || "").toLowerCase().includes(q) ||
                (m.bio || "").toLowerCase().includes(q)
        );
    }, [currentList, searchQuery]);

    const isModalOpen = isCreateOpen || Boolean(editing);

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-4 sm:p-6 rounded-3xl border border-white/10">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-aira-cyan/20 text-aira-cyan border border-aira-cyan/30">
                            <Crown size={20} />
                        </span>
                        <h1 className="font-orbitron font-bold text-xl sm:text-2xl md:text-3xl gradient-text-cyan">
                            Leadership & People Manager
                        </h1>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        Easily add, edit pictures, update bios, and remove Leaders (shown on <strong className="text-amber-400">/leadership</strong>) and People (shown on <strong className="text-aira-cyan">/about</strong>).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {members.length === 0 && (
                        <button
                            onClick={handleSeedProfiles}
                            disabled={isSeeding}
                            className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-all"
                        >
                            <Database size={14} /> Seed Starter Profiles
                        </button>
                    )}
                    <Link
                        href={activeTab === "LEADERSHIP" ? "/leadership" : "/about"}
                        target="_blank"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs flex items-center gap-1.5 transition-all"
                    >
                        <Eye size={15} className="text-aira-cyan" /> Preview {activeTab === "LEADERSHIP" ? "Leadership" : "About Us"}
                    </Link>
                    <button
                        onClick={activeTab === "LEADERSHIP" ? openCreateLeader : openCreateMember}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-orbitron font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/20"
                    >
                        <Plus size={16} /> Add {activeTab === "LEADERSHIP" ? "Leader" : "Team Member"}
                    </button>
                </div>
            </div>

            {/* Top Navigation Tabs: Leadership vs People */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl glass border border-white/10 w-full sm:w-fit">
                <button
                    onClick={() => setActiveTab("LEADERSHIP")}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${
                        activeTab === "LEADERSHIP"
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    <Crown size={15} />
                    Leadership & Founders ({leadersList.length})
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-sans font-normal hidden sm:inline">Shows on /leadership</span>
                </button>

                <button
                    onClick={() => setActiveTab("PEOPLE")}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${
                        activeTab === "PEOPLE"
                            ? "bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 shadow-lg shadow-aira-cyan/25"
                            : "text-slate-400 hover:text-white"
                    }`}
                >
                    <Users size={15} />
                    People & Lab Members ({peopleList.length})
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-sans font-normal hidden sm:inline">Shows on /about</span>
                </button>
            </div>

            {/* Search Bar & Counter */}
            <div className="glass p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab === "LEADERSHIP" ? "leaders" : "members"} by name, role, division...`}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-aira-cyan placeholder:text-slate-500"
                    />
                </div>

                <div className="text-xs text-slate-400 sm:pr-2">
                    Showing <strong className="text-white">{displayedMembers.length}</strong> {activeTab === "LEADERSHIP" ? "Leaders" : "Team Members"}
                </div>
            </div>

            {/* Cards Grid */}
            {isLoading ? (
                <div className="text-center py-16 text-slate-400 text-sm flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-aira-cyan" /> Loading profiles from database...
                </div>
            ) : displayedMembers.length === 0 ? (
                <div className="glass p-8 sm:p-12 rounded-3xl border border-white/10 text-center space-y-4">
                    {activeTab === "LEADERSHIP" ? (
                        <Crown size={40} className="mx-auto text-amber-500/60" />
                    ) : (
                        <Users size={40} className="mx-auto text-aira-cyan/60" />
                    )}
                    <h3 className="font-orbitron font-bold text-base text-white">
                        No {activeTab === "LEADERSHIP" ? "Leaders" : "Team Members"} Found
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                        {members.length === 0 
                            ? "Your database doesn't have any profiles yet. Click below to add one or seed initial starter profiles."
                            : `No profiles match your search criteria in the ${activeTab === "LEADERSHIP" ? "Leadership" : "People"} category.`
                        }
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        {members.length === 0 && (
                            <button
                                onClick={handleSeedProfiles}
                                className="px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all"
                            >
                                ⚡ Seed Starter Profiles
                            </button>
                        )}
                        <button
                            onClick={activeTab === "LEADERSHIP" ? openCreateLeader : openCreateMember}
                            className="px-5 py-2.5 rounded-xl bg-aira-cyan text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Plus size={16} /> Add {activeTab === "LEADERSHIP" ? "Leader" : "Team Member"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayedMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass p-5 sm:p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 sm:space-y-5 group relative ${
                                member.isPresident
                                    ? "border-amber-400/40 shadow-lg shadow-amber-500/10"
                                    : "border-white/10 hover:border-aira-cyan/40"
                            }`}
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                                {member.isPresident ? (
                                    <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1">
                                        <Crown size={12} className="text-amber-400" /> Executive / Founder
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-medium border border-white/5">
                                        Sort #{member.sortOrder || 0}
                                    </span>
                                )}

                                <div className="flex items-center gap-1.5 opacity-90 sm:opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(member)}
                                        className="p-2 rounded-xl glass hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(member.id)}
                                        className="p-2 rounded-xl glass hover:bg-red-500/20 text-red-400 transition-colors"
                                        title="Delete Profile"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Avatar & Info */}
                            <div className="flex items-center gap-3.5 sm:gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shrink-0 relative">
                                    <img
                                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=150`}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { 
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=150`; 
                                        }}
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-orbitron font-bold text-sm sm:text-base text-white truncate group-hover:text-aira-cyan transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">{member.role}</p>
                                    {member.teamGroup && (
                                        <p className="text-[10px] text-violet-300 truncate mt-0.5">{member.teamGroup}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bio Preview */}
                            {member.bio && (
                                <p className="text-xs text-slate-400 line-clamp-2 font-sans leading-relaxed break-words">
                                    "{member.bio}"
                                </p>
                            )}

                            {/* Social Badges & Actions */}
                            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    {member.linkedin && (
                                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]">
                                            <Linkedin size={13} /> LinkedIn
                                        </a>
                                    )}
                                    {member.github && (
                                        <a href={member.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:underline flex items-center gap-1 text-[11px]">
                                            <Github size={13} /> GitHub
                                        </a>
                                    )}
                                </div>
                                <button
                                    onClick={() => openEdit(member)}
                                    className="text-[11px] text-aira-cyan hover:underline font-semibold"
                                >
                                    Edit Profile →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* ══ ADD / EDIT MODAL ══ */}
            <AnimatedModal
                open={isModalOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditing(null);
                }}
                title={editing ? `Edit ${form.isPresident ? "Leader" : "Team Member"}` : `Add New ${form.isPresident ? "Leader" : "Team Member"}`}
                subtitle="Manage photo, leadership role, bio statement, and placement page."
                size="lg"
                footer={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3">
                        <div className="text-[11px] text-slate-400 font-mono text-center sm:text-left">
                            {form.isPresident ? "👑 Placed on /leadership" : "👥 Placed on /about"}
                        </div>
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setEditing(null);
                                }}
                                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/15 text-slate-300 text-xs font-semibold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="member-admin-form"
                                disabled={isSubmitting || uploadingPhoto || isBioOverLimit}
                                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-orbitron font-bold text-xs hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg shadow-aira-cyan/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" /> Saving...
                                    </>
                                ) : editing ? (
                                    "Save Changes"
                                ) : (
                                    `Create ${form.isPresident ? "Leader" : "Member"}`
                                )}
                            </button>
                        </div>
                    </div>
                }
            >
                <form id="member-admin-form" onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Switch: Leadership vs People */}
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Display Location & Category *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setForm({ 
                                    ...form, 
                                    isPresident: true, 
                                    teamGroup: form.teamGroup || "Founders & Executive Board" 
                                })}
                                className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    form.isPresident
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md"
                                        : "bg-white/5 text-slate-400 hover:text-white"
                                }`}
                            >
                                <Crown size={14} /> 👑 Leader (/leadership)
                            </button>

                            <button
                                type="button"
                                onClick={() => setForm({ 
                                    ...form, 
                                    isPresident: false, 
                                    teamGroup: form.teamGroup || "AI & Software Division" 
                                })}
                                className={`py-2.5 px-3 rounded-xl font-orbitron text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    !form.isPresident
                                        ? "bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 shadow-md"
                                        : "bg-white/5 text-slate-400 hover:text-white"
                                }`}
                            >
                                <Users size={14} /> 👥 Member (/about)
                            </button>
                        </div>
                    </div>

                    {/* Full Name & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                maxLength={100}
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., Meet Dave"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs sm:text-sm outline-none focus:border-aira-cyan"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Role / Title *
                            </label>
                            <input
                                type="text"
                                maxLength={120}
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                placeholder={form.isPresident ? "e.g., Founder & Lead Architect" : "e.g., Autonomous Systems Engineer"}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs sm:text-sm outline-none focus:border-aira-cyan"
                                required
                            />
                        </div>
                    </div>

                    {/* Group / Division */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Division / Group Name
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={form.teamGroup}
                            onChange={(e) => setForm({ ...form, teamGroup: e.target.value })}
                            placeholder="e.g., Founders & Executive Board"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs sm:text-sm outline-none focus:border-aira-cyan"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {(form.isPresident ? LEADERSHIP_GROUPS : PEOPLE_GROUPS).map((grp) => (
                                <button
                                    type="button"
                                    key={grp}
                                    onClick={() => setForm({ ...form, teamGroup: grp })}
                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                                >
                                    + {grp}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Upload & Preview */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Profile Picture (Upload Image or Paste URL)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={form.photo}
                                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                                placeholder="https://... or click Upload Image"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan font-mono"
                            />
                            <label className="px-4 py-2.5 rounded-xl bg-aira-cyan/15 border border-aira-cyan/40 text-aira-cyan text-xs font-semibold cursor-pointer hover:bg-aira-cyan/25 transition-all flex items-center justify-center gap-1.5 shrink-0">
                                {uploadingPhoto ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={15} /> Upload Photo
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingPhoto}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void uploadPhoto(file);
                                    }}
                                />
                            </label>
                        </div>

                        {form.photo && (
                            <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={form.photo}
                                        alt="Preview"
                                        className="w-12 h-12 rounded-xl object-cover border border-white/20 bg-slate-900 shadow-md"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "Preview")}&background=0d1526&color=00D4FF&size=100`;
                                        }}
                                    />
                                    <div>
                                        <p className="text-xs font-semibold text-white">Profile Photo Preview</p>
                                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">{form.photo}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, photo: "" })}
                                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                                    title="Remove photo"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bio Statement with 500-word limit counter */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Bio Statement / Vision
                            </label>
                            <span 
                                className={`text-[11px] font-mono transition-colors ${
                                    isBioOverLimit
                                        ? "text-rose-400 font-bold"
                                        : bioWordCount > 400
                                        ? "text-amber-400 font-semibold"
                                        : "text-slate-400"
                                }`}
                            >
                                {bioWordCount} / {MAX_BIO_WORDS} words ({form.bio.length}/{MAX_BIO_CHARS} chars)
                            </span>
                        </div>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Describe their background, research domains, mission, or key accomplishments (up to 500 words)..."
                            rows={4}
                            maxLength={MAX_BIO_CHARS}
                            className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-950/80 text-white text-xs sm:text-sm outline-none resize-none font-sans leading-relaxed transition-colors ${
                                isBioOverLimit
                                    ? "border-rose-500 focus:border-rose-500"
                                    : "border-white/10 focus:border-aira-cyan"
                            }`}
                        />
                        {isBioOverLimit && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                                <AlertCircle size={12} /> Exceeded maximum word limit of {MAX_BIO_WORDS} words.
                            </p>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                LinkedIn Profile
                            </label>
                            <input
                                type="text"
                                maxLength={250}
                                value={form.linkedin}
                                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                GitHub Workspace
                            </label>
                            <input
                                type="text"
                                maxLength={250}
                                value={form.github}
                                onChange={(e) => setForm({ ...form, github: e.target.value })}
                                placeholder="https://github.com/..."
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan font-mono"
                            />
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Display Sort Order (Number)
                        </label>
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                            placeholder="1"
                            className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan"
                        />
                        <span className="text-[10px] text-slate-500">Lower numbers appear first on the page</span>
                    </div>
                </form>
            </AnimatedModal>

            {/* Delete Modal */}
            <AnimatedModal
                open={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                title="Delete Profile"
                subtitle="Are you sure you want to permanently remove this profile?"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 rounded-xl border border-white/15 text-slate-300 text-xs font-semibold hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={14} /> Yes, Delete
                        </button>
                    </div>
                }
            >
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    This profile will be permanently deleted from the database and will no longer appear on public leadership or about pages.
                </p>
            </AnimatedModal>
        </div>
    );
}
