"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail, Phone, User, MessageSquare, Zap, Camera, X, Loader2, Linkedin, Github, Globe, Users } from "lucide-react";
import toast from "react-hot-toast";
import { Block, Button, Card, EASE, Mask, MevySays, WRAP, inputClass } from "@/components/nb/kit";

const interests = [
    "Web Development", "App Development", "AI/ML", "Cybersecurity",
    "Data Science", "Robotics", "Design", "Content Creation", "Management",
    "Events", "Hackathons", "Courses", "Other"
];

const EMPTY_FORM = { name: "", email: "", phone: "", interest: "", message: "", photo: "", linkedin: "", github: "", portfolio: "" };

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
    return (
        <div>
            <label className="block font-brico font-bold text-sm mb-1.5">{label}</label>
            <div className="relative">
                {Icon && <Icon size={16} className="absolute left-3.5 top-[1.15rem] -translate-y-1/2 text-nb-muted pointer-events-none" />}
                {children}
            </div>
        </div>
    );
}

export default function JoinPage() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file (JPG, PNG, WEBP, etc.)");
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            toast.error("Image file size must be less than 8MB");
            return;
        }

        setUploadingPhoto(true);
        const toastId = toast.loading("Uploading photo...");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "applications");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to upload photo");
            }

            setForm((prev) => ({ ...prev, photo: data.url }));
            toast.success("Photo uploaded successfully!", { id: toastId });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error?.message || "Failed to upload photo", { id: toastId });
        } finally {
            setUploadingPhoto(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemovePhoto = () => {
        setForm((prev) => ({ ...prev, photo: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) return toast.error("Name and email are required");

        setSubmitting(true);
        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSubmitted(true);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch {
            toast.error("Failed to submit. Check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-5 pt-32 pb-24">
                <motion.div initial={{ scale: 0.9, opacity: 0, rotate: -3 }} animate={{ scale: 1, opacity: 1, rotate: -1 }} transition={{ type: "spring", stiffness: 200 }} className="max-w-lg w-full">
                    <Card className="relative p-8 sm:p-10 text-center" color="bg-nb-mint">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/mevy-cutout.webp" alt="" aria-hidden="true" className="mx-auto -mt-28 h-40 w-auto drop-shadow-[4px_6px_0_rgba(17,17,17,0.9)]" />
                        <h2 className="mt-4 font-brico font-extrabold text-3xl tracking-tight">Welcome aboard, {form.name.split(" ")[0]}!</h2>
                        <p className="mt-3 text-nb-ink/80 leading-relaxed">
                            Your application is in. We&apos;ll review it and reach out at <strong>{form.email}</strong> soon.
                        </p>
                        <Button onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }} tone="white" className="mt-6">
                            Submit another
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const input = `${inputClass} pl-10`;

    return (
        <div className={`${WRAP} min-h-screen pt-32 sm:pt-36 pb-24`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left: pitch */}
                <div className="lg:col-span-5 lg:sticky lg:top-32">
                    <MevySays>Filling this in takes two minutes. I&apos;ll make sure the team sees it!</MevySays>
                    <p className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">Join us</p>
                    <h1 className="mt-3 font-brico font-extrabold tracking-[-0.04em] leading-[1] text-[clamp(2.8rem,6vw,5rem)]">
                        <Mask play>Become part</Mask>
                        <Mask play delay={0.1}>
                            of the{" "}
                            <Block color="bg-nb-sun" tilt={-2}>
                                community.
                            </Block>
                        </Mask>
                    </h1>
                    <p className="mt-6 text-lg text-nb-muted leading-relaxed">
                        AiRA Lab is student-led — members build software, AI and robotics together, run events and learn from each other. No experience needed, just curiosity.
                    </p>

                    <div className="mt-8 space-y-3">
                        {[
                            { icon: Zap, title: "Build real projects", desc: "Ship software, AI and robotics work people actually use", color: "bg-nb-sky" },
                            { icon: Users, title: "Learn together", desc: "Mentorship from seniors, faculty and industry folks", color: "bg-nb-peach" },
                            { icon: CheckCircle, title: "Grow your portfolio", desc: "Get recognised for your work and achievements", color: "bg-nb-mint" },
                        ].map(({ icon: Icon, title, desc, color }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1, ease: EASE }}
                                className={`flex items-start gap-3 rounded-2xl border-2 border-nb-ink p-4 shadow-nb-sm ${color}`}
                            >
                                <span className="w-10 h-10 shrink-0 rounded-xl border-2 border-nb-ink bg-white flex items-center justify-center">
                                    <Icon size={17} />
                                </span>
                                <div>
                                    <p className="font-brico font-bold">{title}</p>
                                    <p className="text-sm text-nb-ink/75">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right: form */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: EASE }} className="lg:col-span-7">
                    <Card className="p-6 sm:p-9" color="bg-white">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-brico font-extrabold text-2xl sm:text-3xl tracking-tight">Application form</h2>
                            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nb-muted">* required</span>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            {/* Photo */}
                            <div>
                                <label className="flex items-center justify-between font-brico font-bold text-sm mb-1.5">
                                    <span>Profile picture (optional)</span>
                                    <span className="font-mono text-[10px] font-normal text-nb-muted">JPG · PNG · WEBP, max 8MB</span>
                                </label>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                {form.photo ? (
                                    <div className="flex items-center gap-4 rounded-2xl border-2 border-nb-ink bg-nb-mint p-3 shadow-nb-sm">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={form.photo} alt="Profile preview" className="w-16 h-16 rounded-xl border-2 border-nb-ink object-cover shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold flex items-center gap-1.5"><CheckCircle size={15} /> Photo attached</p>
                                            <p className="text-xs text-nb-ink/70">Will be featured on your member card</p>
                                        </div>
                                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} className="px-3 py-1.5 rounded-lg border-2 border-nb-ink bg-white text-xs font-bold">
                                            Change
                                        </button>
                                        <button type="button" onClick={handleRemovePhoto} title="Remove photo" className="p-1.5 rounded-lg border-2 border-nb-ink bg-white">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                                        disabled={uploadingPhoto}
                                        className="w-full rounded-2xl border-2 border-dashed border-nb-ink bg-nb-paper p-5 text-center transition-colors hover:bg-nb-lilac disabled:opacity-60"
                                    >
                                        {uploadingPhoto ? (
                                            <span className="flex flex-col items-center gap-2 font-medium text-sm">
                                                <Loader2 size={24} className="animate-spin" /> Uploading profile picture…
                                            </span>
                                        ) : (
                                            <span className="flex flex-col items-center gap-1.5">
                                                <span className="w-11 h-11 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm">
                                                    <Camera size={18} />
                                                </span>
                                                <span className="font-bold text-sm">Click to upload your photo</span>
                                                <span className="text-xs text-nb-muted">A clear face picture for your member card</span>
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Full name *" icon={User}>
                                    <input type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className={input} />
                                </Field>
                                <Field label="Email *" icon={Mail}>
                                    <input type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className={input} />
                                </Field>
                                <Field label="Phone" icon={Phone}>
                                    <input type="tel" placeholder="+91 00000 00000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={input} />
                                </Field>
                                <Field label="Area of interest">
                                    <select value={form.interest} onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))} className={`${inputClass} appearance-none`}>
                                        <option value="">Select your interest</option>
                                        {interests.map((i) => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </Field>
                                <Field label="LinkedIn (optional)" icon={Linkedin}>
                                    <input type="url" placeholder="linkedin.com/in/…" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} className={input} />
                                </Field>
                                <Field label="GitHub (optional)" icon={Github}>
                                    <input type="url" placeholder="github.com/…" value={form.github} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} className={input} />
                                </Field>
                            </div>

                            <Field label="Portfolio / website (optional)" icon={Globe}>
                                <input type="url" placeholder="yourportfolio.com or behance.net/…" value={form.portfolio} onChange={(e) => setForm((f) => ({ ...f, portfolio: e.target.value }))} className={input} />
                            </Field>

                            <Field label="Message" icon={MessageSquare}>
                                <textarea
                                    placeholder="Tell us about yourself and why you want to join AiRA Lab…"
                                    value={form.message}
                                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                    rows={4}
                                    className={`${input} resize-none`}
                                />
                            </Field>

                            <Button type="submit" disabled={submitting || uploadingPhoto} className="w-full py-4 text-lg">
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={17} /> Submit application</>}
                            </Button>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
