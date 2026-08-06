"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SetupPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing setup token.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Missing setup token. Please use the link from your email.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/setup-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to set password");
            }

            setIsSuccess(true);
            toast.success("Password set successfully! You can now log in.");
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/portal/login");
            }, 3000);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-aira-bg flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-aira-cyan/20 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 glass border border-emerald-500/30 rounded-3xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">Password Set!</h2>
                    <p className="text-slate-400 mb-8 text-sm">
                        Your permanent password has been successfully saved. You will be redirected to the login page momentarily.
                    </p>
                    <Link href="/portal/login" className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 transition-all">
                        Go to Login <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-aira-bg flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md relative z-10 glass border border-red-500/20 rounded-3xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">Invalid Link</h2>
                    <p className="text-slate-400 mb-8 text-sm">
                        This setup link is invalid or has expired. Please check your email or contact an administrator.
                    </p>
                    <Link href="/portal/login" className="text-aira-cyan hover:text-aira-cyan-light text-sm font-medium transition-colors">
                        Return to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aira-bg flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-aira-cyan/20 blur-[120px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aira-cyan/20 to-indigo-500/20 border border-aira-cyan/30 mb-6 shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                        <Lock className="text-aira-cyan" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3 font-orbitron tracking-tight">Set Password</h1>
                    <p className="text-slate-400 text-sm">Create a permanent password for your AiRA Lab account.</p>
                </div>

                <div className="glass border border-aira-border/50 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block font-medium uppercase tracking-wider">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-900/50 border border-aira-border text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 focus:ring-1 focus:ring-aira-cyan/50 transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-2 block font-medium uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-900/50 border border-aira-border text-white placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 focus:ring-1 focus:ring-aira-cyan/50 transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !password || !confirmPassword}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-aira-cyan to-blue-500 text-slate-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                "Set Password"
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
