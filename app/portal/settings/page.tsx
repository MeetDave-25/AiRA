"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MAX_CHANGES = 3;

export default function PortalSettingsPage() {
    const { data: session } = useSession();
    const user = session?.user as any;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Password change quota
    const [passwordChanges, setPasswordChanges] = useState<number | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    const roleName = user?.role ? user.role.replace(/_/g, " ") : "Team Member";

    // Fetch password change status on mount
    useEffect(() => {
        if (!session) return;
        setStatusLoading(true);
        fetch("/api/user/password-status")
            .then((r) => r.json())
            .then((data) => {
                if (typeof data.passwordChanges === "number") {
                    setPasswordChanges(data.passwordChanges);
                    setIsLocked(data.locked ?? false);
                }
            })
            .catch(() => {})
            .finally(() => setStatusLoading(false));
    }, [session]);

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

        setIsSubmitting(true);
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

            // Update local quota state
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
            setIsSubmitting(false);
        }
    };

    // Quota indicator dots
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
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-aira-cyan/15 blur-3xl rounded-full pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-aira-cyan/20 text-aira-cyan border border-aira-cyan/40">
                                <Key size={20} />
                            </span>
                            <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                                Account &amp; Security Settings
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Manage your member credentials, profile status, and portal security.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span>Security Level: <strong className="text-white">Active</strong></span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Profile Card (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass p-6 rounded-3xl border border-white/10 space-y-6">
                        <h2 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
                            <User size={18} className="text-aira-cyan" /> Member Profile
                        </h2>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aira-cyan to-aira-purple p-0.5 shadow-lg shadow-aira-cyan/20 flex items-center justify-center shrink-0 font-orbitron font-bold text-xl text-white">
                                {user?.name?.[0] || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-white text-base truncate">{user?.name || "Member"}</h3>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider bg-aira-cyan/15 border border-aira-cyan/30 text-aira-cyan">
                                    {roleName}
                                </span>
                            </div>
                        </div>

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
                                <HelpCircle size={15} className="text-aira-cyan" /> Need help or profile update?
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

                {/* Right Column: Password Change Form (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 relative"
                    >
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
                                {/* Remaining changes notice */}
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

                                    {/* Strength indicator bar */}
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

                                {/* Submit + quota dots */}
                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-slate-950 font-orbitron font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-aira-cyan/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Lock size={15} />
                                        {isSubmitting ? "Updating Password..." : "Update Password"}
                                    </button>

                                    {/* Quota dots under button */}
                                    {!statusLoading && passwordChanges !== null && (
                                        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
                                            <QuotaDots />
                                            <span>
                                                {remaining} of {MAX_CHANGES} change{MAX_CHANGES !== 1 ? "s" : ""} remaining
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
