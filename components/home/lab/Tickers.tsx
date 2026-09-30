"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity, wrap } from "framer-motion";
import { MevySays, WRAP } from "./ui";

/** Endless band that drifts on its own and speeds up / reverses with scroll speed. */
function Band({ items, base, className, tilt }: { items: string[]; base: number; className: string; tilt: number }) {
    const x = useMotionValue(0);
    const { scrollY } = useScroll();
    const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
    const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
    const dir = useRef(1);
    useAnimationFrame((_, delta) => {
        let move = dir.current * base * (delta / 1000);
        if (factor.get() < 0) dir.current = -1;
        else if (factor.get() > 0) dir.current = 1;
        move += dir.current * move * factor.get();
        x.set(wrap(-50, 0, x.get() + move));
    });
    const tx = useTransform(x, (v) => `${v}%`);
    const row = items.join("  ✺  ") + "  ✺  ";
    return (
        <div className={`border-y-2 border-nb-ink overflow-hidden whitespace-nowrap ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
            <motion.div style={{ x: tx }} className="flex w-max py-4 sm:py-5 font-brico font-extrabold uppercase tracking-tight text-[clamp(1.6rem,4vw,3.4rem)]">
                <span className="pr-6">{row.repeat(3)}</span>
                <span className="pr-6">{row.repeat(3)}</span>
            </motion.div>
        </div>
    );
}

export default function Tickers({ stats, projects, loading }: { stats: { events: number; members: number; participants: number }; projects: number; loading: boolean }) {
    const n = (v: number, suffix = "") => (loading ? "—" : `${v}${suffix}`);
    const a = [`${n(stats.members)} members`, `${n(stats.participants, "+")} participants`, `${n(projects)} projects shipped`];
    const b = ["Student-led", "4 wings", `${n(stats.events)} events hosted`, "Est. 2023", "Ahmedabad"];
    return (
        <section aria-label="The lab in numbers" className="bg-nb-paper text-nb-ink py-24 sm:py-32 overflow-hidden">
            <div className={WRAP}>
                <MevySays>Run by students, powered by community. Scroll faster and watch these go.</MevySays>
            </div>
            <div className="relative mt-16 -mx-4">
                <Band items={a} base={-2.2} tilt={-3} className="bg-nb-ink text-nb-paper relative z-10" />
                <Band items={b} base={1.8} tilt={2} className="bg-nb-sun text-nb-ink -mt-3" />
            </div>
        </section>
    );
}
