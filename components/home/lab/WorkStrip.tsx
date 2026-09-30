"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isVideoMedia } from "@/lib/media";
import { Btn, SectionHead, WRAP } from "./ui";

export type WorkItem = { id: string; href: string; title: string; tag: string; img?: string; color: string };

const COLORS = ["bg-nb-sky", "bg-nb-peach", "bg-nb-mint", "bg-nb-lilac", "bg-nb-sun"];

export function toWorkItems(events: any[], projects: any[]): WorkItem[] {
    const pr = projects.map((p) => ({ id: `p-${p.id}`, href: `/projects/${p.id}`, title: p.title, tag: p.category || "Project", img: p.coverImage || undefined }));
    const ev = events.map((e) => {
        const m = e.images?.find((x: any) => x.isPrimary) || e.images?.[0];
        return { id: `e-${e.id}`, href: `/events/${e.id}`, title: e.title, tag: "Event", img: m && !isVideoMedia(m) ? m.url : undefined };
    });
    const mixed: Omit<WorkItem, "color">[] = [];
    for (let i = 0; i < Math.max(pr.length, ev.length); i++) {
        if (pr[i]) mixed.push(pr[i]);
        if (ev[i]) mixed.push(ev[i]);
    }
    return mixed.slice(0, 10).map((m, i) => ({ ...m, color: COLORS[i % COLORS.length] }));
}

export default function WorkStrip({ items }: { items: WorkItem[] }) {
    const rail = useRef<HTMLDivElement>(null);
    if (items.length === 0) return null;
    return (
        <section id="work" aria-label="Built and shipped" className="bg-nb-paper text-nb-ink py-24 sm:py-32 overflow-hidden">
            <div className={`${WRAP} flex flex-col md:flex-row md:items-end justify-between gap-6`}>
                <SectionHead says="Here's some stuff we've shipped. Grab the row and fling it." kicker="Built & shipped" title="Proof of work." />
                <Btn href="/projects" tone="white">
                    All projects →
                </Btn>
            </div>

            <div ref={rail} className="mt-14 px-5 sm:px-8 lg:px-12">
                <motion.div drag="x" dragConstraints={rail} dragElastic={0.12} className="flex gap-6 w-max cursor-grab active:cursor-grabbing py-4">
                    {items.map((it, i) => (
                        <motion.div
                            key={it.id}
                            initial={{ opacity: 0, y: 60, rotate: 0 }}
                            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 2 : -2 }}
                            whileHover={{ rotate: 0, y: -8 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: Math.min(i, 5) * 0.05 }}
                            className="w-[270px] sm:w-[300px] shrink-0"
                        >
                            <Link href={it.href} draggable={false} className="block rounded-[22px] border-2 border-nb-ink bg-white shadow-nb-lg overflow-hidden">
                                <div className={`relative aspect-[4/3] border-b-2 border-nb-ink ${it.color}`}>
                                    {it.img ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={it.img} alt="" draggable={false} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <span className="absolute inset-0 flex items-center justify-center font-brico font-extrabold text-6xl text-nb-ink/20 select-none">
                                            {it.title.slice(0, 2)}
                                        </span>
                                    )}
                                    <span className="absolute top-3 left-3 rounded-full border-2 border-nb-ink bg-white px-2.5 py-0.5 text-[11px] font-bold">{it.tag}</span>
                                </div>
                                <div className="p-4 flex items-center justify-between gap-3">
                                    <p className="font-brico font-extrabold text-xl tracking-tight leading-tight line-clamp-2">{it.title}</p>
                                    <span className="shrink-0 w-9 h-9 rounded-full border-2 border-nb-ink bg-nb-sun flex items-center justify-center font-bold">→</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
            <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">← drag →</p>
        </section>
    );
}
