"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Play, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { Logo } from "@/components/ui/Logo";

const AiraLoginPreloader = dynamic(() => import("@/components/ui/AiraLoginPreloader"), {
    ssr: false,
});

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            toast.error("Invalid email or password");
            setLoading(false);
        } else {
            toast.success("Welcome back!");
            router.push("/portal/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-aira-bg">
            {/* ══ GSAP ROLLING SLOT INTRO PRELOADER WITH SOUND SYNTHESIS ══ */}
            <AnimatePresence>
                {showIntro && (
                    <AiraLoginPreloader
                        onComplete={() => setShowIntro(false)}
                        autoStart={true}
                    />
                )}
            </AnimatePresence>

            {/* Background elements */}
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: showIntro ? 0.2 : 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-5">
                        <Logo size="xl" priority />
                    </div>
                    <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400 text-sm">Sign in to the AiRA Lab Portal</p>
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
                                    placeholder="your.email@example.com"
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
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-slate-100 text-slate-950 font-bold shadow-lg hover:shadow-sky-400/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 font-orbitron text-xs tracking-wider uppercase cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In to Portal <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-400">
                            Forgot your password or need portal help?{" "}
                            <a
                                href="mailto:info@aira-lab.in?subject=Password%20Reset%20%2F%20Portal%20Login%20Assistance"
                                className="text-aira-cyan hover:underline font-semibold"
                            >
                                Contact info@aira-lab.in
                            </a>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6 px-2 text-xs">
                    <a href="/" className="text-slate-500 hover:text-aira-cyan hover:underline transition-all">
                        ← Return to public website
                    </a>

                    <button
                        type="button"
                        onClick={() => setShowIntro(true)}
                        className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors font-mono cursor-pointer"
                    >
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Replay Intro</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
