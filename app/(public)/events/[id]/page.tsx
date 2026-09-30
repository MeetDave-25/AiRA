"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, User, Target, FileText, Star, ArrowLeft, ChevronLeft, ChevronRight, Film } from "lucide-react";
import Link from "next/link";
import { isVideoMedia } from "@/lib/media";
import { formatDate } from "@/lib/utils";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Btn, Card, EASE, Empty, Mask, SkeletonCard, Tag, WRAP } from "@/components/nb/kit";

function ImageCarousel({
    images,
    current,
    onCurrentChange,
}: {
    images: any[];
    current: number;
    onCurrentChange: (next: number) => void;
}) {
    const currentMedia = images[current];

    if (!images.length) return (
        <div className="w-full aspect-video rounded-[22px] border-2 border-nb-ink bg-nb-lilac flex items-center justify-center shadow-nb">
            <span className="font-brico font-bold text-nb-ink/50">No media yet</span>
        </div>
    );

    const arrow = "absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm hover:bg-nb-sun transition-colors";

    return (
        <div className="relative rounded-[22px] border-2 border-nb-ink overflow-hidden shadow-nb-lg bg-nb-ink">
            <div className="relative aspect-video">
                {isVideoMedia(currentMedia) ? (
                    <video src={currentMedia.url} controls playsInline className="w-full h-full object-cover" />
                ) : (
                    <img
                        src={currentMedia.url}
                        alt={currentMedia.caption || "Event"}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/800x450/F3EFE4/111111?text=AiRA+Lab+Event"; }}
                    />
                )}
                {isVideoMedia(currentMedia) && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-nb-ink bg-white px-3 py-1 text-xs font-bold">
                        <Film size={12} /> Video
                    </span>
                )}
            </div>

            {images.length > 1 && (
                <>
                    <button aria-label="Previous" onClick={() => onCurrentChange((current - 1 + images.length) % images.length)} className={`${arrow} left-3`}>
                        <ChevronLeft size={18} />
                    </button>
                    <button aria-label="Next" onClick={() => onCurrentChange((current + 1) % images.length)} className={`${arrow} right-3`}>
                        <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full border-2 border-nb-ink bg-white px-2 py-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Show media ${i + 1}`}
                                onClick={() => onCurrentChange(i)}
                                className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-nb-violet" : "w-2 h-2 bg-nb-ink/25 hover:bg-nb-ink/50"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b-2 border-dashed border-nb-ink/15 last:border-0">
            <span className="w-9 h-9 shrink-0 rounded-lg border-2 border-nb-ink bg-white flex items-center justify-center">
                <Icon size={15} />
            </span>
            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-nb-ink/60">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}

function Section({ icon: Icon, title, children, color = "bg-white" }: { icon: any; title: string; children: React.ReactNode; color?: string }) {
    return (
        <Card className="p-6 sm:p-7" color={color}>
            <h2 className="flex items-center gap-2 font-brico font-extrabold text-xl">
                <Icon size={18} /> {title}
            </h2>
            <div className="mt-3 leading-relaxed text-nb-ink/80 whitespace-pre-wrap">{children}</div>
        </Card>
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
        <div className={`${WRAP} pt-36 pb-24 grid lg:grid-cols-5 gap-8`}>
            <SkeletonCard className="lg:col-span-3 aspect-video" />
            <SkeletonCard className="lg:col-span-2 h-96" />
        </div>
    );
    if (!event || event.error) return (
        <div className={`${WRAP} pt-36 pb-24`}>
            <Empty title="Event not found" desc="It may have been moved or removed.">
                <Btn href="/events" tone="white">← Back to events</Btn>
            </Empty>
        </div>
    );

    const isUpcoming = new Date(event.date) > new Date();

    return (
        <div className={`${WRAP} pt-32 sm:pt-36 pb-24`}>
            <Link href="/events" className="inline-flex items-center gap-2 font-brico font-bold text-sm hover:text-nb-violet transition-colors">
                <ArrowLeft size={16} /> Back to events
            </Link>

            <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-6 mb-10">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                    <Tag className={isUpcoming ? "bg-nb-sun" : "bg-white"}>{isUpcoming ? "● Upcoming" : "Completed"}</Tag>
                    {event.category && <Tag className="bg-nb-lilac">{event.category}</Tag>}
                </div>
                <h1 className="font-brico font-extrabold tracking-[-0.04em] leading-[0.98] text-[clamp(2.4rem,6vw,5rem)] max-w-5xl">
                    <Mask play>{event.title}</Mask>
                </h1>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Tag className="bg-white text-sm px-3 py-1"><Calendar size={14} /> {formatDate(event.date)}</Tag>
                    {event.venue && <Tag className="bg-white text-sm px-3 py-1"><MapPin size={14} /> {event.venue}</Tag>}
                    {event.participantCount > 0 && <Tag className="bg-white text-sm px-3 py-1"><Users size={14} /> {event.participantCount} participants</Tag>}
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <ImageCarousel images={event.images || []} current={currentImageIndex} onCurrentChange={setCurrentImageIndex} />

                    {event.images?.length > 1 && (
                        <div className="grid grid-cols-5 gap-2.5">
                            {event.images.map((img: any, i: number) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrentImageIndex(i)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 border-nb-ink transition-all ${
                                        i === currentImageIndex ? "shadow-nb-sm ring-2 ring-nb-violet ring-offset-2 ring-offset-nb-paper" : "opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    {isVideoMedia(img) ? (
                                        <div className="relative h-full w-full bg-nb-ink">
                                            <video src={img.url} className="w-full h-full object-cover" muted playsInline />
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <Film size={18} className="text-white" />
                                            </span>
                                        </div>
                                    ) : (
                                        <img src={img.url} alt={`Event ${i + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {event.description && <Section icon={FileText} title="Event summary">{event.description}</Section>}
                    {event.objective && <Section icon={Target} title="Objective" color="bg-nb-sky">{event.objective}</Section>}
                    {event.outcome && <Section icon={Star} title="Outcomes & benefits" color="bg-nb-mint">{event.outcome}</Section>}

                    {isUpcoming && <EventRegistrationForm eventId={event.id} />}
                </div>

                <aside className="lg:col-span-2">
                    <Card className="p-6 sm:sticky sm:top-28" color="bg-nb-lilac">
                        <h2 className="font-brico font-extrabold text-xl">Event details</h2>
                        <div className="mt-3">
                            <InfoRow icon={User} label="Mentor" value={event.mentor} />
                            <InfoRow icon={User} label="Co-mentor" value={event.coMentor} />
                            {event.coInstructors?.length > 0 && <InfoRow icon={User} label="Co-instructors" value={event.coInstructors.join(", ")} />}
                            {event.supportingTeam?.length > 0 && <InfoRow icon={Users} label="Supporting team" value={event.supportingTeam.join(", ")} />}
                            <InfoRow icon={User} label="Organised by" value={event.organizedBy} />
                            <InfoRow icon={User} label="Led by" value={event.leadBy} />
                            <InfoRow icon={Users} label="Participants" value={event.participantCount > 0 ? `${event.participantCount} participants` : ""} />
                        </div>

                        {event.assignments?.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-nb-ink/15">
                                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-nb-ink/60 mb-2">Organised by team</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {event.assignments.map((a: any) => (
                                        <span key={a.id} className="inline-flex items-center gap-1.5 rounded-full border-2 border-nb-ink bg-white px-2.5 py-0.5 text-xs font-bold">
                                            <span className="w-2 h-2 rounded-full" style={{ background: a.team.color }} />
                                            {a.team.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </aside>
            </div>
        </div>
    );
}
