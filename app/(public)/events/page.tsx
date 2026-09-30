"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Users, Film, ArrowUpRight } from "lucide-react";
import { isVideoMedia } from "@/lib/media";
import { BLOCK_COLORS, Chip, EASE, Empty, PageHero, SearchInput, WRAP } from "@/components/nb/kit";

function EventCard({ event, index }: { event: any; index: number }) {
    const primaryImage = event.images?.find((img: any) => img.isPrimary) || event.images?.[0];
    const isUpcoming = new Date(event.date) > new Date();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: EASE }}
        >
            <Link
                href={`/events/${event.id}`}
                className="group block h-full rounded-[22px] border-2 border-nb-ink bg-white shadow-nb overflow-hidden transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg"
            >
                <div className={`relative aspect-video border-b-2 border-nb-ink overflow-hidden ${BLOCK_COLORS[index % BLOCK_COLORS.length]}`}>
                    {primaryImage ? (
                        isVideoMedia(primaryImage.url) ? (
                            <video src={primaryImage.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={primaryImage.url} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Film className="text-nb-ink/30" size={40} />
                        </div>
                    )}
                    <span
                        className={`absolute top-3 left-3 rounded-full border-2 border-nb-ink px-2.5 py-0.5 text-[11px] font-bold ${
                            isUpcoming ? "bg-nb-sun" : "bg-white"
                        }`}
                    >
                        {isUpcoming ? "● Upcoming" : "Completed"}
                    </span>
                </div>
                <div className="p-5">
                    <h3 className="font-brico font-extrabold text-xl tracking-tight leading-snug group-hover:text-nb-violet transition-colors">{event.title}</h3>
                    <div className="mt-3 space-y-1.5 text-sm text-nb-muted">
                        <p className="flex items-center gap-2">
                            <Calendar size={14} className="text-nb-ink" />
                            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {event.venue && (
                            <p className="flex items-center gap-2">
                                <MapPin size={14} className="text-nb-ink" />
                                <span className="truncate">{event.venue}</span>
                            </p>
                        )}
                        {event.participantCount > 0 && (
                            <p className="flex items-center gap-2">
                                <Users size={14} className="text-nb-ink" />
                                {event.participantCount} participants
                            </p>
                        )}
                    </div>
                    <p className="mt-4 inline-flex items-center gap-1 font-brico font-bold text-sm">
                        View details <ArrowUpRight size={15} className="transition-transform group-hover:rotate-45" />
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

const DEFAULT_EVENTS = [
    {
        id: "evt-ai-symposium-2026",
        title: "National AI & Autonomous Systems Symposium",
        date: "2026-09-15T10:00:00Z",
        venue: "AiRA Innovation Auditorium & Online Stream",
        participantCount: 350,
        images: [{ url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
    },
    {
        id: "evt-robotics-hackathon-2026",
        title: "Autonomous Robotics & SLAM Hackathon 2026",
        date: "2026-10-20T09:00:00Z",
        venue: "AiRA Hardware & Robotics Arena",
        participantCount: 200,
        images: [{ url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
    },
    {
        id: "evt-cyber-workshop-2026",
        title: "Embedded Systems & Firmware Defense Workshop",
        date: "2026-05-10T14:00:00Z",
        venue: "AiRA Cyber Security Wing",
        participantCount: 150,
        images: [{ url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80", isPrimary: true }],
    },
];

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>(DEFAULT_EVENTS);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

    useEffect(() => {
        fetch("/api/events")
            .then((r) => r.ok ? r.json() : [])
            .then((d) => {
                if (Array.isArray(d) && d.length > 0) {
                    setEvents(d);
                }
            })
            .catch(() => {});
    }, []);

    const filtered = events.filter((e) => {
        const matchSearch =
            (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
            (e.venue || "").toLowerCase().includes(search.toLowerCase());
        const isUpcoming = new Date(e.date) > new Date();
        const matchFilter =
            filter === "all" ||
            (filter === "upcoming" && isUpcoming) ||
            (filter === "completed" && !isUpcoming);
        return matchSearch && matchFilter;
    });

    return (
        <div className="min-h-screen pb-24">
            <PageHero
                kicker="Workshops · talks · hackathons"
                title="Events."
                says="This is where our community meets up. Find one and come say hi!"
                desc="Hands-on workshops, tech talks and hackathons run by AiRA Lab members — open to every curious student."
            >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <SearchInput value={search} onChange={setSearch} placeholder="Search events by title or venue…" />
                    <div className="flex gap-2">
                        {(["all", "upcoming", "completed"] as const).map((tab) => (
                            <Chip key={tab} active={filter === tab} onClick={() => setFilter(tab)}>
                                <span className="capitalize">{tab}</span>
                            </Chip>
                        ))}
                    </div>
                </div>
            </PageHero>

            <div className={WRAP}>
                {filtered.length === 0 ? (
                    <Empty icon={<Calendar size={24} />} title="No events match that filter." desc="Try another search, or check back soon." />
                ) : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filtered.map((event, i) => (
                                <EventCard key={event.id} event={event} index={i} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
