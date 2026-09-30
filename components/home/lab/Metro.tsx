"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { STATIONS } from "./data";
import { EASE, SectionHead, WRAP } from "./ui";

// Metro-map style route: straight runs joined by 45° bends. viewBox is 1200 × 360.
const ROUTE = "M 40 250 H 330 L 430 150 H 760 L 860 250 H 1160";
const STOP_AT = [0.04, 0.36, 0.64, 0.96]; // where each station sits along the route (fraction of its length)

function Desktop() {
    const ref = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const draw = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);
    const [stops, setStops] = useState<{ x: number; y: number }[]>([]);
    const [train, setTrain] = useState({ x: 40, y: 250, a: 0 });
    const [active, setActive] = useState(0);

    useEffect(() => {
        const p = pathRef.current;
        if (!p) return;
        const len = p.getTotalLength();
        setStops(STOP_AT.map((f) => p.getPointAtLength(f * len)));
    }, []);

    useMotionValueEvent(draw, "change", (v) => {
        const p = pathRef.current;
        if (!p) return;
        const len = p.getTotalLength();
        const at = Math.max(0.001, Math.min(0.999, v)) * len;
        const pt = p.getPointAtLength(at);
        const ahead = p.getPointAtLength(Math.min(len, at + 2));
        setTrain({ x: pt.x, y: pt.y, a: (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI });
        let idx = 0;
        STOP_AT.forEach((f, i) => v >= f - 0.02 && (idx = i));
        setActive(idx);
    });

    const s = STATIONS[active];

    return (
        <div ref={ref} className="relative h-[300vh]">
            <div className="sticky top-0 h-[100svh] flex flex-col justify-center overflow-hidden">
                <div className={`${WRAP} w-full`}>
                    <div className="relative aspect-[1200/360] w-full">
                        <svg viewBox="0 0 1200 360" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
                            {/* Track bed + planned route */}
                            <path d={ROUTE} fill="none" stroke="#111" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                            <path d={ROUTE} fill="none" stroke="#F3EFE4" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 14" />
                            {/* Travelled route */}
                            <motion.path
                                ref={pathRef}
                                d={ROUTE}
                                fill="none"
                                stroke="#6C5CE7"
                                strokeWidth="14"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ pathLength: draw }}
                            />
                            {stops.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r={i <= active ? 20 : 16} fill={i <= active ? "#FFD84D" : "#fff"} stroke="#111" strokeWidth="5" style={{ transition: "all .4s" }} />
                                </g>
                            ))}
                            {/* The train */}
                            <g transform={`translate(${train.x} ${train.y}) rotate(${train.a})`}>
                                <rect x={-34} y={-17} width={68} height={34} rx={10} fill="#111" />
                                <rect x={-30} y={-13} width={60} height={26} rx={7} fill="#6C5CE7" />
                                <text x={0} y={5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff" fontFamily="var(--font-brico)">
                                    AiRA
                                </text>
                            </g>
                        </svg>

                        {/* Station labels, positioned in the same coordinate space */}
                        {stops.map((p, i) => (
                            <div
                                key={i}
                                className="absolute -translate-x-1/2 text-center"
                                style={{ left: `${(p.x / 1200) * 100}%`, top: `${(p.y / 360) * 100}%`, transform: `translate(-50%, ${p.y < 200 ? "-165%" : "60%"})` }}
                            >
                                <p className={`font-brico font-extrabold text-3xl tracking-tight transition-colors ${i <= active ? "text-nb-ink" : "text-nb-ink/25"}`}>{STATIONS[i].year}</p>
                                <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${i <= active ? "text-nb-violet" : "text-nb-muted/50"}`}>{STATIONS[i].name}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={{ opacity: 0, y: 24, rotate: -2 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, y: -16, rotate: 2 }}
                                transition={{ duration: 0.45, ease: EASE }}
                                className="max-w-xl w-full rounded-2xl border-2 border-nb-ink bg-white shadow-nb-lg p-6"
                            >
                                <p className="font-mono text-xs uppercase tracking-[0.14em] text-nb-violet">
                                    Stop {active + 1} / {STATIONS.length} · {s.year}
                                </p>
                                <h3 className="mt-2 font-brico font-extrabold text-3xl tracking-tight">{s.title}</h3>
                                <p className="mt-2 text-nb-muted leading-relaxed">{s.desc}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Mobile() {
    return (
        <div className={`${WRAP} relative mt-12 pb-24`}>
            <span aria-hidden="true" className="absolute left-[calc(1.25rem+13px)] sm:left-[calc(2rem+13px)] top-2 bottom-24 w-[10px] bg-nb-violet border-x-2 border-nb-ink" />
            <div className="space-y-8">
                {STATIONS.map((s, i) => (
                    <motion.div
                        key={s.year}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="relative pl-14"
                    >
                        <span aria-hidden="true" className="absolute left-0 top-3 w-9 h-9 rounded-full border-[3px] border-nb-ink bg-nb-sun" />
                        <div className="rounded-2xl border-2 border-nb-ink bg-white shadow-nb p-5">
                            <p className="font-brico font-extrabold text-3xl tracking-tight">{s.year}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-nb-violet">{s.name}</p>
                            <h3 className="mt-2 font-brico font-bold text-xl">{s.title}</h3>
                            <p className="mt-1 text-nb-muted text-sm leading-relaxed">{s.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function Metro() {
    const [wide, setWide] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const set = () => setWide(mq.matches);
        set();
        mq.addEventListener("change", set);
        return () => mq.removeEventListener("change", set);
    }, []);

    return (
        <section id="journey" aria-label="Our journey" className="bg-nb-paper text-nb-ink pt-10">
            <div className={WRAP}>
                <SectionHead says="All aboard. This is the route we've taken so far — one stop per year." kicker="The AiRA line" title="Next stop: you." />
            </div>
            {wide ? <Desktop /> : <Mobile />}
        </section>
    );
}
