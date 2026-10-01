"use client";

import { useEffect, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { startWalkIn } from "@/components/auth/WalkInGate";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STICKERS = [
    { text: "Learn", color: "bg-nb-sky", rotate: -6 },
    { text: "Build", color: "bg-nb-mint", rotate: 4 },
    { text: "Innovate", color: "bg-nb-peach", rotate: -3 },
    { text: "Impact", color: "bg-nb-lilac", rotate: 6 },
];

const inputCls =
    "w-full pl-11 pr-4 py-3 rounded-xl border-2 border-nb-ink bg-white text-nb-ink placeholder:text-nb-muted/60 shadow-[3px_3px_0_0_#111] outline-none transition-shadow focus:shadow-[4px_4px_0_0_#6C5CE7]";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Warm up the reveal's code while the visitor types, so it starts instantly.
    useEffect(() => {
        import("@/components/auth/AccessReveal");
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", { email, password, redirect: false });

        if (res?.error) {
            toast.error("Invalid email or password");
            setLoading(false);
            return;
        }

        const session = await getSession();
        const user = session?.user as { name?: string | null; role?: string } | undefined;
        startWalkIn({ name: user?.name || email.split("@")[0], role: user?.role });
        // The access-pass reveal covers the screen while the dashboard loads underneath it.
        setTimeout(() => {
            router.push("/portal/dashboard");
            router.refresh();
        }, 250);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] bg-nb-paper text-nb-ink overflow-x-hidden">
            {/* Brand panel — big type, stickers and Mevy (no stock photos) */}
            <div className="relative min-w-0 overflow-hidden border-b-2 lg:border-b-0 lg:border-r-2 border-nb-ink bg-nb-violet text-white px-5 pt-8 pb-7 sm:px-10 sm:pt-10 lg:px-14 lg:py-14 flex flex-col justify-between [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]">
                <motion.span
                    initial={{ opacity: 0, y: -12, rotate: -6 }}
                    animate={{ opacity: 1, y: 0, rotate: -2 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="self-start inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1 font-brico font-extrabold text-xs sm:text-sm text-nb-ink shadow-[3px_3px_0_0_#111]"
                >
                    <span className="w-2 h-2 rounded-full bg-nb-mint border border-nb-ink" /> Led by LJCCA Students
                </motion.span>

                <div className="relative z-10 mt-6 lg:mt-0">
                    <h2 className="font-brico font-extrabold tracking-[-0.045em] leading-[0.92] text-[clamp(2.4rem,6.4vw,6rem)]">
                        {["Your", "journey", "starts", "here."].map((w, i) => (
                            <span key={w} className="inline-block overflow-hidden align-bottom mr-[0.22em]">
                                <motion.span
                                    className="inline-block"
                                    initial={{ y: "110%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.08 }}
                                >
                                    {i === 3 ? <span className="text-nb-sun">{w}</span> : w}
                                </motion.span>
                            </span>
                        ))}
                    </h2>
                    <p className="hidden sm:block mt-5 max-w-md text-white/80 text-lg">
                        Sign in, show your pass, and get back to building with your team.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2.5 max-w-[60%] lg:max-w-md">
                        {STICKERS.map((st, i) => (
                            <motion.span
                                key={st.text}
                                initial={{ opacity: 0, scale: 0.4, rotate: st.rotate * 2 }}
                                animate={{ opacity: 1, scale: 1, rotate: st.rotate, y: [0, -5, 0] }}
                                transition={{
                                    opacity: { delay: 0.5 + i * 0.1 },
                                    scale: { type: "spring", stiffness: 300, damping: 14, delay: 0.5 + i * 0.1 },
                                    rotate: { type: "spring", stiffness: 300, damping: 14, delay: 0.5 + i * 0.1 },
                                    y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 + i * 0.2 },
                                }}
                                className={`rounded-xl border-2 border-nb-ink px-3 py-1.5 font-brico font-extrabold text-sm sm:text-base text-nb-ink shadow-[3px_3px_0_0_#111] ${st.color}`}
                            >
                                {st.text}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Mevy peeking in */}
                <motion.img
                    src="/mevy-cutout.webp"
                    alt=""
                    aria-hidden="true"
                    initial={{ y: 120, rotate: 10, opacity: 0 }}
                    animate={{ y: 0, rotate: -4, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 70, damping: 12, delay: 0.4 }}
                    className="pointer-events-none absolute right-[-18px] bottom-[-10px] h-[170px] sm:h-[240px] lg:h-[36vh] w-auto drop-shadow-[6px_8px_0_rgba(17,17,17,0.9)]"
                />
            </div>

            {/* Sign-in */}
            <div className="relative min-w-0 flex items-center justify-center px-5 py-10 sm:p-10 [background-image:linear-gradient(rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:32px_32px]">
                <motion.div
                    initial={{ opacity: 0, y: 24, rotate: 1.5 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
                    className="w-full max-w-md"
                >
                    <div className="flex items-center gap-3">
                        <Logo size="md" priority />
                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-nb-muted">Member & admin portal</span>
                    </div>

                    <h1 className="mt-6 font-brico font-extrabold tracking-[-0.04em] leading-none text-[clamp(2.4rem,6vw,3.6rem)]">Welcome back.</h1>
                    <p className="mt-2 text-nb-muted">Sign in to the AiRA Lab portal.</p>

                    <form onSubmit={handleSubmit} className="mt-7 rounded-[22px] border-2 border-nb-ink bg-white p-5 sm:p-7 shadow-[6px_6px_0_0_#111] space-y-5">
                        <label className="block">
                            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Email</span>
                            <div className="relative mt-1.5">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nb-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    autoComplete="email"
                                    className={inputCls}
                                    required
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Password</span>
                            <div className="relative mt-1.5">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-nb-muted" />
                                <input
                                    type={showPw ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className={`${inputCls} pr-12`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    aria-label={showPw ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-nb-muted hover:text-nb-ink"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-nb-ink bg-nb-violet py-3.5 font-brico font-bold text-white shadow-[4px_4px_0_0_#111] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Checking your pass…
                                </>
                            ) : (
                                <>
                                    Sign in <ArrowRight size={17} />
                                </>
                            )}
                        </button>

                        <p className="pt-4 border-t-2 border-nb-ink/10 text-center text-sm text-nb-muted">
                            Forgot your password?{" "}
                            <a
                                href="mailto:info@aira-lab.in?subject=Password%20Reset%20%2F%20Portal%20Login%20Assistance"
                                className="font-bold text-nb-violet hover:underline"
                            >
                                Email info@aira-lab.in
                            </a>
                        </p>
                    </form>

                    <div className="mt-6 flex items-center justify-between gap-3 text-sm">
                        <a href="/" className="font-semibold text-nb-muted hover:text-nb-ink">← Back to website</a>
                        <button
                            type="button"
                            onClick={() => startWalkIn({ name: "explorer" })}
                            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-nb-ink bg-nb-sun px-3 py-1.5 font-brico font-bold shadow-[2px_2px_0_0_#111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                            <BadgeCheck size={14} /> Preview your pass
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
