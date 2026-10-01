"use client";

// About-page team deck: members fanned out like a hand of ID cards. Swipe/drag, arrows or keys to flip;
// it auto-deals while idle. Tap the front card to open a profile. Real data only — no stock photos.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, Star } from "lucide-react";

export type DeckMember = {
    id: string;
    name: string;
    role?: string;
    photo?: string | null;
    isPresident?: boolean;
    isLead?: boolean;
    badge?: string; // overrides the Founder/Lead label (e.g. "Director")
    team?: string;
    color?: string; // tailwind bg class for the team stripe
};

const initialsOf = (name: string) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function Face({ m }: { m: DeckMember }) {
    const [broken, setBroken] = useState(false);
    if (!m.photo || broken) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-nb-paper font-brico font-extrabold text-5xl text-nb-ink/70">
                {initialsOf(m.name)}
            </div>
        );
    }
    return (
        <img
            src={m.photo}
            alt={m.name}
            draggable={false}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="w-full h-full object-cover object-[50%_20%] select-none pointer-events-none"
        />
    );
}

export default function TeamDeck({ members, onSelect }: { members: DeckMember[]; onSelect: (id: string) => void }) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [narrow, setNarrow] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const draggedRef = useRef(false);
    const n = members.length;

    // New list (e.g. a team was focused) → start from the top card.
    useEffect(() => setActive(0), [members]);

    useEffect(() => {
        const onResize = () => setNarrow(window.innerWidth < 640);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const go = useCallback((dir: number) => setActive((a) => (n ? (a + dir + n) % n : 0)), [n]);

    // Auto-deal while idle and on screen.
    useEffect(() => {
        if (paused || n < 2) return;
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        if (wrapRef.current) io.observe(wrapRef.current);
        const t = setInterval(() => visible && go(1), 3200);
        return () => { clearInterval(t); io.disconnect(); };
    }, [paused, n, go]);

    const onPanEnd = (_: unknown, info: PanInfo) => {
        setPaused(true);
        // A drag is not a tap: swallow the click that follows it.
        draggedRef.current = true;
        setTimeout(() => (draggedRef.current = false), 50);
        if (info.offset.x < -50 || info.velocity.x < -400) go(1);
        else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
    };

    if (!n) return null;
    const current = members[active];
    const spread = narrow ? 120 : 190;
    const visibleRange = narrow ? 2 : 3;

    return (
        <div
            ref={wrapRef}
            className="relative select-none"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onKeyDown={(e) => {
                if (e.key === "ArrowRight") { setPaused(true); go(1); }
                if (e.key === "ArrowLeft") { setPaused(true); go(-1); }
            }}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Team members"
        >
            <motion.div onPanEnd={onPanEnd} className="relative h-[430px] sm:h-[470px] touch-pan-y cursor-grab active:cursor-grabbing">
                {members.map((m, i) => {
                    // Shortest signed distance around the circle, so the deck loops.
                    let d = i - active;
                    if (d > n / 2) d -= n;
                    if (d < -n / 2) d += n;
                    const far = Math.abs(d) > visibleRange;
                    if (far) return null;
                    const isFront = d === 0;
                    return (
                        <motion.button
                            key={m.id}
                            type="button"
                            aria-label={isFront ? `Open ${m.name}'s profile` : `Show ${m.name}`}
                            onClick={() => {
                                if (draggedRef.current) return;
                                if (isFront) onSelect(m.id);
                                else { setPaused(true); setActive(i); }
                            }}
                            initial={false}
                            animate={{
                                x: d * spread,
                                y: Math.abs(d) * 18,
                                rotate: d * 7,
                                scale: 1 - Math.abs(d) * 0.09,
                                opacity: Math.abs(d) === visibleRange ? 0.4 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            style={{ zIndex: 50 - Math.abs(d) }}
                            className="absolute left-1/2 top-2 -ml-[115px] sm:-ml-[135px] w-[230px] sm:w-[270px] text-left"
                        >
                            <div className={`rounded-[22px] border-2 border-nb-ink bg-white overflow-hidden ${isFront ? "shadow-[6px_6px_0_0_#111]" : "shadow-[3px_3px_0_0_#111]"}`}>
                                {/* Team stripe + lanyard slot */}
                                <div className={`relative h-9 border-b-2 border-nb-ink ${m.color || "bg-nb-lilac"}`}>
                                    <span className="absolute left-1/2 top-2.5 -translate-x-1/2 w-12 h-2 rounded-full border-2 border-nb-ink bg-white" />
                                </div>
                                <div className="relative mx-3 mt-3 aspect-[4/5] rounded-2xl border-2 border-nb-ink overflow-hidden bg-nb-paper">
                                    <Face m={m} />
                                    {(m.isPresident || m.isLead || m.badge) && (
                                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-nb-sun px-2 py-0.5 text-[10px] font-bold">
                                            {m.isPresident || m.badge ? <Crown size={11} /> : <Star size={11} />} {m.badge || (m.isPresident ? "Founder" : "Lead")}
                                        </span>
                                    )}
                                </div>
                                <div className="px-4 pt-3 pb-4">
                                    <p className="font-brico font-extrabold text-lg leading-tight truncate">{m.name}</p>
                                    <p className="text-sm text-nb-muted truncate">{m.role || "Member"}</p>
                                    {m.team && (
                                        <span className="mt-2 inline-block max-w-full truncate rounded-full border-2 border-nb-ink bg-nb-paper px-2 py-0.5 text-[10px] font-bold">
                                            {m.team}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={() => { setPaused(true); go(-1); }}
                    aria-label="Previous member"
                    className="w-11 h-11 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="min-w-[150px] text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-nb-muted">
                        {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                    </p>
                    <p className="font-brico font-bold text-sm truncate max-w-[220px]">{current?.team || "AiRA Lab"}</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setPaused(true); go(1); }}
                    aria-label="Next member"
                    className="w-11 h-11 rounded-full border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-nb-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-nb-muted">Swipe or drag the deck · tap the front card for the full profile</p>
        </div>
    );
}
