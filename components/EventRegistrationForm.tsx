"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, inputClass } from "@/components/nb/kit";

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

    if (loading) return null;

    if (submitted) {
        return (
            <div className="rounded-[22px] border-2 border-nb-ink bg-nb-mint shadow-nb p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center text-2xl font-bold shadow-nb-sm">✓</div>
                <h3 className="font-brico font-extrabold text-2xl">You&apos;re registered!</h3>
                <p className="mt-1 text-nb-ink/75">Thank you — your registration has been submitted successfully.</p>
            </div>
        );
    }

    if (!form) return null; // No open form

    // Check if deadline passed
    if (form.deadline && new Date(form.deadline) < new Date()) {
        return (
            <div className="rounded-[22px] border-2 border-nb-ink bg-white shadow-nb p-8 text-center">
                <h3 className="font-brico font-extrabold text-2xl">Registration closed</h3>
                <p className="mt-1 text-nb-muted">The deadline to register for this event has passed.</p>
            </div>
        );
    }

    const labelCls = "block font-brico font-bold text-sm mb-1.5";
    const optionCls = "flex items-center gap-2.5 cursor-pointer rounded-xl border-2 border-nb-ink bg-white px-3 py-2 text-sm font-medium";

    return (
        <div id="register" className="rounded-[22px] border-2 border-nb-ink bg-nb-sun shadow-nb-lg p-6 sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-nb-ink/70">Save your spot</p>
            <h2 className="mt-1 font-brico font-extrabold text-3xl tracking-tight">Register for this event</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.fields?.map((field: any) => (
                        <div key={field.id} className={['textarea'].includes(field.fieldType) ? 'md:col-span-2' : ''}>
                            <label className={labelCls}>
                                {field.label} {field.isRequired && <span className="text-nb-violet">*</span>}
                            </label>

                            {field.fieldType === 'textarea' ? (
                                <textarea
                                    required={field.isRequired}
                                    placeholder={field.placeholder || ""}
                                    value={answers[field.id] || ""}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    rows={3}
                                    className={`${inputClass} resize-none`}
                                />
                            ) : field.fieldType === 'select' ? (
                                <select
                                    required={field.isRequired}
                                    value={answers[field.id] || ""}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="" disabled>Select {field.label}</option>
                                    {field.options?.map((opt: string, i: number) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : field.fieldType === 'radio' ? (
                                <div className="space-y-2">
                                    {field.options?.map((opt: string, i: number) => (
                                        <label key={i} className={optionCls}>
                                            <input
                                                type="radio"
                                                name={field.id}
                                                value={opt}
                                                checked={answers[field.id] === opt}
                                                onChange={(e) => handleChange(field.id, e.target.value)}
                                                required={field.isRequired}
                                                className="accent-nb-violet w-4 h-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            ) : field.fieldType === 'checkbox' ? (
                                <div className="space-y-2 relative">
                                    {field.options?.map((opt: string, i: number) => (
                                        <label key={i} className={optionCls}>
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
                                                className="accent-nb-violet w-4 h-4"
                                            />
                                            {opt}
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
                                    className={inputClass}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="pt-2">
                    <Button type="submit" disabled={submitting} tone="ink" className="w-full sm:w-auto">
                        {submitting ? "Submitting…" : "Submit registration →"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
