"use client";

// Landing intro: the visitor writes "AiRA" over a dotted guide with their cursor or finger.
// Once most of the guide is traced (or "Write it for me" / idle auto-writes it), the word
// snaps clean and the page slides up to reveal the homepage. Shown once per session.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PenLine } from "lucide-react";

const SEEN_KEY = "aira_write_intro_seen";
const DONE_AT = 0.7; // fraction of the guide that must be traced
const HIT_RADIUS = 15; // viewBox units around a guide point that count as "traced"
const IDLE_AUTO_MS = 4500;

// Monoline letter strokes in writing order (viewBox 0 0 370 120).
const STROKES = [
    "M10 110 L55 10 L100 110", // A
    "M28 72 L82 72",
    "M135 48 L135 110", // i
    "M135 19 L135 25",
    "M172 110 L172 10", // R
    "M172 10 L208 10 C246 10 246 62 208 62 L172 62",
    "M202 62 L246 110",
    "M262 110 L307 10 L352 110", // A
    "M280 72 L334 72",
];

type Pt = { x: number; y: number };
type Phase = "write" | "auto" | "done" | "reveal";

export default function WriteIntro({ onComplete, forceShow = false }: { onComplete?: () => void; forceShow?: boolean }) {
    const [show, setShow] = useState(false);
    const [phase, setPhase] = useState<Phase>("write");
    const [progress, setProgress] = useState(0);
    const [ink, setInk] = useState<string[]>([]); // finished user strokes as path data
    const [live, setLive] = useState<string>(""); // stroke being drawn
    const [pen, setPen] = useState<Pt | null>(null);

    const svgRef = useRef<SVGSVGElement>(null);
    const guideRefs = useRef<(SVGPathElement | null)[]>([]);
    const finalRefs = useRef<(SVGPathElement | null)[]>([]);
    const samples = useRef<{ p: Pt; hit: boolean }[]>([]);
    const drawing = useRef<Pt[] | null>(null);
    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const doneRef = useRef(false);

    // Show once per session unless replay is requested.
    useEffect(() => {
        let seen = false;
        try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* storage blocked */ }
        if (forceShow || !seen) {
            doneRef.current = false;
            setPhase("write");
            setProgress(0);
            setInk([]);
            setLive("");
            setShow(true);
        } else {
            onComplete?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceShow]);

    const finish = useCallback(() => {
        try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
        setShow(false);
        onComplete?.();
    }, [onComplete]);

    // Lock page scroll while the intro is up.
    useEffect(() => {
        if (!show) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [show]);

    // Sample points along the guide once it's mounted.
    useEffect(() => {
        if (!show) return;
        const pts: { p: Pt; hit: boolean }[] = [];
        guideRefs.current.forEach((path) => {
            if (!path) return;
            const len = path.getTotalLength();
            const steps = Math.max(2, Math.round(len / 6));
            for (let i = 0; i <= steps; i++) {
                const q = path.getPointAtLength((i / steps) * len);
                pts.push({ p: { x: q.x, y: q.y }, hit: false });
            }
        });
        samples.current = pts;
    }, [show]);

    const complete = useCallback(() => {
        if (doneRef.current) return;
        doneRef.current = true;
        if (idleTimer.current) clearTimeout(idleTimer.current);
        setProgress(1);
        setPen(null);
        setPhase("done");
        setTimeout(() => setPhase("reveal"), 1100);
    }, []);

    // Auto-write: a pen draws each stroke in order.
    const autoWrite = useCallback(() => {
        if (doneRef.current) return;
        setPhase("auto");
        const paths = finalRefs.current.filter(Boolean) as SVGPathElement[];
        const lens = paths.map((p) => p.getTotalLength());
        const total = lens.reduce((a, b) => a + b, 0);
        paths.forEach((p, i) => { p.style.strokeDasharray = `${lens[i]}`; p.style.strokeDashoffset = `${lens[i]}`; });
        const duration = 2400;
        const start = performance.now();
        const tick = (now: number) => {
            if (doneRef.current) return;
            const t = Math.min(1, (now - start) / duration);
            let remaining = t * total;
            let tip: Pt | null = null;
            paths.forEach((p, i) => {
                const drawn = Math.max(0, Math.min(lens[i], remaining));
                p.style.strokeDashoffset = `${lens[i] - drawn}`;
                if (drawn > 0 && drawn < lens[i]) {
                    const q = p.getPointAtLength(drawn);
                    tip = { x: q.x, y: q.y };
                }
                remaining -= lens[i];
            });
            setPen(tip);
            setProgress(t);
            if (t < 1) requestAnimationFrame(tick);
            else complete();
        };
        requestAnimationFrame(tick);
    }, [complete]);

    // Nobody writing? Help them out.
    const armIdle = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => { if (!drawing.current) autoWrite(); }, IDLE_AUTO_MS);
    }, [autoWrite]);

    useEffect(() => {
        if (!show) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            const t = setTimeout(finish, 600);
            return () => clearTimeout(t);
        }
        armIdle();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [show, armIdle, finish]);

    // Reveal → hand over to the homepage.
    useEffect(() => {
        if (phase !== "reveal") return;
        const t = setTimeout(finish, 900);
        return () => clearTimeout(t);
    }, [phase, finish]);

    const toSvg = (e: React.PointerEvent): Pt | null => {
        const svg = svgRef.current;
        const ctm = svg?.getScreenCTM();
        if (!svg || !ctm) return null;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const q = pt.matrixTransform(ctm.inverse());
        return { x: q.x, y: q.y };
    };

    const markHits = (p: Pt) => {
        let hits = 0;
        for (const s of samples.current) {
            if (!s.hit && Math.hypot(s.p.x - p.x, s.p.y - p.y) < HIT_RADIUS) s.hit = true;
            if (s.hit) hits++;
        }
        const frac = samples.current.length ? hits / samples.current.length : 0;
        setProgress(frac);
        if (frac >= DONE_AT) complete();
    };

    const toPath = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

    const onDown = (e: React.PointerEvent) => {
        if (phase !== "write") return;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        const p = toSvg(e);
        if (!p) return;
        if (idleTimer.current) clearTimeout(idleTimer.current);
        drawing.current = [p];
        setLive(toPath([p, { x: p.x + 0.1, y: p.y }]));
        markHits(p);
    };
    const onMove = (e: React.PointerEvent) => {
        const p = toSvg(e);
        if (!p) return;
        if (phase === "write") setPen(p);
        if (!drawing.current || phase !== "write") return;
        const last = drawing.current[drawing.current.length - 1];
        if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
        // Fill the gap so fast strokes still count.
        const steps = Math.ceil(Math.hypot(p.x - last.x, p.y - last.y) / 6);
        for (let i = 1; i <= steps; i++) markHits({ x: last.x + ((p.x - last.x) * i) / steps, y: last.y + ((p.y - last.y) * i) / steps });
        drawing.current.push(p);
        setLive(toPath(drawing.current));
    };
    const onUp = () => {
        // Snapshot the stroke before clearing it; the state updater runs later.
        const stroke = drawing.current;
        drawing.current = null;
        if (stroke && stroke.length) {
            const d = toPath(stroke);
            setInk((prev) => [...prev, d]);
        }
        setLive("");
        if (phase === "write") armIdle();
    };

    const showFinal = phase === "auto" || phase === "done" || phase === "reveal";

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="write-intro"
                    className="fixed inset-0 z-[100002] bg-nb-paper text-nb-ink overflow-hidden select-none [background-image:linear-gradient(rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
                    initial={{ y: 0 }}
                    animate={{ y: phase === "reveal" ? "-100%" : 0 }}
                    transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
                    exit={{ opacity: 0 }}
                >
                    {/* Top bar */}
                    <div className="absolute top-0 inset-x-0 px-5 sm:px-10 py-5 flex items-center justify-between gap-3">
                        <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1 font-brico font-extrabold text-xs sm:text-sm shadow-[3px_3px_0_0_#111]">
                            <span className="w-2 h-2 rounded-full bg-nb-mint border border-nb-ink" /> Led by LJCCA Students
                        </span>
                        <button
                            type="button"
                            onClick={finish}
                            className="rounded-lg border-2 border-nb-ink bg-white px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] shadow-[2px_2px_0_0_#111] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                            Skip ›
                        </button>
                    </div>

                    {/* Prompt */}
                    <div className="absolute inset-x-0 top-[13vh] sm:top-[15vh] px-5 text-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={phase === "done" || phase === "reveal" ? "done" : phase}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="font-brico font-extrabold tracking-[-0.03em] text-[clamp(1.6rem,4.5vw,3rem)]"
                            >
                                {phase === "write" && <>Leave your mark — <span className="text-nb-violet">write AiRA.</span></>}
                                {phase === "auto" && <>Here, let me write it for you…</>}
                                {(phase === "done" || phase === "reveal") && <>Beautiful. Come on in.</>}
                            </motion.p>
                        </AnimatePresence>
                        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-nb-muted">
                            Trace the dotted letters with your {typeof window !== "undefined" && "ontouchstart" in window ? "finger" : "cursor"}
                        </p>
                    </div>

                    {/* Writing pad */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-4">
                        <div className="relative w-[min(92vw,880px)]">
                            <svg
                                ref={svgRef}
                                viewBox="-10 -12 390 144"
                                className="w-full h-auto touch-none cursor-crosshair"
                                onPointerDown={onDown}
                                onPointerMove={onMove}
                                onPointerUp={onUp}
                                onPointerCancel={onUp}
                                onPointerLeave={() => { onUp(); if (phase === "write") setPen(null); }}
                                role="img"
                                aria-label="Write the word AiRA"
                            >
                                {/* Dotted guide */}
                                {STROKES.map((d, i) => (
                                    <path
                                        key={`g${i}`}
                                        ref={(el) => { guideRefs.current[i] = el; }}
                                        d={d}
                                        fill="none"
                                        stroke="rgba(17,17,17,0.35)"
                                        strokeWidth={5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray="0.1 10"
                                        opacity={showFinal ? 0.35 : 1}
                                    />
                                ))}

                                {/* Visitor's ink */}
                                <g opacity={phase === "done" || phase === "reveal" ? 0 : 1} style={{ transition: "opacity .4s" }}>
                                    {[...ink, live].filter(Boolean).map((d, i) => (
                                        <path key={`u${i}`} d={d} fill="none" stroke="#6C5CE7" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
                                    ))}
                                </g>

                                {/* Clean word: hard shadow + violet stroke */}
                                <g opacity={showFinal ? 1 : 0}>
                                    {STROKES.map((d, i) => (
                                        <path key={`s${i}`} d={d} transform="translate(4 4)" fill="none" stroke="#111" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round"
                                            opacity={phase === "done" || phase === "reveal" ? 1 : 0} style={{ transition: "opacity .3s" }} />
                                    ))}
                                    {STROKES.map((d, i) => (
                                        <path
                                            key={`f${i}`}
                                            ref={(el) => { finalRefs.current[i] = el; }}
                                            d={d}
                                            fill="none"
                                            stroke={phase === "done" || phase === "reveal" ? "#6C5CE7" : "#111"}
                                            strokeWidth={15}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={phase === "done" || phase === "reveal" ? { strokeDashoffset: 0, transition: "stroke .3s" } : undefined}
                                        />
                                    ))}
                                </g>

                                {/* Pen tip */}
                                {pen && (phase === "write" || phase === "auto") && (
                                    <g transform={`translate(${pen.x} ${pen.y})`} pointerEvents="none">
                                        <circle r={7} fill="#FFD84D" stroke="#111" strokeWidth={2.5} />
                                    </g>
                                )}
                            </svg>

                            {/* Done sticker */}
                            <AnimatePresence>
                                {(phase === "done" || phase === "reveal") && (
                                    <motion.span
                                        initial={{ scale: 2.4, opacity: 0, rotate: 0 }}
                                        animate={{ scale: 1, opacity: 1, rotate: -10 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                        className="absolute -right-1 sm:right-2 -bottom-6 sm:-bottom-4 rounded-xl border-[3px] border-nb-ink bg-nb-mint px-3 py-1.5 font-brico font-extrabold text-base sm:text-xl shadow-[4px_4px_0_0_#111]"
                                    >
                                        ✓ Welcome in
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Bottom: progress + help */}
                    <div className="absolute inset-x-0 bottom-0 px-5 sm:px-10 pb-7 sm:pb-9">
                        <div className="max-w-xl mx-auto flex flex-col items-center gap-4">
                            <div className="w-full h-4 rounded-full border-2 border-nb-ink bg-white overflow-hidden shadow-[3px_3px_0_0_#111]">
                                <div className="h-full bg-nb-sun border-r-2 border-nb-ink transition-[width] duration-150" style={{ width: `${Math.round(Math.min(1, progress / DONE_AT) * 100)}%` }} />
                            </div>
                            <button
                                type="button"
                                onClick={autoWrite}
                                disabled={phase !== "write"}
                                className="inline-flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-nb-violet px-4 py-2.5 font-brico font-bold text-white shadow-[4px_4px_0_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#111] transition-all disabled:opacity-0 disabled:pointer-events-none"
                            >
                                <PenLine size={16} /> Write it for me
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
