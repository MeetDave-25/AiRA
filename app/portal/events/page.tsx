"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";

export default function PortalEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/events")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setEvents(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false));
    }, []);

    const upcoming = events.filter((e) => e.isUpcoming);
    const past = events.filter((e) => !e.isUpcoming);

    const EventCard = ({ event }: { event: any }) => {
        const primaryImage = event.EventImage?.find((img: any) => img.isPrimary) || event.EventImage?.[0];
        return (
            <div className="bg-aira-card border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-aira-cyan/30 transition-colors">
                {primaryImage && (
                    <div className="h-40 w-full overflow-hidden">
                        <img src={primaryImage.url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-4 space-y-2">
                    <h3 className="font-medium text-white text-sm">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} className="text-aira-cyan" />
                        {new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={12} className="text-aira-magenta" />
                        {event.venue || "TBD"}
                    </div>
                    {event.participantCount > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Users size={12} className="text-aira-green" />
                            {event.participantCount} participants
                        </div>
                    )}
                    {event.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{event.description}</p>
                    )}
                    {event.EventAssignment?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {event.EventAssignment.map((a: any) => (
                                <span key={a.id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300" style={{ borderLeft: `3px solid ${a.Team?.color || '#00D4FF'}` }}>
                                    {a.Team?.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 min-h-screen">
            <div className="glass p-6 rounded-2xl border border-white/5">
                <h1 className="font-orbitron font-bold text-2xl text-white">My Events</h1>
                <p className="text-slate-400 text-sm">Events assigned to your teams</p>
            </div>

            {loading ? (
                <div className="h-48 flex items-center justify-center">
                    <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
                </div>
            ) : events.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center border border-white/5">
                    <Calendar className="mx-auto mb-4 text-slate-600" size={48} />
                    <p className="text-slate-400">No events found for your teams.</p>
                </div>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <div>
                            <h2 className="font-orbitron font-bold text-lg text-aira-cyan mb-4">Upcoming Events</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
                            </div>
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <h2 className="font-orbitron font-bold text-lg text-slate-300 mb-4">Past Events</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {past.map((event) => <EventCard key={event.id} event={event} />)}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
