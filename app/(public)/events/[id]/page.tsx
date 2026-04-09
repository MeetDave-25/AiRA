"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, User, Target, FileText, Star, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

function ImageCarousel({
    images,
    current,
    onCurrentChange,
}: {
    images: any[];
    current: number;
    onCurrentChange: (next: number) => void;
}) {

    if (!images.length) return (
        <div className="w-full h-80 rounded-2xl bg-aira-card flex items-center justify-center">
            <span className="text-slate-500">No images</span>
        </div>
    );

    return (
        <div className="relative rounded-2xl overflow-hidden">
            <div className="relative aspect-video">
                <img
                    src={images[current].url}
                    alt={images[current].caption || "Event"}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x450/0d1526/00D4FF?text=AiRA+Lab+Event"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={() => onCurrentChange((current - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-aira-cyan/20 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => onCurrentChange((current + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-aira-cyan/20 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onCurrentChange(i)}
                                className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-aira-cyan" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, color = "#00D4FF" }: { icon: any; label: string; value: string | number; color?: string }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                <Icon size={14} style={{ color }} />
            </div>
            <div>
                <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                <p className="text-slate-200 text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetch(`/api/events/${id}`)
            .then((r) => r.json())
            .then((d) => { setEvent(d); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
        </div>
    );
    if (!event || event.error) return (
        <div className="min-h-screen flex items-center justify-center text-slate-500">
            <div className="text-center">
                <div className="text-5xl mb-4">😕</div>
                <p>Event not found</p>
                <Link href="/events" className="text-aira-cyan mt-4 inline-block hover:underline">← Back to Events</Link>
            </div>
        </div>
    );

    const isUpcoming = new Date(event.date) > new Date();

    return (
        <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
            {/* Back */}
            <Link href="/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-aira-cyan text-sm mb-8 transition-colors">
                <ArrowLeft size={16} /> Back to Events
            </Link>

            {/* Hero section */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    {isUpcoming ? (
                        <span className="badge-upcoming">Upcoming</span>
                    ) : (
                        <span className="badge-completed">Completed</span>
                    )}
                    {event.category && (
                        <span className="px-3 py-1 rounded-full text-xs glass border border-aira-purple/30 text-aira-purple">{event.category}</span>
                    )}
                </div>
                <h1 className="font-orbitron font-black text-4xl sm:text-5xl text-white mb-4 leading-tight">
                    {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-aira-cyan" />{formatDate(event.date)}</div>
                    {event.venue && <div className="flex items-center gap-1.5"><MapPin size={14} className="text-aira-magenta" />{event.venue}</div>}
                    {event.participantCount > 0 && <div className="flex items-center gap-1.5"><Users size={14} className="text-aira-gold" />{event.participantCount} Participants</div>}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Images + Description */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <ImageCarousel
                            images={event.images || []}
                            current={currentImageIndex}
                            onCurrentChange={setCurrentImageIndex}
                        />
                    </motion.div>

                    {/* Image thumbnails */}
                    {event.images?.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {event.images.map((img: any, i: number) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`aspect-square rounded-lg overflow-hidden border transition ${i === currentImageIndex ? "border-aira-cyan" : "border-white/10 hover:border-aira-cyan/40"
                                        }`}
                                >
                                    <img src={img.url} alt={`Event ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/0d1526/00D4FF?text=AL"; }} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="glass rounded-2xl p-6 border border-aira-border/30">
                            <h2 className="font-orbitron font-semibold text-aira-cyan text-sm mb-3 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} /> Event Summary
                            </h2>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                    )}

                    {/* Objective */}
                    {event.objective && (
                        <div className="glass rounded-2xl p-6 border border-aira-purple/20">
                            <h2 className="font-orbitron font-semibold text-aira-purple text-sm mb-3 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} /> Objective
                            </h2>
                            <p className="text-slate-300 leading-relaxed">{event.objective}</p>
                        </div>
                    )}

                    {/* Outcome */}
                    {event.outcome && (
                        <div className="glass rounded-2xl p-6 border border-aira-gold/20">
                            <h2 className="font-orbitron font-semibold text-aira-gold text-sm mb-3 uppercase tracking-widest flex items-center gap-2">
                                <Star size={14} /> Outcomes & Benefits
                            </h2>
                            <p className="text-slate-300 leading-relaxed">{event.outcome}</p>
                        </div>
                    )}
                </div>

                {/* Right: Info panel */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass rounded-2xl p-6 border border-aira-border/30 sticky top-28">
                        <h2 className="font-orbitron font-semibold text-sm text-white mb-4 uppercase tracking-widest">Event Details</h2>
                        <div className="space-y-3">
                            <InfoRow icon={User} label="Mentor" value={event.mentor} color="#00D4FF" />
                            <InfoRow icon={User} label="Co-Mentor" value={event.coMentor} color="#7C3AED" />
                            {event.coInstructors?.length > 0 && (
                                <InfoRow icon={User} label="Co-Instructors" value={event.coInstructors.join(", ")} color="#FF006E" />
                            )}
                            {event.supportingTeam?.length > 0 && (
                                <InfoRow icon={Users} label="Supporting Team" value={event.supportingTeam.join(", ")} color="#F59E0B" />
                            )}
                            <InfoRow icon={User} label="Organized By" value={event.organizedBy} color="#10B981" />
                            <InfoRow icon={User} label="Lead By" value={event.leadBy} color="#00D4FF" />
                            <InfoRow icon={Users} label="Participants" value={event.participantCount > 0 ? `${event.participantCount} participants` : ""} color="#F59E0B" />
                        </div>

                        {/* Assigned teams */}
                        {event.assignments?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-aira-border/30">
                                <p className="text-slate-500 text-xs mb-2">Organized by team</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {event.assignments.map((a: any) => (
                                        <span key={a.id} className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: `${a.team.color}20`, color: a.team.color, border: `1px solid ${a.team.color}30` }}>
                                            {a.team.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
