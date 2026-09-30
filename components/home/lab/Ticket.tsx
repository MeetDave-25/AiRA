"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TEAMS } from "./data";
import { Btn, MevySays, WRAP } from "./ui";

// Semicircle notches on both long edges, like a torn-off ticket.
const NOTCHES =
    "radial-gradient(circle at 0 50%, transparent 22px, #000 23px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 22px, #000 23px) right / 51% 100% no-repeat";

export default function Ticket() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
    const rotate = useTransform(scrollYProgress, [0, 1], [-6, -1.5]);
    const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
    // Mevy drops onto the ticket's corner as it arrives.
    const mevyY = useTransform(scrollYProgress, [0.35, 1], ["-60%", "0%"]);
    const mevyRotate = useTransform(scrollYProgress, [0.35, 1], [-18, 6]);

    return (
        <section ref={ref} id="join" aria-label="Join AiRA Lab" className="bg-nb-paper text-nb-ink pt-16 pb-32 sm:pb-40 overflow-hidden">
            <div className={WRAP}>
                <MevySays>Last stop. This one&apos;s yours — I saved you a seat.</MevySays>

                <motion.div style={{ rotate, y }} className="relative mt-44 lg:mt-14 lg:mr-40">
                    <div className="relative drop-shadow-[8px_8px_0_#111]">
                        <div className="rounded-[28px] border-2 border-nb-ink bg-nb-violet text-white grid md:grid-cols-[1fr_auto] overflow-hidden" style={{ mask: NOTCHES, WebkitMask: NOTCHES }}>
                            <div className="p-7 sm:p-12">
                                <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/70">Admit one · Member · Cohort 2026</p>
                                <h2 className="mt-4 font-brico font-extrabold tracking-[-0.04em] leading-[0.92] text-[clamp(2.8rem,7vw,6.5rem)]">
                                    Your seat in the
                                    <br />
                                    community is open.
                                </h2>
                                <dl className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl font-mono text-xs uppercase tracking-[0.12em]">
                                    <div className="border-t-2 border-white/40 pt-2">
                                        <dt className="text-white/60">Passenger</dt>
                                        <dd className="mt-1 font-brico normal-case tracking-normal text-lg font-bold">You</dd>
                                    </div>
                                    <div className="border-t-2 border-white/40 pt-2">
                                        <dt className="text-white/60">Platform</dt>
                                        <dd className="mt-1 font-brico normal-case tracking-normal text-lg font-bold">{TEAMS.join(" · ")}</dd>
                                    </div>
                                    <div className="border-t-2 border-white/40 pt-2">
                                        <dt className="text-white/60">Requires</dt>
                                        <dd className="mt-1 font-brico normal-case tracking-normal text-lg font-bold">Curiosity</dd>
                                    </div>
                                </dl>
                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Btn href="/join" tone="sun">
                                        Claim my seat →
                                    </Btn>
                                    <Btn href="/leadership" tone="white">
                                        Meet the crew
                                    </Btn>
                                </div>
                            </div>
                            {/* Tear-off stub */}
                            <div className="hidden md:flex flex-col items-center justify-between border-l-2 border-dashed border-white/50 px-8 py-10 bg-nb-ink/15">
                                <span className="font-mono text-[11px] uppercase tracking-[0.2em] [writing-mode:vertical-rl] text-white/70">AiRA Lab · LJCCA · Ahmedabad</span>
                                <span className="font-brico font-extrabold text-4xl [writing-mode:vertical-rl] rotate-180">No. 0042</span>
                            </div>
                        </div>
                    </div>

                    <motion.div style={{ y: mevyY, rotate: mevyRotate }} className="pointer-events-none absolute -top-40 right-6 sm:right-16 lg:-right-48 origin-bottom">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/mevy-cutout.webp" alt="" aria-hidden="true" loading="lazy" className="h-40 sm:h-56 lg:h-[420px] w-auto drop-shadow-[6px_8px_0_rgba(17,17,17,0.9)]" />
                    </motion.div>
                </motion.div>
                <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">Questions? info@aira-lab.in — or tap Mevy in the corner.</p>
            </div>
        </section>
    );
}
