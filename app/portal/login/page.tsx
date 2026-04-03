"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            toast.error("Invalid credentials.");
            setLoading(false);
        } else {
            toast.success("Login successful!");
            router.push("/portal/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-aira-cyan/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-aira-purple/10 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-orbitron font-bold text-2xl text-white shadow-xl mx-auto mb-6 glow-cyan">
                        AL
                    </div>
                    <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm">Sign in to the AIRA Labs Portal</p>
                </div>

                <div className="glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl card-3d">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@airalabs.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-aira-card border border-aira-border/50 text-white placeholder-slate-600 focus:outline-none focus:border-aira-cyan/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-aira-card border border-aira-border/50 text-white placeholder-slate-600 focus:outline-none focus:border-aira-cyan/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold shadow-lg hover:shadow-aira-cyan/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <a href="/" className="text-slate-500 text-sm hover:text-aira-cyan hover:underline transition-all">
                        ← Return to public website
                    </a>
                </div>
            </motion.div>
        </div>
    );
}
