"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
    Key, 
    Lock, 
    ShieldCheck, 
    User, 
    CheckCircle2, 
    AlertCircle, 
    Eye, 
    EyeOff, 
    HelpCircle,
    ShieldOff,
    RefreshCw,
    Camera,
    UploadCloud,
    Trash2,
    Linkedin,
    Github,
    Sparkles,
    Save,
    ExternalLink,
    Mail,
    BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { uploadDirectFile } from "@/lib/upload-client";

const MAX_CHANGES = 3;
const MAX_BIO_WORDS = 500;
const MAX_BIO_CHARS = 3000;

export default function PortalSettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const user = session?.user as any;

    const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

    // ── Profile Form State ──
    const [profileLoading, setProfileLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [github, setGithub] = useState("");
    const [bio, setBio] = useState("");
    const [teamGroup, setTeamGroup] = useState("");
    const [memberRole, setMemberRole] = useState("");
    
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ── Password Form State ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Password change quota
    const [passwordChanges, setPasswordChanges] = useState<number | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    const roleName = user?.role ? user.role.replace(/_/g, " ") : "Team Member";

    // ── Fetch Profile on Mount ──
    const fetchProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (data.user) {
                setName(data.user.name || "");
                setEmail(data.user.email || "");
                setAvatar(data.user.avatar || "");
                setLinkedin(data.user.linkedin || "");
                setGithub(data.user.github || "");
                setBio(data.user.bio || "");
                setTeamGroup(data.user.teamGroup || "");
                setMemberRole(data.user.memberRole || "");
            }
        } catch (err) {
            console.error("Failed to load profile", err);
        } finally {
            setProfileLoading(false);
        }
    };

    // ── Fetch Password Quota on Mount ──
    const fetchPasswordStatus = async () => {
        setStatusLoading(true);
        try {
            const r = await fetch("/api/user/password-status");
            const data = await r.json();
            if (typeof data.passwordChanges === "number") {
                setPasswordChanges(data.passwordChanges);
                setIsLocked(data.locked ?? false);
            }
        } catch (err) {
            console.error("Failed to fetch password status", err);
        } finally {
            setStatusLoading(false);
        }
    };

    useEffect(() => {
        if (!session) return;
        void fetchProfile();
        void fetchPasswordStatus();
    }, [session]);

    // Word count calculations for bio
    const bioWordCount = bio.trim() ? bio.trim().split(/\s+/).length : 0;
    const isBioOverLimit = bioWordCount > MAX_BIO_WORDS || bio.length > MAX_BIO_CHARS;

    // ── Handle Photo Upload ──
    const handlePhotoUpload = async (file: File) => {
        if (!file) return;
        setIsUploadingPhoto(true);
        const toastId = toast.loading("Uploading new profile picture...");
        try {
            const uploaded = await uploadDirectFile(file, { bucket: "uploads", folder: "avatars" });
            if (uploaded?.url) {
                setAvatar(uploaded.url);
                toast.success("Profile picture uploaded!", { id: toastId });
            } else {
                throw new Error("Upload did not return a valid URL");
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to upload photo", { id: toastId });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    // ── Handle Profile Save ──
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            toast.error("Please enter your name");
            return;
        }

        if (isBioOverLimit) {
            toast.error(`Bio statement exceeds limit (max ${MAX_BIO_WORDS} words / ${MAX_BIO_CHARS} characters).`);
            return;
        }

        setIsSavingProfile(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmedName,
                    avatar: avatar.trim(),
                    linkedin: linkedin.trim(),
                    github: github.trim(),
                    bio: bio.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save profile");

            toast.success("Profile updated successfully!");

            // Update NextAuth session state if method exists
            if (updateSession) {
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        name: trimmedName,
                        avatar: avatar.trim(),
                    },
                });
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ── Handle Password Change ──
    const remaining = passwordChanges !== null ? Math.max(0, MAX_CHANGES - passwordChanges) : null;

    const calculateStrength = (pwd: string) => {
        if (!pwd) return { score: 0, text: "Enter password", color: "bg-slate-700" };
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 10) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (score <= 2) return { score: 1, text: "Weak", color: "bg-red-500" };
        if (score <= 3) return { score: 2, text: "Medium", color: "bg-amber-500" };
        return { score: 3, text: "Strong", color: "bg-emerald-500" };
    };

    const strength = calculateStrength(newPassword);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");

        if (isLocked) {
            toast.error("Password change limit reached. Contact an admin.");
            return;
        }

        if (!currentPassword.trim()) {
            toast.error("Please enter your current password");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setIsSubmittingPassword(true);
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: currentPassword.trim(),
                    newPassword: newPassword.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 403 && data.locked) {
                    setIsLocked(true);
                    setPasswordChanges(MAX_CHANGES);
                }
                throw new Error(data.error || "Failed to update password");
            }

            if (typeof data.passwordChanges === "number") {
                setPasswordChanges(data.passwordChanges);
                setIsLocked(data.locked ?? false);
            }

            toast.success("Password changed successfully!");
            const newRemaining = typeof data.remaining === "number" ? data.remaining : null;
            const suffix =
                newRemaining === 0
                    ? " This was your last allowed change — contact an admin for future resets."
                    : newRemaining !== null
                    ? ` You have ${newRemaining} change${newRemaining === 1 ? "" : "s"} remaining.`
                    : "";
            setSuccessMessage(`Your password was updated! You can now use your new password on your next login.${suffix}`);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to change password");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const QuotaDots = () => (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: MAX_CHANGES }).map((_, i) => {
                const used = passwordChanges !== null && i < passwordChanges;
                return (
                    <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            used ? "bg-red-500" : "bg-emerald-500/70"
                        }`}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-16">
            {/* Header */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-aira-cyan/15 blur-3xl rounded-full pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-aira-cyan/20 text-aira-cyan border border-aira-cyan/40">
                                <User size={20} />
                            </span>
                            <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                                Account &amp; Profile Settings
                            </h1>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm">
                            Manage your personal profile picture, name, LinkedIn, GitHub links, and credentials.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>Security Level: <strong className="text-white">Active</strong></span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                            activeTab === "profile"
                                ? "bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 shadow-md shadow-aira-cyan/20 font-bold"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <User size={15} /> My Profile & Links
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                            activeTab === "security"
                                ? "bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 shadow-md shadow-aira-cyan/20 font-bold"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <Lock size={15} /> Password & Security
                    </button>
                </div>
            </div>

            {/* ══ TAB 1: MY PROFILE & SOCIAL LINKS ══ */}
            {activeTab === "profile" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Left Column: Avatar & Quick Info Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass p-6 rounded-3xl border border-white/10 space-y-6 text-center">
                            <h2 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                                Profile Picture
                            </h2>

                            {/* Circular Avatar Preview with Camera Overlay */}
                            <div className="relative mx-auto w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-aira-cyan via-sky-400 to-indigo-600 shadow-xl shadow-aira-cyan/20 group">
                                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                                    {avatar ? (
                                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-orbitron font-black text-4xl text-sky-400">
                                            {name?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    )}

                                    {/* Hover Camera Icon */}
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current?.click()}
                                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold"
                                    >
                                        <Camera size={20} className="text-aira-cyan" />
                                        <span>Change</span>
                                    </button>
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void handlePhotoUpload(file);
                                }}
                            />

                            {/* Photo Upload & Remove Buttons */}
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    disabled={isUploadingPhoto}
                                    className="px-3.5 py-2 rounded-xl bg-aira-cyan/15 hover:bg-aira-cyan/25 border border-aira-cyan/40 text-aira-cyan text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isUploadingPhoto ? (
                                        <RefreshCw size={14} className="animate-spin" />
                                    ) : (
                                        <UploadCloud size={14} />
                                    )}
                                    {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                                </button>

                                {avatar && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatar("")}
                                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs transition-colors"
                                        title="Remove photo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Quick Badges */}
                            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-slate-300">
                                    <span className="text-slate-400">Account Role:</span>
                                    <span className="font-orbitron font-bold text-sky-400 text-[11px]">{roleName}</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-slate-300">
                                    <span className="text-slate-400">Status:</span>
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <BadgeCheck size={14} /> Verified Member
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Editable Profile & Links Form */}
                    <div className="lg:col-span-8">
                        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
                            <div>
                                <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-aira-cyan" /> Edit Profile Details
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Update your displayed name, bio, and social channels on the AiRA portal.
                                </p>
                            </div>

                            {profileLoading ? (
                                <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                                    <RefreshCw size={18} className="animate-spin text-aira-cyan" /> Loading profile details...
                                </div>
                            ) : (
                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    {/* Full Name */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Full Name <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your full name"
                                            required
                                            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan font-sans transition-colors"
                                        />
                                    </div>

                                    {/* Email Address (Read-only) */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-400">
                                            Email Address / Login ID (Read-only)
                                        </label>
                                        <div className="flex items-center gap-2 w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400">
                                            <Mail size={15} className="text-slate-500 shrink-0" />
                                            <span className="truncate">{email || user?.email}</span>
                                        </div>
                                    </div>

                                    {/* Social Links Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* LinkedIn */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                                <Linkedin size={14} className="text-sky-400" /> LinkedIn Profile URL
                                            </label>
                                            <input
                                                type="url"
                                                value={linkedin}
                                                onChange={(e) => setLinkedin(e.target.value)}
                                                placeholder="https://linkedin.com/in/username"
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan transition-colors"
                                            />
                                        </div>

                                        {/* GitHub */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                                <Github size={14} className="text-slate-200" /> GitHub Profile URL
                                            </label>
                                            <input
                                                type="url"
                                                value={github}
                                                onChange={(e) => setGithub(e.target.value)}
                                                placeholder="https://github.com/username"
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Bio / Message */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Bio / Message &amp; Research Focus
                                            </label>
                                            <span className={`text-[11px] ${isBioOverLimit ? "text-rose-400 font-bold" : "text-slate-400"}`}>
                                                {bioWordCount}/{MAX_BIO_WORDS} words
                                            </span>
                                        </div>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={4}
                                            placeholder="Write a brief statement about your skills, role, and passion in robotics & AI..."
                                            className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan transition-colors leading-relaxed resize-none"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile || isBioOverLimit}
                                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-aira-cyan via-sky-400 to-indigo-600 text-slate-950 font-orbitron font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-aira-cyan/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSavingProfile ? (
                                            <RefreshCw size={15} className="animate-spin" />
                                        ) : (
                                            <Save size={15} />
                                        )}
                                        {isSavingProfile ? "Saving Profile..." : "Save Profile Changes"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ══ TAB 2: PASSWORD & SECURITY ══ */}
            {activeTab === "security" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* Left Column: Security Quota Status */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
                            <h2 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                                <ShieldCheck size={18} className="text-aira-cyan" /> Security Quota
                            </h2>

                            <div className="space-y-3 text-xs text-slate-300">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-slate-400">Portal Access:</span>
                                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 size={13} /> Enabled
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-slate-400">Official Sender:</span>
                                    <span className="text-slate-200 font-mono">info@aira-lab.in</span>
                                </div>

                                {/* Password quota status */}
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-slate-400">Password Changes:</span>
                                    {statusLoading ? (
                                        <RefreshCw size={13} className="text-slate-500 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <QuotaDots />
                                            <span className={isLocked ? "text-red-400 font-semibold" : "text-slate-300"}>
                                                {passwordChanges}/{MAX_CHANGES} used
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Need Help Box */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-aira-purple/15 to-aira-cyan/10 border border-white/10 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <HelpCircle size={15} className="text-aira-cyan" /> Need password reset assistance?
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                    Reach our admin team directly through the official lab desk at{" "}
                                    <a href="mailto:info@aira-lab.in" className="text-aira-cyan underline font-medium">
                                        info@aira-lab.in
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Password Change Form */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 relative">
                            <div>
                                <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                                    <Lock size={18} className="text-aira-cyan" /> Change Portal Password
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Update your password to keep your member account secure.
                                </p>
                            </div>

                            {/* Locked state banner */}
                            <AnimatePresence>
                                {isLocked && !statusLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col gap-3"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <ShieldOff size={18} className="text-red-400 shrink-0" />
                                            <p className="text-sm font-bold text-red-300">Password Change Limit Reached</p>
                                        </div>
                                        <p className="text-xs text-red-300/80 leading-relaxed">
                                            You have used all <strong className="text-red-300">{MAX_CHANGES} allowed</strong> self-service password changes. For security, further changes require an admin reset.
                                        </p>
                                        <a
                                            href="mailto:info@aira-lab.in?subject=Password Reset Request"
                                            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                                        >
                                            Contact Admin to Reset →
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Success message */}
                            {successMessage && (
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* Form — only rendered when not locked */}
                            {!isLocked && (
                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    {remaining !== null && remaining <= 2 && (
                                        <div className={`flex items-center gap-2.5 p-3 rounded-xl text-xs border ${
                                            remaining === 1
                                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                                : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                        }`}>
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>
                                                You have <strong>{remaining} password change{remaining === 1 ? "" : "s"}</strong> remaining. After {remaining === 1 ? "this change" : `${remaining} more changes`}, you will need to contact an admin to reset your password.
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Current Password <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter your temporary or current password"
                                                required
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan pr-10 font-sans"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                New Password <span className="text-red-400">*</span>
                                            </label>
                                            {newPassword && (
                                                <span className="text-[11px] font-semibold text-slate-400">
                                                    Strength: <strong className="text-white">{strength.text}</strong>
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showNew ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="At least 6 characters"
                                                required
                                                minLength={6}
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan pr-10 font-sans"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>

                                        {newPassword && (
                                            <div className="grid grid-cols-3 gap-1.5 pt-1">
                                                <div className={`h-1.5 rounded-full ${strength.score >= 1 ? strength.color : "bg-white/10"}`} />
                                                <div className={`h-1.5 rounded-full ${strength.score >= 2 ? strength.color : "bg-white/10"}`} />
                                                <div className={`h-1.5 rounded-full ${strength.score >= 3 ? strength.color : "bg-white/10"}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Confirm New Password <span className="text-red-400">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-type your new password"
                                                required
                                                minLength={6}
                                                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan pr-10 font-sans"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="space-y-3">
                                        <button
                                            type="submit"
                                            disabled={isSubmittingPassword}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-slate-950 font-orbitron font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-aira-cyan/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Lock size={15} />
                                            {isSubmittingPassword ? "Updating Password..." : "Update Password"}
                                        </button>

                                        {!statusLoading && passwordChanges !== null && (
                                            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                                                <QuotaDots />
                                                <span>
                                                    {remaining} of {MAX_CHANGES} changes remaining
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
