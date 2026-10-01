"use client";

// "Lab DNA": your name + three taps rewrite a living double helix, then match you to a real AiRA team.
// The strand is deterministic — the same name and answers always grow the same DNA.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Dna, RotateCcw } from "lucide-react";
import { Btn, Button, Card, EASE, inputClass } from "@/components/nb/kit";

type Strand = "B" | "T" | "M" | "C";

const STRANDS: Record<Strand, { name: string; title: string; desc: string; color: string; hex: string; keywords: string[] }> = {
    B: { name: "Builder", title: "The Builder", desc: "You ship. Give you a problem and a keyboard and there's a working app by morning.", color: "bg-nb-sky", hex: "#9DD6FF", keywords: ["software", "web", "tech", "cloud", "full", "app", "dev"] },
    T: { name: "Thinker", title: "The Thinker", desc: "You ask why it works, then teach a model to do it better. Data is your playground.", color: "bg-nb-peach", hex: "#FFB48A", keywords: ["ai", "ml", "data", "research", "neural", "vision", "science"] },
    M: { name: "Maker", title: "The Maker", desc: "You want it to move. Sensors, motors, solder smoke — ideas become things you can hold.", color: "bg-nb-mint", hex: "#A8EFC9", keywords: ["robot", "hardware", "embedded", "circuit", "iot", "electronic"] },
    C: { name: "Connector", title: "The Connector", desc: "You bring people together. Events, stories and community are how the lab grows.", color: "bg-nb-lilac", hex: "#D6CEFF", keywords: ["event", "management", "council", "media", "design", "content", "pr", "outreach", "creative"] },
};

const QUESTIONS: { q: string; options: [string, Strand][] }[] = [
    { q: "First thing you grab in the lab?", options: [["Laptop", "B"], ["A dataset", "T"], ["Soldering iron", "M"], ["The mic", "C"]] },
    { q: "Your perfect Saturday?", options: [["A 24h hackathon", "B"], ["Reading papers", "T"], ["Building a rover", "M"], ["Running a meetup", "C"]] },
    { q: "Pick a superpower.", options: [["Ship in a day", "B"], ["See patterns", "T"], ["Fix anything", "M"], ["Rally a crowd", "C"]] },
];

/** Small deterministic hash so the helix is stable for a given input. */
function hash(str: string) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function rng(seed: number) {
    let s = seed || 1;
    return () => {
        s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
        return ((s >>> 0) % 10000) / 10000;
    };
}

type Team = { id: string; name: string; lead?: { name?: string } | null };

export default function LabDNA({ teams }: { teams: Team[] }) {
    const [name, setName] = useState("");
    const [answers, setAnswers] = useState<(Strand | null)[]>([null, null, null]);
    const [copied, setCopied] = useState(false);
    const [phase, setPhase] = useState(0);
    const boxRef = useRef<HTMLDivElement>(null);

    const done = answers.every(Boolean) && name.trim().length > 0;
    const seed = hash(name.trim().toLowerCase() + "|" + answers.join(""));

    // Base pairs: answered strands are woven in, the rest is grown from the name.
    const pairs = useMemo(() => {
        const r = rng(seed);
        const keys: Strand[] = ["B", "T", "M", "C"];
        const chosen = answers.filter(Boolean) as Strand[];
        return Array.from({ length: 26 }, (_, i) => {
            const base = chosen.length && r() < 0.55 ? chosen[i % chosen.length] : keys[Math.floor(r() * 4)];
            return { base, wobble: 0.75 + r() * 0.5 };
        });
    }, [seed, answers]);

    const dominant = useMemo<Strand>(() => {
        const count: Record<Strand, number> = { B: 0, T: 0, M: 0, C: 0 };
        answers.forEach((a) => a && (count[a] += 2));
        pairs.forEach((p) => (count[p.base] += 0.1));
        return (Object.keys(count) as Strand[]).sort((a, b) => count[b] - count[a])[0];
    }, [answers, pairs]);

    const match = useMemo(() => {
        const kw = STRANDS[dominant].keywords;
        return teams.find((t) => kw.some((k) => t.name.toLowerCase().includes(k))) || teams[0] || null;
    }, [dominant, teams]);

    const code = `AIRA-${answers.map((a) => a || "·").join("")}-${seed.toString(16).slice(0, 4).toUpperCase().padStart(4, "0")}`;

    // Spin the helix only while it's on screen; honour reduced motion.
    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        let raf = 0, visible = true, last = performance.now();
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        if (boxRef.current) io.observe(boxRef.current);
        const tick = (t: number) => {
            raf = requestAnimationFrame(tick);
            if (!visible) return;
            if (t - last < 33) return; // ~30fps is plenty
            setPhase((p) => p + (t - last) * 0.0016);
            last = t;
        };
        raf = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(raf); io.disconnect(); };
    }, []);

    const W = 640, H = 150, mid = H / 2, amp = 48;
    const step = (W - 40) / (pairs.length - 1);
    const offset = (seed % 628) / 100;

    const copy = async () => {
        const text = `My AiRA Lab DNA: ${code} — I'm ${STRANDS[dominant].title}${match ? `, matched to ${match.name}` : ""}. Find yours at aira-lab.in/about`;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* clipboard blocked */ }
    };

    const reset = () => { setName(""); setAnswers([null, null, null]); };

    return (
        <Card className="p-5 sm:p-8 lg:p-10 overflow-hidden" color="bg-white">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-5">
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1 font-brico font-bold text-sm shadow-nb-sm">
                        <Dna size={15} /> Only at AiRA
                    </span>
                    <h2 className="mt-4 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2.1rem,5vw,3.8rem)]">
                        Grow your Lab DNA.
                    </h2>
                    <p className="mt-3 text-nb-muted leading-relaxed">
                        Type your name and watch it rewrite the strand, letter by letter. Answer three taps and we&apos;ll decode which team you belong in.
                    </p>

                    <label className="mt-6 block">
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Your name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 40))}
                            placeholder="e.g. Aarav Patel"
                            className={`${inputClass} mt-1.5`}
                            autoComplete="off"
                        />
                    </label>

                    <div className="mt-5 space-y-4">
                        {QUESTIONS.map((item, qi) => (
                            <fieldset key={item.q}>
                                <legend className="font-brico font-bold text-[15px]">{qi + 1}. {item.q}</legend>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {item.options.map(([label, strand]) => {
                                        const on = answers[qi] === strand;
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                aria-pressed={on}
                                                onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? strand : v)))}
                                                className={`rounded-xl border-2 border-nb-ink px-3 py-2 text-left text-sm font-semibold transition-all ${
                                                    on ? `${STRANDS[strand].color} shadow-none translate-x-[2px] translate-y-[2px]` : "bg-white shadow-nb-sm hover:bg-nb-paper"
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-5">
                    <div ref={boxRef} className="rounded-[20px] border-2 border-nb-ink bg-nb-ink p-3 sm:p-5 shadow-nb">
                        <div className="flex items-center justify-between gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-white/60">
                            <span className="truncate">{name.trim() || "Unknown specimen"}</span>
                            <span className="shrink-0 text-nb-sun">{code}</span>
                        </div>
                        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full h-auto" role="img" aria-label={`DNA strand for ${name || "you"}`}>
                            {pairs.map((p, i) => {
                                const x = 20 + i * step;
                                const a = i * 0.48 + phase + offset;
                                const s = Math.sin(a) * amp * p.wobble;
                                const front = Math.cos(a) > 0;
                                const hex = STRANDS[p.base].hex;
                                return (
                                    <g key={i} opacity={front ? 1 : 0.45}>
                                        <line x1={x} y1={mid - s} x2={x} y2={mid + s} stroke={hex} strokeWidth={4} strokeLinecap="round" />
                                        <circle cx={x} cy={mid - s} r={front ? 6 : 4.5} fill="#F3EFE4" stroke="#111" strokeWidth={1.5} />
                                        <circle cx={x} cy={mid + s} r={front ? 4.5 : 6} fill={hex} stroke="#111" strokeWidth={1.5} />
                                    </g>
                                );
                            })}
                        </svg>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {(Object.keys(STRANDS) as Strand[]).map((k) => (
                                <span key={k} className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STRANDS[k].hex }} /> {STRANDS[k].name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 16, rotate: -1 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.45, ease: EASE }}
                                className={`rounded-[20px] border-2 border-nb-ink p-5 sm:p-6 shadow-nb ${STRANDS[dominant].color}`}
                            >
                                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-ink/70">Decoded</p>
                                <h3 className="mt-1 font-brico font-extrabold text-3xl tracking-tight">{STRANDS[dominant].title}</h3>
                                <p className="mt-2 text-nb-ink/80 leading-relaxed">{STRANDS[dominant].desc}</p>
                                {match && (
                                    <p className="mt-4 rounded-xl border-2 border-nb-ink bg-white px-4 py-3 text-sm">
                                        Your best match: <strong>{match.name}</strong>
                                        {match.lead?.name ? <> — say hi to <strong>{match.lead.name}</strong>, who leads it.</> : "."}
                                    </p>
                                )}
                                <div className="mt-5 flex flex-wrap gap-2.5">
                                    <Btn href="/join" size="sm">Join {match ? match.name : "the lab"} →</Btn>
                                    <Button size="sm" tone="white" onClick={copy}>
                                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy my DNA"}
                                    </Button>
                                    <Button size="sm" tone="white" onClick={reset}>
                                        <RotateCcw size={14} /> Start over
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-[20px] border-2 border-dashed border-nb-ink/40 p-5 text-sm text-nb-muted"
                            >
                                {name.trim() ? `${3 - answers.filter(Boolean).length} more tap${3 - answers.filter(Boolean).length === 1 ? "" : "s"} to decode your strand…` : "Start by typing your name — the helix is already listening."}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Card>
    );
}
