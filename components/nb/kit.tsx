"use client";

// Neo-brutal UI kit shared by the homepage and every public page:
// warm paper, 2px ink outlines, hard offset shadows, AiRA violet + pastel blocks, Bricolage display type.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useInView } from "framer-motion";
import { Search } from "lucide-react";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const WRAP = "px-5 sm:px-8 lg:px-12 max-w-[1360px] mx-auto";

type Tone = "violet" | "white" | "ink" | "sun";
const TONES: Record<Tone, string> = {
    violet: "bg-nb-violet text-white",
    white: "bg-white text-nb-ink",
    ink: "bg-nb-ink text-white",
    sun: "bg-nb-sun text-nb-ink",
};

export function btnClass(tone: Tone = "violet", size: "md" | "sm" = "md") {
    const pad = size === "sm" ? "px-3.5 py-2 text-sm rounded-lg shadow-nb-sm" : "px-5 py-3 text-[15px] rounded-xl shadow-nb";
    return `inline-flex items-center justify-center gap-2 border-2 border-nb-ink font-brico font-bold transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-nb-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none ${pad} ${TONES[tone]}`;
}

/** Link styled as a brutal button — its hard shadow "presses" into the page. */
export function Btn({ href, children, tone = "violet", size = "md", className = "", external = false }: { href: string; children: React.ReactNode; tone?: Tone; size?: "md" | "sm"; className?: string; external?: boolean }) {
    if (external)
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={`${btnClass(tone, size)} ${className}`}>
                {children}
            </a>
        );
    return (
        <Link href={href} className={`${btnClass(tone, size)} ${className}`}>
            {children}
        </Link>
    );
}

export function Button({ tone = "violet", size = "md", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: "md" | "sm" }) {
    return <button {...props} className={`${btnClass(tone, size)} ${className}`} />;
}

/** Outlined card. `lift` adds the hover press effect for clickable cards. */
export function Card({ children, className = "", color = "bg-white", lift = false }: { children: React.ReactNode; className?: string; color?: string; lift?: boolean }) {
    return (
        <div
            className={`rounded-[22px] border-2 border-nb-ink shadow-nb ${color} ${
                lift ? "transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg" : ""
            } ${className}`}
        >
            {children}
        </div>
    );
}

export function Tag({ children, className = "bg-white" }: { children: React.ReactNode; className?: string }) {
    return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border-2 border-nb-ink text-[11px] font-bold ${className}`}>{children}</span>;
}

/** Filter pill; filled when active. */
export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full border-2 border-nb-ink font-brico font-bold text-sm transition-all ${
                active ? "bg-nb-ink text-nb-paper shadow-none" : "bg-white text-nb-ink shadow-nb-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            }`}
        >
            {children}
        </button>
    );
}

export const inputClass =
    "w-full rounded-xl border-2 border-nb-ink bg-white px-4 py-3 text-[15px] text-nb-ink placeholder:text-nb-muted/70 shadow-nb-sm outline-none transition-shadow focus:shadow-nb focus:ring-0";

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nb-muted" />
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputClass} pl-10`} />
        </div>
    );
}

/** Mevy's speech bubble — the guide's voice. */
export function MevySays({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className={`inline-flex items-end gap-3 ${className}`}
        >
            <span
                aria-hidden="true"
                className="shrink-0 w-12 h-12 rounded-full border-2 border-nb-ink bg-nb-lilac bg-no-repeat bg-[url('/mevy-cutout.webp')] bg-[length:150%] bg-[position:42%_4%] shadow-nb-sm"
            />
            <span className="relative rounded-2xl rounded-bl-sm border-2 border-nb-ink bg-white px-4 py-2.5 text-[15px] font-medium shadow-nb-sm max-w-md">
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-nb-violet mb-0.5">Mevy says</span>
                {children}
            </span>
        </motion.div>
    );
}

/** Line of text that slides up from a mask. */
export function Mask({ children, delay = 0, play }: { children: React.ReactNode; delay?: number; play?: boolean }) {
    const t = { duration: 0.9, ease: EASE, delay };
    return (
        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
            {play === undefined ? (
                <motion.span className="block" initial={{ y: "110%" }} whileInView={{ y: "0%" }} viewport={{ once: true }} transition={t}>
                    {children}
                </motion.span>
            ) : (
                <motion.span className="block" initial={{ y: "110%" }} animate={{ y: play ? "0%" : "110%" }} transition={t}>
                    {children}
                </motion.span>
            )}
        </span>
    );
}

/** A word set in a tilted colour block, like a sticker on a page. */
export function Block({ children, color, tilt = -2 }: { children: React.ReactNode; color: string; tilt?: number }) {
    return (
        <span className={`inline-block border-2 border-nb-ink rounded-xl px-[0.18em] shadow-nb ${color}`} style={{ transform: `rotate(${tilt}deg)` }}>
            {children}
        </span>
    );
}

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.6, ease: EASE, delay }}
        >
            {children}
        </motion.div>
    );
}

export function CountUp({ value, loading }: { value: number; loading?: boolean }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [n, setN] = useState(0);
    useEffect(() => {
        if (!inView || loading) return;
        const c = animate(0, value, { duration: 1.6, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
        return () => c.stop();
    }, [inView, loading, value]);
    return <span ref={ref}>{loading ? "—" : n}</span>;
}

export function SectionHead({ says, title, kicker }: { says?: React.ReactNode; title: React.ReactNode; kicker: string }) {
    return (
        <div>
            {says && <MevySays className="mb-10">{says}</MevySays>}
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">{kicker}</p>
            <h2 className="mt-3 font-brico font-extrabold tracking-[-0.035em] leading-[0.95] text-[clamp(2.4rem,5.5vw,5rem)] text-nb-ink">{title}</h2>
        </div>
    );
}

/** Standard top of every inner page: Mevy bubble, kicker, huge title, intro, optional actions. */
export function PageHero({
    kicker,
    title,
    desc,
    says,
    children,
}: {
    kicker: string;
    title: React.ReactNode;
    desc?: React.ReactNode;
    says?: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <header className={`${WRAP} pt-32 sm:pt-36 pb-10 sm:pb-14`}>
            {says && <MevySays className="mb-8">{says}</MevySays>}
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">
                {kicker}
            </motion.p>
            <h1 className="mt-3 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2.8rem,7.5vw,6.5rem)] text-nb-ink">
                <Mask play>{title}</Mask>
            </h1>
            {desc && (
                <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="mt-5 max-w-2xl text-lg text-nb-muted leading-relaxed">
                    {desc}
                </motion.p>
            )}
            {children && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-8">
                    {children}
                </motion.div>
            )}
        </header>
    );
}

export function Empty({ icon, title, desc, children }: { icon?: React.ReactNode; title: string; desc?: string; children?: React.ReactNode }) {
    return (
        <Card className="p-10 sm:p-14 text-center" color="bg-nb-lilac">
            {icon && <div className="mx-auto mb-4 w-14 h-14 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm">{icon}</div>}
            <p className="font-brico font-extrabold text-2xl">{title}</p>
            {desc && <p className="mt-2 text-nb-muted">{desc}</p>}
            {children && <div className="mt-6 flex justify-center gap-3 flex-wrap">{children}</div>}
        </Card>
    );
}

export function SkeletonCard({ className = "h-72" }: { className?: string }) {
    return <div className={`rounded-[22px] border-2 border-nb-ink/20 bg-white/60 animate-pulse ${className}`} />;
}

/** Colour rotation for cards/tiles that need a block colour. */
export const BLOCK_COLORS = ["bg-nb-sky", "bg-nb-peach", "bg-nb-mint", "bg-nb-lilac", "bg-nb-sun"];
