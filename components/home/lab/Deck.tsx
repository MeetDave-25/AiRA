"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { FRONTIERS, type Frontier } from "./data";
import { EASE, SectionHead, WRAP } from "./ui";

function CardFace({ f, i }: { f: Frontier; i: number }) {
    const Icon = f.icon;
    return (
        <div className={`h-full rounded-[24px] border-2 border-nb-ink shadow-nb-lg p-6 sm:p-7 flex flex-col justify-between ${f.color}`}>
            <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm">
                    <Icon size={22} />
                </span>
                <span className="font-brico font-extrabold text-5xl tracking-tight text-nb-ink/20">0{i + 1}</span>
            </div>
            <div>
                <h3 className="font-brico font-extrabold tracking-[-0.03em] leading-[0.95] text-[clamp(1.8rem,3vw,2.75rem)]">{f.title}</h3>
                <p className="mt-3 text-nb-ink/75 leading-relaxed max-w-md">{f.line}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {f.tags.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-full border-2 border-nb-ink bg-white text-xs font-bold">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Where each card lands in the 2×2 grid (as a % of its own size) and the tilt it starts with in the deck.
const SLOTS = [
    { x: -53, y: -53, from: -7 },
    { x: 53, y: -53, from: 4 },
    { x: -53, y: 53, from: -3 },
    { x: 53, y: 53, from: 6 },
];

function DealtCard({ f, i, progress }: { f: Frontier; i: number; progress: MotionValue<number> }) {
    const s = SLOTS[i];
    // Cards leave the deck one after another, top card (01) first.
    const start = 0.08 + i * 0.1;
    const end = start + 0.32;
    const x = useTransform(progress, [start, end], ["0%", `${s.x}%`]);
    const y = useTransform(progress, [start, end], [`${-i * 1.2}%`, `${s.y}%`]);
    const rotate = useTransform(progress, [start, end], [s.from, i % 2 ? 1.5 : -1.5]);
    return (
        <motion.div style={{ x, y, rotate, zIndex: 20 - i }} className="absolute left-1/2 top-1/2 -ml-[min(20vw,280px)] -mt-[min(17vh,165px)] w-[min(40vw,560px)] h-[min(34vh,330px)]">
            <CardFace f={f} i={i} />
        </motion.div>
    );
}

export default function Deck() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    const [wide, setWide] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const set = () => setWide(mq.matches);
        set();
        mq.addEventListener("change", set);
        return () => mq.removeEventListener("change", set);
    }, []);

    return (
        <section id="frontiers" aria-label="What we build" className="bg-nb-paper text-nb-ink pt-24 sm:pt-32">
            <div className={WRAP}>
                <SectionHead says="Here's what our community builds. Keep scrolling — I'll deal them out." kicker="What we build" title="Software, AI & robotics." />
            </div>

            {wide ? (
                <div ref={ref} className="relative h-[260vh]">
                    <div className="sticky top-0 h-[100svh] overflow-hidden">
                        {/* The deck, reversed so card 01 sits on top */}
                        {[...FRONTIERS].map((f, i) => ({ f, i })).reverse().map(({ f, i }) => (
                            <DealtCard key={f.id} f={f} i={i} progress={scrollYProgress} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className={`${WRAP} mt-12 pb-24 grid gap-6`}>
                    {FRONTIERS.map((f, i) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
                            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
                            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                            transition={{ duration: 0.7, ease: EASE }}
                            className="min-h-[300px]"
                        >
                            <CardFace f={f} i={i} />
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
}
