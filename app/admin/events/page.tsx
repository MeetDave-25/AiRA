"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Edit2, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AnimatedModal from "@/components/ui/AnimatedModal";

type EventForm = {
    title: string;
    date: string;
    venue: string;
    mentor: string;
    coMentor: string;
    coInstructors: string;
    supportingTeam: string;
    participantCount: string;
    organizedBy: string;
    leadBy: string;
    objective: string;
    description: string;
    outcome: string;
    isUpcoming: boolean;
};

const baseForm: EventForm = {
    title: "",
    date: new Date().toISOString().slice(0, 10),
    venue: "",
    mentor: "",
    coMentor: "",
    coInstructors: "",
    supportingTeam: "",
    participantCount: "0",
    organizedBy: "",
    leadBy: "",
    objective: "",
    description: "",
    outcome: "",
    isUpcoming: true,
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0 },
};

const parseList = (value: string) =>
    value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const toForm = (event: any): EventForm => ({
    title: event.title || "",
    date: event.date ? new Date(event.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    venue: event.venue || "",
    mentor: event.mentor || "",
    coMentor: event.coMentor || "",
    coInstructors: Array.isArray(event.coInstructors) ? event.coInstructors.join(", ") : "",
    supportingTeam: Array.isArray(event.supportingTeam) ? event.supportingTeam.join(", ") : "",
    participantCount: String(event.participantCount || 0),
    organizedBy: event.organizedBy || "",
    leadBy: event.leadBy || "",
    objective: event.objective || "",
    description: event.description || "",
    outcome: event.outcome || "",
    isUpcoming: Boolean(event.isUpcoming),
});

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any | null>(null);
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
    const [form, setForm] = useState<EventForm>(baseForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingModalData, setIsLoadingModalData] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

    const selectedPreviews = useMemo(() => selectedFiles.map((f) => URL.createObjectURL(f)), [selectedFiles]);

    useEffect(() => {
        return () => {
            selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [selectedPreviews]);

    const fetchEvents = () =>
        fetch("/api/events")
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setEvents(Array.isArray(d) ? d : []))
            .catch(() => setEvents([]));

    useEffect(() => {
        fetchEvents();
    }, []);

    const buildPayload = () => ({
        title: form.title.trim(),
        date: `${form.date}T09:00:00.000Z`,
        venue: form.venue.trim(),
        mentor: form.mentor.trim() || null,
        coMentor: form.coMentor.trim() || null,
        coInstructors: parseList(form.coInstructors),
        supportingTeam: parseList(form.supportingTeam),
        participantCount: Number(form.participantCount || 0),
        organizedBy: form.organizedBy.trim() || null,
        leadBy: form.leadBy.trim() || null,
        objective: form.objective.trim() || null,
        description: form.description.trim() || null,
        outcome: form.outcome.trim() || null,
        isUpcoming: form.isUpcoming,
    });

    const uploadImages = async (eventId: string, files: File[], isPrimary: boolean) => {
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        formData.append("isPrimary", String(isPrimary));

        const res = await fetch(`/api/events/${eventId}/images`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Failed to upload images");
        }
    };

    const openCreateModal = () => {
        setForm({ ...baseForm, venue: "AiRA Lab", isUpcoming: true });
        setSelectedFiles([]);
        setExistingImages([]);
        setEditingEvent(null);
        setIsCreateOpen(true);
    };

    const openEditModal = async (event: any) => {
        setIsLoadingModalData(true);
        setEditingEvent(event);
        setSelectedFiles([]);
        try {
            const res = await fetch(`/api/events/${event.id}`);
            const full = await res.json();
            if (!res.ok || full.error) {
                throw new Error(full.error || "Failed to load event");
            }
            setForm(toForm(full));
            setExistingImages(full.images || []);
        } catch (error: any) {
            toast.error(error?.message || "Failed to load event details");
            setEditingEvent(null);
        } finally {
            setIsLoadingModalData(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!form.title.trim() || !form.date || !form.venue.trim()) {
            toast.error("Please fill title, date, and venue.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to create event");

            if (selectedFiles.length) {
                try {
                    await uploadImages(data.id, selectedFiles, true);
                } catch (uploadError: any) {
                    toast.error(uploadError?.message || "Event created but image upload failed");
                }
            }

            toast.success("Event created!");
            setIsCreateOpen(false);
            fetchEvents();
        } catch (error: any) {
            toast.error(error?.message || "Could not create event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateEvent = async () => {
        if (!editingEvent) return;
        if (!form.title.trim() || !form.date || !form.venue.trim()) {
            toast.error("Please fill title, date, and venue.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/events/${editingEvent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to update event");

            if (selectedFiles.length) {
                try {
                    await uploadImages(editingEvent.id, selectedFiles, existingImages.length === 0);
                } catch (uploadError: any) {
                    toast.error(uploadError?.message || "Event updated but image upload failed");
                }
            }

            toast.success("Event updated!");
            setEditingEvent(null);
            fetchEvents();
        } catch (error: any) {
            toast.error(error?.message || "Could not update event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete event");
            toast.success("Event deleted");
            setDeletingEventId(null);
            fetchEvents();
        } catch (error: any) {
            toast.error(error?.message || "Could not delete event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const setPrimaryImage = async (imageId: string) => {
        if (!editingEvent) return;
        try {
            const res = await fetch(`/api/events/${editingEvent.id}/images/${imageId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPrimary: true }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to set primary image");

            setExistingImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
            toast.success("Primary image updated");
        } catch (error: any) {
            toast.error(error?.message || "Failed to set primary image");
        }
    };

    const deleteImage = async (imageId: string) => {
        if (!editingEvent) return;
        try {
            const res = await fetch(`/api/events/${editingEvent.id}/images/${imageId}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Failed to delete image");
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
            toast.success("Image removed");
        } catch (error: any) {
            toast.error(error?.message || "Failed to remove image");
        }
    };

    const persistImageOrder = async (images: any[]) => {
        if (!editingEvent) return;
        const orderedIds = images.map((img) => img.id);
        const res = await fetch(`/api/events/${editingEvent.id}/images/reorder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to reorder images");
    };

    const handleDropReorder = async (targetId: string) => {
        if (!draggedImageId || draggedImageId === targetId) return;

        const previous = [...existingImages];
        const current = [...existingImages];
        const from = current.findIndex((img) => img.id === draggedImageId);
        const to = current.findIndex((img) => img.id === targetId);
        if (from < 0 || to < 0) return;

        const [moved] = current.splice(from, 1);
        current.splice(to, 0, moved);

        setExistingImages(current);
        setDraggedImageId(null);

        try {
            await persistImageOrder(current);
            toast.success("Image order updated");
        } catch (error: any) {
            toast.error(error?.message || "Failed to reorder images");
            setExistingImages(previous);
        }
    };

    const upcomingCount = events.filter((e) => new Date(e.date) > new Date()).length;

    const EventFormFields = (
        <div className="max-h-[68vh] overflow-y-auto pr-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Event title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Venue</label>
                    <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Participants</label>
                    <input type="number" min={0} value={form.participantCount} onChange={(e) => setForm({ ...form, participantCount: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Mentor</label>
                    <input value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Co-Mentor</label>
                    <input value={form.coMentor} onChange={(e) => setForm({ ...form, coMentor: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Co-Instructor(s)</label>
                    <input value={form.coInstructors} onChange={(e) => setForm({ ...form, coInstructors: e.target.value })} placeholder="Comma separated" className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Supporting Team</label>
                    <input value={form.supportingTeam} onChange={(e) => setForm({ ...form, supportingTeam: e.target.value })} placeholder="Comma separated" className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Organized By</label>
                    <input value={form.organizedBy} onChange={(e) => setForm({ ...form, organizedBy: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Lead By</label>
                    <input value={form.leadBy} onChange={(e) => setForm({ ...form, leadBy: e.target.value })} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60" />
                </div>
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">Event Objective</label>
                <textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} rows={2} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 resize-none" />
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">Event Description / Summary</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 resize-none" />
            </div>

            <div>
                <label className="block text-xs text-slate-400 mb-1">Outcome / Benefit of Event</label>
                <textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} rows={3} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-aira-cyan/60 resize-none" />
            </div>

            <div className="flex items-center gap-2 text-sm">
                <input
                    id="is-upcoming"
                    type="checkbox"
                    checked={form.isUpcoming}
                    onChange={(e) => setForm({ ...form, isUpcoming: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-slate-900"
                />
                <label htmlFor="is-upcoming" className="text-slate-300">Mark as upcoming event</label>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 space-y-2">
                <label className="block text-xs text-slate-400">Add event images (multiple)</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                    className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-aira-cyan/20 file:px-3 file:py-2 file:text-aira-cyan"
                />
                {selectedPreviews.length > 0 && (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                        {selectedPreviews.map((src, idx) => (
                            <div key={src} className="relative overflow-hidden rounded-lg border border-white/10 aspect-square">
                                <img src={src} alt={`Selected ${idx + 1}`} className="h-full w-full object-cover" />
                                {idx === 0 && <span className="absolute left-1 top-1 text-[10px] px-1.5 py-0.5 rounded bg-aira-cyan/80 text-aira-bg font-semibold">Primary</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingEvent && existingImages.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                    <p className="text-xs text-slate-400 mb-2">Existing images</p>
                    <p className="text-[11px] text-slate-500 mb-2">Drag cards to reorder gallery display</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {existingImages.map((img) => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={() => setDraggedImageId(img.id)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDropReorder(img.id)}
                                className={`relative rounded-lg border overflow-hidden cursor-move ${draggedImageId === img.id ? "border-aira-cyan/60" : "border-white/10"}`}
                            >
                                <img src={img.url} alt="Event" className="w-full h-24 object-cover" />
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1.5">
                                    <button onClick={() => setPrimaryImage(img.id)} className="text-[10px] px-1.5 py-1 rounded bg-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan/40 inline-flex items-center gap-1">
                                        <Star size={10} /> {img.isPrimary ? "Primary" : "Set"}
                                    </button>
                                    <button onClick={() => deleteImage(img.id)} className="text-[10px] px-1.5 py-1 rounded bg-aira-magenta/30 text-rose-300 hover:bg-aira-magenta/40 inline-flex items-center gap-1">
                                        <Trash2 size={10} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <motion.div className="space-y-6 relative" variants={containerVariants} initial="hidden" animate="show">
            <div className="absolute -top-10 -right-10 w-52 h-52 bg-aira-cyan/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-56 h-56 bg-aira-purple/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 glass p-6 rounded-2xl border border-white/5 animated-border">
                <div>
                    <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan text-glow-cyan">Events Management</h1>
                    <p className="text-slate-400 text-sm mt-1">Add complete event details and media</p>
                    <div className="flex gap-2 mt-4 text-xs">
                        <span className="px-2.5 py-1 rounded-full border border-aira-cyan/30 bg-aira-cyan/10 text-aira-cyan font-medium">Total: {events.length}</span>
                        <span className="px-2.5 py-1 rounded-full border border-aira-purple/30 bg-aira-purple/10 text-violet-300 font-medium">Upcoming: {upcomingCount}</span>
                    </div>
                </div>
                <button onClick={openCreateModal} className="flex items-center justify-center gap-2 px-4 py-2 bg-aira-cyan text-aira-bg font-semibold rounded-lg text-sm hover:scale-105 transition-transform glow-cyan min-h-[42px]">
                    <Plus size={16} /> Add Event
                </button>
            </motion.div>

            <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 overflow-hidden card-3d">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-xs uppercase text-slate-400">
                        <tr>
                            <th className="p-4 font-medium">Event</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {events.map((event, index) => (
                            <motion.tr key={event.id} className="hover:bg-white/5 transition-colors" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                                <td className="p-4 font-medium text-white">{event.title}</td>
                                <td className="p-4 text-slate-400 flex items-center gap-2"><Calendar size={14} className="text-aira-cyan" /> {new Date(event.date).toLocaleDateString()}</td>
                                <td className="p-4">{new Date(event.date) > new Date() ? <span className="badge-upcoming">Upcoming</span> : <span className="badge-completed">Completed</span>}</td>
                                <td className="p-4 flex gap-2 justify-end">
                                    <button onClick={() => openEditModal(event)} className="p-2 glass rounded text-aira-cyan hover:bg-aira-cyan/20"><Edit2 size={14} /></button>
                                    <button onClick={() => setDeletingEventId(event.id)} className="p-2 glass rounded text-aira-magenta hover:bg-aira-magenta/20"><Trash2 size={14} /></button>
                                </td>
                            </motion.tr>
                        ))}
                        {events.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    <p className="mb-3">No events found yet.</p>
                                    <button onClick={openCreateModal} className="px-3 py-2 text-xs rounded-lg border border-aira-cyan/40 text-aira-cyan hover:bg-aira-cyan/10 inline-flex items-center gap-2">
                                        <ImagePlus size={12} /> Create your first event
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            <AnimatedModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Create Event"
                subtitle="Full event information with images"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleCreateEvent} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Creating..." : "Create Event"}
                        </button>
                    </div>
                }
            >
                {EventFormFields}
            </AnimatedModal>

            <AnimatedModal
                open={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                title="Edit Event"
                subtitle="Update details and manage event images"
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingEvent(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting || isLoadingModalData} onClick={handleUpdateEvent} className="px-4 py-2 rounded-lg bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                }
            >
                {isLoadingModalData ? <p className="text-slate-400 text-sm">Loading event details...</p> : EventFormFields}
            </AnimatedModal>

            <AnimatedModal
                open={!!deletingEventId}
                onClose={() => setDeletingEventId(null)}
                title="Delete Event"
                subtitle="This action cannot be undone"
                footer={
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setDeletingEventId(null)} className="px-4 py-2 rounded-lg border border-white/15 text-slate-300 hover:bg-white/5">Cancel</button>
                        <button disabled={isSubmitting || !deletingEventId} onClick={() => deletingEventId && handleDeleteEvent(deletingEventId)} className="px-4 py-2 rounded-lg bg-aira-magenta text-white font-semibold disabled:opacity-60">
                            {isSubmitting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-slate-300">Are you sure you want to remove this event and all its images?</p>
            </AnimatedModal>
        </motion.div>
    );
}
