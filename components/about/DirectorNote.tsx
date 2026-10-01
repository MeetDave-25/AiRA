"use client";

// "A note from our Director" — first section after the About hero, above the founders.

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { director } from "@/lib/director";
import { EASE } from "@/components/nb/kit";

export default function DirectorNote() {
    return (
        <section aria-labelledby="director-heading" className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Portrait */}
            <motion.figure
                initial={{ opacity: 0, y: 30, rotate: -4 }}
                whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE }}
                className="lg:col-span-5 relative mx-auto w-full max-w-[420px]"
            >
                {/* Tape */}
                <span aria-hidden="true" className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-28 h-7 rotate-[4deg] rounded-sm border-2 border-nb-ink bg-nb-sun/90" />
                <div className="rounded-[26px] border-2 border-nb-ink bg-white p-3 shadow-nb-lg">
                    <div className="relative aspect-[5/6] overflow-hidden rounded-[18px] border-2 border-nb-ink bg-nb-paper">
                        <img
                            src={director.photo}
                            alt={`${director.name}, ${director.title}`}
                            className="w-full h-full object-cover object-[50%_25%]"
                            loading="lazy"
                            decoding="async"
                        />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1 font-brico font-extrabold text-xs shadow-[2px_2px_0_0_#111]">
                            ★ {director.title}
                        </span>
                    </div>
                    <figcaption className="px-2 pt-3 pb-1">
                        <p className="font-brico font-extrabold text-xl leading-tight">{director.name}</p>
                        <p className="text-sm text-nb-muted">
                            {director.title} · {director.org}
                        </p>
                    </figcaption>
                </div>
            </motion.figure>

            {/* The note */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                className="lg:col-span-7"
            >
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">A note from our Director</p>
                <h2 id="director-heading" className="mt-3 font-brico font-extrabold tracking-[-0.04em] leading-[1] text-[clamp(1.9rem,4.2vw,3.4rem)]">
                    <Quote aria-hidden="true" className="inline -mt-2 mr-2 w-[0.8em] h-[0.8em] text-nb-violet" />
                    {director.pullQuote}
                </h2>

                <div className="mt-7 rounded-[22px] border-2 border-nb-ink bg-white p-6 sm:p-8 shadow-nb">
                    <div className="space-y-4 text-[15px] sm:text-base leading-relaxed text-nb-ink/85">
                        {director.message.map((para, i) => (
                            <p key={i} className={i === 0 ? "font-brico font-bold text-nb-ink" : ""}>
                                {para}
                            </p>
                        ))}
                    </div>
                    <div className="mt-6 pt-5 border-t-2 border-nb-ink/10 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-sm text-nb-muted">{director.signOff}</p>
                            <p className="font-brico font-extrabold text-2xl -rotate-1 text-nb-violet">{director.name}</p>
                            <p className="text-sm font-semibold">
                                {director.title}, {director.org}
                            </p>
                        </div>
                        <span className="rounded-xl border-2 border-nb-ink bg-nb-mint px-3 py-1.5 font-brico font-bold text-sm rotate-2 shadow-[2px_2px_0_0_#111]">
                            To every AiRA student ✦
                        </span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
