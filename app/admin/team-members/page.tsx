"use client";

import { useEffect, useState } from "react";
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
    Check
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

const baseForm: MemberForm = {
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

const SUGGESTED_GROUPS = [
    "Founders & Executive Board",
    "Technical Leads",
    "Research Mentors & Advisors",
    "Core Team",
    "Robotics Division",
    "AI & Software Division",
];

export default function TeamMembersAdminPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState<MemberForm>(baseForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupFilter, setSelectedGroupFilter] = useState("ALL");

    const fetchMembers = async () => {
        setIsLoading(true);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch("/api/team-members", { signal: controller.signal });
            const data = res.ok ? await res.json() : [];
            setMembers(Array.isArray(data) ? data : []);
            if (!res.ok) {
                toast.error("Could not load leadership profiles.");
            }
        } catch {
            setMembers([]);
            toast.error("Profile request timed out. Please retry.");
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchMembers();
    }, []);

    const openCreate = () => {
        setForm(baseForm);
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
            teamGroup: member.teamGroup || "Founders & Executive Board",
            sortOrder: String(member.sortOrder || 0),
            isPresident: Boolean(member.isPresident),
        });
    };

    const uploadPhoto = async (file: File) => {
        setUploadingPhoto(true);
        toast.loading("Uploading leader photo...", { id: "photo-upload" });
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "leadership" });
            setForm((prev) => ({ ...prev, photo: uploaded.url || prev.photo }));
            toast.success("Leader photo uploaded successfully!", { id: "photo-upload" });
        } catch (error: any) {
            toast.error(error?.message || "Photo upload failed", { id: "photo-upload" });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Please enter a name for the leader / member");
            return;
        }

        setIsSubmitting(true);
        try {
            const endpoint = editing ? `/api/team-members/${editing.id}` : "/api/team-members";
            const method = editing ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Operation failed");
            }

            toast.success(editing ? "Leader profile updated!" : "New leader profile created!");
            setIsCreateOpen(false);
            setEditing(null);
            setForm(baseForm);
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
            toast.success("Profile deleted");
            setDeleteId(null);
            await fetchMembers();
        } catch {
            toast.error("Failed to delete profile");
        }
    };

    // Filter & Search
    const filteredMembers = members.filter((m) => {
        const matchesSearch =
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.teamGroup && m.teamGroup.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesGroup = selectedGroupFilter === "ALL" || m.teamGroup === selectedGroupFilter;
        return matchesSearch && matchesGroup;
    });

    const isModalOpen = isCreateOpen || Boolean(editing);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-6 md:p-8 rounded-3xl border border-white/10 animated-border">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Crown size={20} />
                        </span>
                        <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                            Leadership & People Management
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                        Add, edit photos, update bios, and spotlight Founders, Executive Board, and Technical Leads.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/leadership"
                        target="_blank"
                        className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 hover:text-white hover:bg-white/5 font-semibold text-xs flex items-center gap-2 transition-all"
                    >
                        <Eye size={16} className="text-aira-cyan" /> Preview Public Page
                    </Link>
                    <button
                        onClick={openCreate}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-aira-cyan/20"
                    >
                        <Plus size={16} /> Add New Leader / Member
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search leader by name, role, or team..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white text-xs outline-none focus:border-aira-cyan"
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setSelectedGroupFilter("ALL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            selectedGroupFilter === "ALL"
                                ? "bg-aira-cyan text-slate-950"
                                : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                    >
                        All ({members.length})
                    </button>
                    {SUGGESTED_GROUPS.slice(0, 3).map((grp) => (
                        <button
                            key={grp}
                            onClick={() => setSelectedGroupFilter(grp)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedGroupFilter === grp
                                    ? "bg-aira-cyan text-slate-950"
                                    : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                        >
                            {grp}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaders Grid */}
            {isLoading ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                    Loading leadership profiles...
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="glass p-12 rounded-3xl border border-white/10 text-center space-y-4">
                    <Crown size={40} className="mx-auto text-slate-600" />
                    <p className="text-slate-400 text-sm">No leadership profiles found matching your search.</p>
                    <button
                        onClick={openCreate}
                        className="px-5 py-2.5 rounded-xl bg-aira-cyan text-slate-950 font-bold text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Plus size={16} /> Add First Leader
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 group relative ${
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

                                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(member)}
                                        className="p-1.5 rounded-lg glass hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                                        title="Edit Profile"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(member.id)}
                                        className="p-1.5 rounded-lg glass hover:bg-red-500/20 text-red-400 transition-colors"
                                        title="Delete Profile"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Center Avatar & Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shrink-0">
                                    <img
                                        src={member.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=150`}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { 
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0d1526&color=00D4FF&size=150`; 
                                        }}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="font-orbitron font-bold text-base text-white truncate group-hover:text-aira-cyan transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-300 truncate mt-0.5">{member.role}</p>
                                    {member.teamGroup && (
                                        <p className="text-[10px] text-violet-300 truncate mt-0.5">{member.teamGroup}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {member.bio && (
                                <p className="text-xs text-slate-400 line-clamp-2 font-sans leading-relaxed">
                                    "{member.bio}"
                                </p>
                            )}

                            {/* Social Badges */}
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
                                    Edit Details →
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
                title={editing ? "Edit Leadership Profile" : "Add New Leader / Team Member"}
                subtitle="Configure name, executive role, photo, bio, and social workspace links."
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., Meet Dave"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-sm outline-none focus:border-aira-cyan"
                            required
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Role / Title *
                        </label>
                        <input
                            type="text"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            placeholder="e.g., Founder & Lead Architect"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-sm outline-none focus:border-aira-cyan"
                            required
                        />
                    </div>

                    {/* Category Group */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Leadership Category / Group
                        </label>
                        <input
                            type="text"
                            value={form.teamGroup}
                            onChange={(e) => setForm({ ...form, teamGroup: e.target.value })}
                            placeholder="e.g., Founders & Executive Board"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-sm outline-none focus:border-aira-cyan"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {SUGGESTED_GROUPS.map((grp) => (
                                <button
                                    type="button"
                                    key={grp}
                                    onClick={() => setForm({ ...form, teamGroup: grp })}
                                    className="text-[10px] px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                                >
                                    + {grp}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo Upload & URL */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Profile Photo (Upload or Paste URL)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={form.photo}
                                onChange={(e) => setForm({ ...form, photo: e.target.value })}
                                placeholder="https://... or click Upload"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan font-mono"
                            />
                            <label className="px-4 py-2.5 rounded-xl bg-aira-cyan/15 border border-aira-cyan/40 text-aira-cyan text-xs font-semibold cursor-pointer hover:bg-aira-cyan/25 transition-all flex items-center gap-1.5 shrink-0">
                                <UploadCloud size={15} />
                                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) void uploadPhoto(file);
                                    }}
                                />
                            </label>
                        </div>
                        {form.photo && (
                            <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                                <img
                                    src={form.photo}
                                    alt="Preview"
                                    className="w-12 h-12 rounded-xl object-cover border border-white/15"
                                />
                                <div className="text-[11px] text-slate-300">Photo preview loaded</div>
                            </div>
                        )}
                    </div>

                    {/* Bio / Vision Statement */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Bio & Leadership Vision
                        </label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Briefly describe their research focus, contributions, or vision for AiRA Lab..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan resize-none font-sans"
                        />
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                LinkedIn Profile
                            </label>
                            <input
                                type="text"
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
                                value={form.github}
                                onChange={(e) => setForm({ ...form, github: e.target.value })}
                                placeholder="https://github.com/..."
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan font-mono"
                            />
                        </div>
                    </div>

                    {/* Sort Order & Spotlight Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Sort Order Number
                            </label>
                            <input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                                placeholder="1"
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-950/80 text-white text-xs outline-none focus:border-aira-cyan"
                            />
                            <span className="text-[10px] text-slate-500">Lower numbers appear first</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                Spotlight Badge
                            </label>
                            <label className="flex items-center gap-2.5 p-2 rounded-xl border border-amber-400/30 bg-amber-500/10 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.isPresident}
                                    onChange={(e) => setForm({ ...form, isPresident: e.target.checked })}
                                    className="rounded accent-amber-500"
                                />
                                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                                    <Crown size={14} className="text-amber-400" /> Founder / Executive Spotlight
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateOpen(false);
                                setEditing(null);
                            }}
                            className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-semibold hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || uploadingPhoto}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-orbitron font-bold text-xs hover:scale-105 transition-transform disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Leader Profile"}
                        </button>
                    </div>
                </form>
            </AnimatedModal>

            {/* Delete Modal */}
            <AnimatedModal
                open={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                title="Delete Leader Profile"
                subtitle="Are you sure you want to remove this profile from the leadership page?"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteId(null)}
                            className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center gap-1.5"
                        >
                            <Trash2 size={14} /> Yes, Delete
                        </button>
                    </div>
                }
            >
                <p className="text-xs text-slate-300">
                    This profile will be permanently removed from the public leadership page and about page directory.
                </p>
            </AnimatedModal>
        </div>
    );
}
