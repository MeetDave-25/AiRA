"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, Calendar, MapPin, Users } from "lucide-react";

// Netflix intro animation
function NetflixLoader({ onDone }: { onDone: () => void }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2500);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-aira-bg flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-64 h-1 bg-gradient-to-r from-aira-cyan to-aira-magenta rounded-full mb-8"
                style={{ transformOrigin: "left" }}
            />
            <motion.h1
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
                className="font-orbitron font-black text-6xl gradient-text text-glow-cyan mb-4"
            >AiRA</motion.h1>
            <motion.p
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "1em" }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="font-orbitron text-aira-cyan text-sm tracking-widest"
            >Lab</motion.p>

            <div className="netflix-loader mt-12">
                {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i} />
                ))}
            </div>
        </motion.div>
    );
}

// Event card component
function EventCard({ event }: { event: any }) {
    const primaryImage = event.images?.find((img: any) => img.isPrimary) || event.images?.[0];
    const isUpcoming = new Date(event.date) > new Date();

    return (
        <Link href={`/events/${event.id}`}>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="netflix-card relative rounded-xl overflow-hidden aspect-[2/3] bg-aira-card group"
            >
                <img
                    src={primaryImage?.url || "https://placehold.co/400x600/0d1526/00D4FF?text=AiRA+Lab"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x600/0d1526/00D4FF?text=AiRA+Lab"; }}
                />

                {/* Overlay - always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3">
                    {isUpcoming ? (
                        <span className="badge-upcoming">Upcoming</span>
                    ) : (
                        <span className="badge-completed">Done</span>
                    )}
                </div>

                {/* Bottom info - always shown */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-orbitron font-bold text-sm text-white line-clamp-2 mb-1">
                        {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={10} />
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                </div>

                {/* Hover overlay */}
                <div className="netflix-overlay absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20 p-4 flex flex-col justify-end">
                    <h3 className="font-orbitron font-bold text-sm text-white mb-2">{event.title}</h3>
                    <div className="space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-1">
                            <Calendar size={10} className="text-aira-cyan" />
                            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        {event.venue && (
                            <div className="flex items-center gap-1">
                                <MapPin size={10} className="text-aira-magenta" />
                                {event.venue}
                            </div>
                        )}
                        {event.participantCount > 0 && (
                            <div className="flex items-center gap-1">
                                <Users size={10} className="text-aira-gold" />
                                {event.participantCount} participants
                            </div>
                        )}
                    </div>
                    <div className="mt-3 px-3 py-1.5 rounded-lg bg-aira-cyan/20 border border-aira-cyan/40 text-aira-cyan text-xs font-medium text-center">
                        View Details →
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.ok ? r.json() : [])
            .then((d) => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => { setEvents([]); setLoading(false); });
    }, []);

    const filtered = events.filter((e) => {
        const matchSearch =
            e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.venue?.toLowerCase().includes(search.toLowerCase());
        const isUpcoming = new Date(e.date) > new Date();
        const matchFilter =
            filter === "all" ||
            (filter === "upcoming" && isUpcoming) ||
            (filter === "completed" && !isUpcoming);
        return matchSearch && matchFilter;
    });

    return (
        <>
            <AnimatePresence>
                {showLoader && <NetflixLoader onDone={() => setShowLoader(false)} />}
            </AnimatePresence>

            <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto min-h-screen">
                {/* Header */}
                <div className="mb-10">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-aira-cyan font-medium text-sm mb-1 font-orbitron tracking-widest uppercase"
                    >
                        All Events
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-orbitron font-black text-5xl text-white mb-6"
                    >
                        Events <span className="gradient-text">Showcase</span>
                    </motion.h1>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(["all", "upcoming", "completed"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f
                                        ? "bg-aira-cyan text-aira-bg"
                                        : "glass border border-aira-border/50 text-slate-300 hover:border-aira-cyan/30"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="netflix-loader">
                            {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <div className="text-5xl mb-4">🎭</div>
                        <p className="font-orbitron">No events found</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                    >
                        <AnimatePresence>
                            {filtered.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </>
    );
}
