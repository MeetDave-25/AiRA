"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { Btn, Block, EASE, Mask, MevySays } from "./ui";

const STICKERS: { text: string; className: string; rotate: number; pos: string }[] = [
    { text: "Software", className: "bg-nb-sky", rotate: -12, pos: "left-[0%] top-[20%]" },
    { text: "AI ✦", className: "bg-nb-peach", rotate: 8, pos: "right-[2%] top-[24%]" },
    { text: "Robotics", className: "bg-nb-mint", rotate: -6, pos: "left-[-2%] bottom-[22%]" },
    { text: "Led by LJCCA students", className: "bg-nb-sun", rotate: 10, pos: "right-[0%] bottom-[16%]" },
];

/** The lab "access pass": hangs on a lanyard, swings with the cursor and scroll; Mevy pops out of the photo window. */
function Badge({ ready, stats }: { ready: boolean; stats: { members: number; projects: number } }) {
    const { scrollY } = useScroll();
    const velocity = useVelocity(scrollY);
    const px = useMotionValue(0);
    // Swing = cursor lean + a kick from scroll speed, settled by a spring like a real hanging card.
    const lean = useTransform(px, [-1, 1], [-7, 7]);
    const kick = useTransform(velocity, [-2500, 0, 2500], [9, 0, -9]);
    const swing = useSpring(useTransform(() => lean.get() + kick.get()), { stiffness: 60, damping: 7, mass: 0.8 });

    return (
        <div
            className="relative h-full flex justify-center"
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const r = e.currentTarget.getBoundingClientRect();
                px.set(((e.clientX - r.left) / r.width) * 2 - 1);
            }}
            onPointerLeave={() => px.set(0)}
        >
            <motion.div
                initial={{ y: "-130%" }}
                animate={{ y: ready ? "0%" : "-130%" }}
                transition={{ type: "spring", stiffness: 55, damping: 11, delay: 0.25 }}
                style={{ rotate: swing }}
                className="relative origin-top pt-0 flex flex-col items-center"
            >
                {/* Lanyard */}
                <span aria-hidden="true" className="block w-5 h-[18vh] min-h-[90px] bg-nb-violet border-x-2 border-nb-ink [background-image:repeating-linear-gradient(0deg,transparent_0_10px,rgba(255,255,255,0.25)_10px_12px)]" />
                <span aria-hidden="true" className="block w-9 h-6 -mt-1 rounded-md border-2 border-nb-ink bg-[#C9C9C9] shadow-nb-sm" />

                {/* Card */}
                <div className="relative -mt-1 w-[300px] sm:w-[340px] rounded-[26px] border-2 border-nb-ink bg-nb-lilac shadow-nb-lg p-4 pt-3">
                    <span aria-hidden="true" className="block mx-auto w-16 h-3 rounded-full border-2 border-nb-ink bg-nb-paper" />
                    <div className="mt-3 flex items-center justify-between rounded-xl border-2 border-nb-ink bg-nb-ink text-white px-3 py-2">
                        <span className="font-brico font-extrabold tracking-tight">AiRA LAB</span>
                        <span className="font-mono text-[10px] tracking-[0.14em]">ACCESS PASS</span>
                    </div>

                    {/* Photo window — the cutout is taller than the window so the head breaks out of the frame */}
                    <div className="relative mt-20 h-[210px] sm:h-[230px] rounded-2xl border-2 border-nb-ink bg-nb-violet [background-image:radial-gradient(rgba(255,255,255,0.25)_1.5px,transparent_1.5px)] [background-size:14px_14px]">
                        <div className="absolute inset-0 overflow-hidden rounded-[14px]" aria-hidden="true">
                            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-56 h-40 rounded-full bg-white/25 blur-2xl" />
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/mevy-cutout.webp"
                            alt="Mevy, the AiRA Lab mascot and AI guide"
                            width={526}
                            height={988}
                            fetchPriority="high"
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[136%] w-auto max-w-none [clip-path:inset(0_0_0_0_round_0_0_14px_14px)] drop-shadow-[4px_6px_0_rgba(17,17,17,0.9)]"
                        />
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <p className="font-brico font-extrabold text-3xl tracking-tight leading-none">MEVY</p>
                            <p className="mt-1 text-sm font-medium text-nb-ink/70">Lab guide · AI</p>
                        </div>
                        <div className="text-right font-mono text-[10px] leading-relaxed uppercase">
                            <p>ID AIRA-0001</p>
                            <p>{stats.members || "—"} members</p>
                            <p>{stats.projects || "—"} projects</p>
                        </div>
                    </div>
                    <div
                        aria-hidden="true"
                        className="mt-3 h-9 rounded-md border-2 border-nb-ink bg-white [background-image:repeating-linear-gradient(90deg,#111_0_2px,transparent_2px_4px,#111_4px_5px,transparent_5px_9px,#111_9px_12px,transparent_12px_14px)]"
                    />
                </div>
            </motion.div>
        </div>
    );
}

export default function Hero({
    ready,
    onReplayIntro,
    stats,
}: {
    ready: boolean;
    onReplayIntro: () => void;
    stats: { members: number; projects: number };
}) {
    const ref = useRef<HTMLElement>(null);

    return (
        <section
            ref={ref}
            aria-label="AiRA Lab"
            className="relative overflow-hidden bg-nb-paper text-nb-ink [background-image:linear-gradient(rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:32px_32px]"
        >
            <div className={`relative px-5 sm:px-8 lg:px-12 max-w-[1360px] mx-auto pt-28 sm:pt-32 pb-16 lg:min-h-[100svh] grid lg:grid-cols-12 gap-12 lg:gap-8 items-center`}>
                <div className="lg:col-span-7 relative z-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ delay: 1.1, duration: 0.6 }}>
                        <MevySays>Hey, I&apos;m Mevy — welcome to our community! Scroll and I&apos;ll show you around.</MevySays>
                    </motion.div>

                    <h1 className="mt-8 font-brico font-extrabold tracking-[-0.04em] leading-[1.04] text-[clamp(2.6rem,5.6vw,5.6rem)]">
                        <span className="sr-only">AiRA Lab — </span>
                        <Mask play={ready} delay={0.1}>
                            A student-led
                        </Mask>
                        <Mask play={ready} delay={0.18}>
                            <span className="relative inline-block">
                                community
                                <svg aria-hidden="true" viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute left-0 -bottom-[0.08em] w-full h-[0.22em]">
                                    <motion.path
                                        d="M2 14 C 40 4, 80 18, 120 8 S 180 6, 198 12"
                                        fill="none"
                                        stroke="#6C5CE7"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: ready ? 1 : 0 }}
                                        transition={{ duration: 0.9, delay: 1, ease: EASE }}
                                    />
                                </svg>
                            </span>{" "}
                            that
                        </Mask>
                        <Mask play={ready} delay={0.26}>
                            builds{" "}
                            <Block color="bg-nb-sky" tilt={-2}>
                                software
                            </Block>
                            ,
                        </Mask>
                        <Mask play={ready} delay={0.34}>
                            <Block color="bg-nb-peach" tilt={3}>
                                AI
                            </Block>{" "}
                            &amp;{" "}
                            <Block color="bg-nb-mint" tilt={-2}>
                                robotics
                            </Block>
                            .
                        </Mask>
                    </h1>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}>
                        <p className="mt-8 max-w-lg text-lg text-nb-muted leading-relaxed">
                            AiRA Lab is a student-led community at L J College of Computer Application, Ahmedabad. Students team up to ship software,
                            train AI models and build robots — mentored by faculty, run by students.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Btn href="/join">Join the community →</Btn>
                            <Btn href="/projects" tone="white">
                                See what we built
                            </Btn>
                            <button type="button" onClick={onReplayIntro} className="font-mono text-xs uppercase tracking-[0.14em] text-nb-muted hover:text-nb-ink underline underline-offset-4">
                                ▶ Replay intro
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-5 relative h-[620px] sm:h-[680px] lg:h-[100svh] lg:-mt-32">
                    <Badge ready={ready} stats={stats} />
                    {/* Draggable stickers — go on, move them */}
                    {STICKERS.map((s, i) => (
                        <motion.button
                            type="button"
                            key={s.text}
                            drag
                            dragConstraints={ref}
                            dragElastic={0.2}
                            whileDrag={{ scale: 1.12, rotate: 0, cursor: "grabbing" }}
                            whileHover={{ scale: 1.06 }}
                            initial={{ opacity: 0, scale: 0.5, rotate: s.rotate }}
                            animate={ready ? { opacity: 1, scale: 1, rotate: s.rotate } : {}}
                            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 1.2 + i * 0.12 }}
                            className={`absolute ${s.pos} z-20 cursor-grab touch-none select-none whitespace-nowrap rounded-xl border-2 border-nb-ink px-4 py-2 font-brico font-extrabold text-lg shadow-nb ${s.className}`}
                        >
                            {s.text}
                        </motion.button>
                    ))}
                    <p className="hidden lg:block absolute bottom-8 right-0 font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">↖ psst, drag the stickers</p>
                </div>
            </div>
        </section>
    );
}
