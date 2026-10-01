"use client";

// Post-login reveal: your AiRA access pass drops in and gets stamped "ACCESS GRANTED", then five
// brand-colour bands arrive one by one (Learn, Build, Innovate, Impact, Welcome in) and peel away
// one by one to uncover the dashboard that has been loading underneath.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Code2, Lightbulb, Globe2, Sparkles } from "lucide-react";

const BANDS = [
    { word: "Learn", sub: "Workshops · mentors · seniors", color: "#9DD6FF", icon: BookOpen },
    { word: "Build", sub: "Software · AI · Robotics", color: "#A8EFC9", icon: Code2 },
    { word: "Innovate", sub: "Ideas into prototypes", color: "#FFB48A", icon: Lightbulb },
    { word: "Impact", sub: "Ship it. Share it.", color: "#D6CEFF", icon: Globe2 },
    { word: "", sub: "", color: "#FFD84D", icon: Sparkles }, // filled with the member's welcome
];

// Timeline (ms)
const STAMP_AT = 900;
const BANDS_AT = 1900;
const BAND_GAP = 0.3; // seconds between bands arriving
const BAND_IN = 0.55;
const ALL_IN = BANDS_AT + ((BANDS.length - 1) * BAND_GAP + BAND_IN) * 1000;
const EXIT_AT = ALL_IN + 550; // hold so the last band can be read
const EXIT_GAP = 0.09;
const BAND_OUT = 0.5;
const DONE_AT = EXIT_AT + ((BANDS.length - 1) * EXIT_GAP + BAND_OUT) * 1000 + 50;

type Phase = "card" | "stamp" | "bands" | "covered" | "exit";

/** Deterministic barcode bars from the member's name. */
function barsFor(seed: string) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    return Array.from({ length: 34 }, () => {
        h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
        return 1 + ((h >>> 0) % 4);
    });
}

export default function AccessReveal({ name, role, onDone }: { name: string; role?: string; onDone: () => void }) {
    const [phase, setPhase] = useState<Phase>("card");
    const display = (name || "Explorer").trim();
    const first = display.split(/\s+/)[0];
    const initials = display.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const roleLabel = (role || "MEMBER").replace(/_/g, " ");
    const bars = useMemo(() => barsFor(display.toLowerCase()), [display]);
    const passNo = useMemo(() => `AIRA-${(bars.join("").slice(0, 6))}`, [bars]);

    useEffect(() => {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            const t = setTimeout(onDone, 900);
            return () => clearTimeout(t);
        }
        const timers = [
            setTimeout(() => setPhase("stamp"), STAMP_AT),
            setTimeout(() => setPhase("bands"), BANDS_AT),
            setTimeout(() => setPhase("covered"), ALL_IN),
            setTimeout(() => setPhase("exit"), EXIT_AT),
            setTimeout(onDone, DONE_AT),
        ];
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDone();
        window.addEventListener("keydown", onKey);
        return () => {
            timers.forEach(clearTimeout);
            window.removeEventListener("keydown", onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showCard = phase === "card" || phase === "stamp" || phase === "bands";
    const showBands = phase === "bands" || phase === "covered" || phase === "exit";
    const exiting = phase === "exit";

    return (
        <div className="fixed inset-0 z-[100000] overflow-hidden select-none" role="status" aria-live="polite">
            {/* Ink floor with the lab grid — removed once the bands cover it */}
            {showCard && (
                <div className="absolute inset-0 bg-[#111] [background-image:linear-gradient(rgba(243,239,228,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(243,239,228,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />
            )}

            <AnimatePresence>
                {showCard && (
                    <motion.div
                        key="pass"
                        className="absolute inset-0 flex flex-col items-center justify-center px-5"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* The access pass */}
                        <motion.div
                            initial={{ y: -380, rotate: -14, opacity: 0 }}
                            animate={
                                phase === "stamp"
                                    ? { y: 0, rotate: [-3, 1.5, -1.5, -2], opacity: 1, x: [0, -6, 5, 0] }
                                    : { y: 0, rotate: -3, opacity: 1 }
                            }
                            transition={phase === "stamp" ? { duration: 0.35 } : { type: "spring", stiffness: 170, damping: 15 }}
                            className="relative w-[min(340px,86vw)] rounded-[26px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-[8px_8px_0_0_#6C5CE7] overflow-hidden"
                        >
                            {/* Lanyard slot */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-2.5 rounded-full border-2 border-nb-ink bg-[#111]" />

                            <div className="px-5 pt-9 pb-4 border-b-2 border-nb-ink bg-nb-lilac">
                                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                                    <span className="font-bold">AiRA Lab · Access pass</span>
                                    <span>{passNo}</span>
                                </div>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="w-[72px] h-[72px] shrink-0 rounded-2xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center font-brico font-extrabold text-2xl shadow-[3px_3px_0_0_#111]">
                                        {initials || "A"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-brico font-extrabold text-2xl leading-tight tracking-tight break-words">{display}</p>
                                        <span className="mt-1.5 inline-block rounded-full border-2 border-nb-ink bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                                            {roleLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-4">
                                <div className="flex items-end gap-[2px] h-11" aria-hidden="true">
                                    {bars.map((b, i) => (
                                        <span key={i} className="bg-nb-ink" style={{ width: b, height: i % 7 === 0 ? "100%" : "84%" }} />
                                    ))}
                                </div>
                                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-nb-muted">
                                    <span>LJCCA · Ahmedabad</span>
                                    <span>Led by students</span>
                                </div>
                            </div>

                            {/* The stamp */}
                            <AnimatePresence>
                                {phase !== "card" && (
                                    <motion.div
                                        initial={{ scale: 2.6, opacity: 0, rotate: -4 }}
                                        animate={{ scale: 1, opacity: 1, rotate: -14 }}
                                        transition={{ type: "spring", stiffness: 520, damping: 22 }}
                                        style={{ x: "-50%", y: "-50%" }}
                                        className="absolute left-1/2 top-[71%] whitespace-nowrap rounded-xl border-[3px] border-nb-ink bg-nb-mint px-4 py-2 font-brico font-extrabold text-xl sm:text-2xl tracking-tight text-nb-ink shadow-[4px_4px_0_0_#111]"
                                    >
                                        ✓ ACCESS GRANTED
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={phase === "card" ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="mt-10 text-center font-brico font-extrabold tracking-[-0.03em] text-[#F3EFE4] text-[clamp(1.6rem,5vw,2.6rem)]"
                        >
                            Welcome in, <span className="text-nb-sun">{first}</span>.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: phase === "card" ? 0.5 : 0.7 }}
                            className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F3EFE4]"
                        >
                            {phase === "card" ? "Verifying your pass…" : role === "ADMIN" ? "Opening the admin console" : "Opening your portal"}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Five bands: in one by one from alternating sides, then out one by one to uncover the dashboard */}
            {showBands && (
                <div className="absolute inset-0 flex flex-col">
                    {BANDS.map((b, i) => {
                        const Icon = b.icon;
                        const fromLeft = i % 2 === 0;
                        const isWelcome = i === BANDS.length - 1;
                        const word = isWelcome ? `Welcome in, ${first}.` : b.word;
                        const sub = isWelcome ? (role === "ADMIN" ? "Admin console ready" : "Your portal is ready") : b.sub;
                        return (
                            <motion.div
                                key={i}
                                className="relative flex-1 min-h-0 overflow-hidden border-b-2 last:border-b-0 border-nb-ink"
                                style={{ background: b.color }}
                                initial={{ x: fromLeft ? "-101%" : "101%" }}
                                animate={{ x: exiting ? (fromLeft ? "101%" : "-101%") : "0%" }}
                                transition={
                                    exiting
                                        ? { duration: BAND_OUT, ease: [0.7, 0, 0.84, 0], delay: i * EXIT_GAP }
                                        : { duration: BAND_IN, ease: [0.16, 1, 0.3, 1], delay: i * BAND_GAP }
                                }
                            >
                                <div className={`h-full px-5 sm:px-10 lg:px-16 flex items-center gap-4 sm:gap-6 ${fromLeft ? "" : "flex-row-reverse text-right"}`}>
                                    <motion.span
                                        initial={{ scale: 0, rotate: fromLeft ? -40 : 40 }}
                                        animate={{ scale: 1, rotate: fromLeft ? -6 : 6 }}
                                        transition={{ type: "spring", stiffness: 380, damping: 15, delay: i * BAND_GAP + 0.3 }}
                                        className="shrink-0 w-[min(12vw,9vh)] h-[min(12vw,9vh)] min-w-[40px] min-h-[40px] rounded-2xl border-2 border-nb-ink bg-white flex items-center justify-center shadow-[3px_3px_0_0_#111]"
                                    >
                                        <Icon className="w-1/2 h-1/2 text-nb-ink" strokeWidth={2.4} />
                                    </motion.span>
                                    <div className="min-w-0 flex-1">
                                        <motion.p
                                            initial={{ x: fromLeft ? -60 : 60, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * BAND_GAP + 0.2 }}
                                            className="font-brico font-extrabold tracking-[-0.045em] leading-none text-nb-ink whitespace-nowrap overflow-hidden text-ellipsis text-[min(11vw,10vh)]"
                                        >
                                            {word}
                                        </motion.p>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.75 }}
                                            transition={{ delay: i * BAND_GAP + 0.4 }}
                                            className="mt-1 font-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-nb-ink truncate"
                                        >
                                            {String(i + 1).padStart(2, "0")} · {sub}
                                        </motion.p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {showCard && (
                <button
                    type="button"
                    onClick={onDone}
                    className="absolute top-4 right-4 rounded-lg border-2 border-[#F3EFE4]/25 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#F3EFE4]/70 hover:bg-[#F3EFE4] hover:text-[#111] transition-colors"
                >
                    Skip ›
                </button>
            )}
        </div>
    );
}
