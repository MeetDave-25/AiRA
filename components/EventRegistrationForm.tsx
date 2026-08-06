"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EventRegistrationForm({ eventId, onComplete }: { eventId: string, onComplete?: () => void }) {
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check local storage for previous submission to this form
        const hasSubmitted = localStorage.getItem(`event_reg_${eventId}`);
        if (hasSubmitted) {
            setSubmitted(true);
            setLoading(false);
            return;
        }

        fetch(`/api/events/${eventId}/form`)
            .then(res => res.json())
            .then(data => {
                if (data.form && data.form.isOpen) {
                    setForm(data.form);
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Format answers array
        const formattedAnswers = Object.keys(answers).map(fieldId => ({
            fieldId,
            value: answers[fieldId]
        }));

        try {
            const res = await fetch(`/api/events/${eventId}/form/registrations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: formattedAnswers }),
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || "Failed to submit registration");

            toast.success("Successfully registered!");
            localStorage.setItem(`event_reg_${eventId}`, data.registrationId);
            setSubmitted(true);
            if (onComplete) onComplete();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (fieldId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
    };

    if (loading) return null; // Or a small skeleton
    
    if (submitted) {
        return (
            <div className="glass rounded-2xl p-6 border border-green-500/30 text-center mt-8">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">✓</div>
                <h3 className="text-lg font-bold text-white mb-2">Registration Complete</h3>
                <p className="text-slate-400 text-sm">Thank you! Your registration has been submitted successfully.</p>
            </div>
        );
    }

    if (!form) return null; // No open form

    // Check if deadline passed
    if (form.deadline && new Date(form.deadline) < new Date()) {
        return (
            <div className="glass rounded-2xl p-6 border border-white/5 text-center mt-8">
                <h3 className="text-lg font-bold text-white mb-2">Registration Closed</h3>
                <p className="text-slate-400 text-sm">The deadline to register for this event has passed.</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 border border-aira-cyan/30 mt-8" id="register">
            <div className="mb-6">
                <h2 className="text-xl font-orbitron font-bold text-white">Register for Event</h2>
                <p className="text-slate-400 text-sm mt-1">Fill out the form below to secure your spot.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.fields?.map((field: any) => (
                        <div key={field.id} className={['textarea'].includes(field.fieldType) ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                {field.label} {field.isRequired && <span className="text-aira-magenta">*</span>}
                            </label>
                            
                            {field.fieldType === 'textarea' ? (
                                <textarea
                                    required={field.isRequired}
                                    placeholder={field.placeholder || ""}
                                    value={answers[field.id] || ""}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-aira-cyan focus:ring-1 focus:ring-aira-cyan/50 resize-none transition-all"
                                />
                            ) : field.fieldType === 'select' ? (
                                <select
                                    required={field.isRequired}
                                    value={answers[field.id] || ""}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-aira-cyan focus:ring-1 focus:ring-aira-cyan/50 transition-all appearance-none"
                                >
                                    <option value="" disabled>Select {field.label}</option>
                                    {field.options?.map((opt: string, i: number) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : field.fieldType === 'radio' ? (
                                <div className="space-y-2 mt-2">
                                    {field.options?.map((opt: string, i: number) => (
                                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={field.id}
                                                value={opt}
                                                checked={answers[field.id] === opt}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                required={field.isRequired}
                                                className="text-aira-cyan bg-slate-900 border-white/20 focus:ring-aira-cyan/50"
                                            />
                                            <span className="text-sm text-slate-300">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : field.fieldType === 'checkbox' ? (
                                <div className="space-y-2 mt-2">
                                    {field.options?.map((opt: string, i: number) => (
                                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={opt}
                                                checked={(answers[field.id] || "").split(",").includes(opt)}
                                                onChange={(e) => {
                                                    const current = (answers[field.id] || "").split(",").filter(Boolean);
                                                    if (e.target.checked) {
                                                        handleChange(field.id, [...current, opt].join(","));
                                                    } else {
                                                        handleChange(field.id, current.filter(c => c !== opt).join(","));
                                                    }
                                                }}
                                                className="text-aira-cyan rounded bg-slate-900 border-white/20 focus:ring-aira-cyan/50"
                                            />
                                            <span className="text-sm text-slate-300">{opt}</span>
                                        </label>
                                    ))}
                                    {field.isRequired && !(answers[field.id] || "").trim() && (
                                        <input type="checkbox" required className="opacity-0 absolute -z-10" />
                                    )}
                                </div>
                            ) : (
                                <input
                                    type={field.fieldType}
                                    required={field.isRequired}
                                    placeholder={field.placeholder || ""}
                                    value={answers[field.id] || ""}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-white outline-none focus:border-aira-cyan focus:ring-1 focus:ring-aira-cyan/50 transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10 mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-aira-cyan text-aira-bg font-bold hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all disabled:opacity-70 disabled:hover:shadow-none"
                    >
                        {submitting ? "Submitting..." : "Submit Registration"}
                    </button>
                </div>
            </form>
        </div>
    );
}
