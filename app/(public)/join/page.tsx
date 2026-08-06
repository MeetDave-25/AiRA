"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail, Phone, User, MessageSquare, Zap, UploadCloud, Camera, X, Loader2, Image as ImageIcon, Linkedin, Github } from "lucide-react";
import toast from "react-hot-toast";

const interests = [
    "Web Development", "App Development", "AI/ML", "Cybersecurity",
    "Data Science", "Robotics", "Design", "Content Creation", "Management", "Other"
];

export default function JoinPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "", photo: "", linkedin: "", github: "" });
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
            <div className="min-h-screen flex items-center justify-center px-4 pt-24">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-center glass rounded-3xl p-12 max-w-md border border-aira-green/30 glow-cyan"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        <CheckCircle size={64} className="text-aira-green mx-auto mb-6" />
                    </motion.div>
                    <h2 className="font-orbitron font-bold text-2xl text-white mb-3">Application Submitted!</h2>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Thank you, <span className="text-aira-cyan font-medium">{form.name}</span>! Your application has been received.
                        We&apos;ll review it and reach out to you at <span className="text-aira-cyan">{form.email}</span> soon.
                    </p>
                    <button
                        onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", interest: "", message: "", photo: "", linkedin: "", github: "" }); }}
                        className="px-6 py-3 rounded-xl glass border border-aira-cyan/30 text-aira-cyan text-sm hover:bg-aira-cyan/10 transition-all"
                    >
                        Submit Another
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left info */}
                <div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-aira-cyan font-medium text-sm mb-2 font-orbitron tracking-widest uppercase"
                    >
                        Join Us
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-orbitron font-black text-4xl sm:text-5xl text-white mb-6 leading-tight"
                    >
                        Be Part of<br /><span className="gradient-text">AiRA Lab</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-300 leading-relaxed mb-8"
                    >
                        We&apos;re always looking for passionate individuals who want to make a difference through technology and innovation.
                        Fill out the form and our team will get back to you soon.
                    </motion.p>

                    <div className="space-y-4">
                        {[
                            { icon: Zap, title: "Work on real projects", desc: "Contribute to impactful lab initiatives and events" },
                            { icon: User, title: "Learn from experts", desc: "Mentorship from seniors and industry professionals" },
                            { icon: CheckCircle, title: "Build your portfolio", desc: "Get recognized for your work and achievements" },
                        ].map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-start gap-3 p-4 glass rounded-xl border border-white/5"
                            >
                                <div className="w-9 h-9 rounded-lg bg-aira-cyan/10 border border-aira-cyan/20 flex items-center justify-center shrink-0">
                                    <Icon size={16} className="text-aira-cyan" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-white">{title}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-3xl p-8 border border-aira-cyan/20"
                >
                    <h2 className="font-orbitron font-bold text-lg text-white mb-6">Application Form</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Profile Picture Upload Field */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block font-medium flex items-center justify-between">
                                <span>Profile Picture (Optional)</span>
                                <span className="text-[10px] text-aira-cyan font-mono">JPG, PNG, WEBP (Max 8MB)</span>
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />

                            {form.photo ? (
                                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 border border-aira-cyan/40">
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-slate-800">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={form.photo}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                            <CheckCircle size={14} className="text-emerald-400 shrink-0" /> Photo attached
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Will be featured on your team badge</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-200 transition-colors"
                                        >
                                            Change
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Remove photo"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                                    className={`group border-2 border-dashed border-white/15 hover:border-aira-cyan/50 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-aira-cyan/5 ${
                                        uploadingPhoto ? "opacity-60 pointer-events-none" : ""
                                    }`}
                                >
                                    {uploadingPhoto ? (
                                        <div className="flex flex-col items-center justify-center py-2 space-y-2">
                                            <Loader2 size={24} className="text-aira-cyan animate-spin" />
                                            <p className="text-xs text-slate-300 font-medium">Uploading profile picture...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                                            <div className="w-10 h-10 rounded-full bg-aira-cyan/10 border border-aira-cyan/20 flex items-center justify-center text-aira-cyan group-hover:scale-110 transition-transform">
                                                <Camera size={18} />
                                            </div>
                                            <p className="text-xs font-semibold text-white">
                                                Click to upload your profile photo
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Add a clear face picture for your member card
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Full Name *</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    required
                                    className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email *</label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                    className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Phone</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel"
                                    placeholder="+91 00000 00000"
                                    value={form.phone}
                                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Area of Interest</label>
                            <select
                                value={form.interest}
                                onChange={(e) => setForm(f => ({ ...f, interest: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 focus:outline-none focus:border-aira-cyan/50 bg-aira-card"
                            >
                                <option value="">Select your interest</option>
                                {interests.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block font-medium">LinkedIn Profile (Optional)</label>
                                <div className="relative">
                                    <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="url"
                                        placeholder="linkedin.com/in/..."
                                        value={form.linkedin}
                                        onChange={(e) => setForm(f => ({ ...f, linkedin: e.target.value }))}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block font-medium">GitHub Profile (Optional)</label>
                                <div className="relative">
                                    <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="url"
                                        placeholder="github.com/..."
                                        value={form.github}
                                        onChange={(e) => setForm(f => ({ ...f, github: e.target.value }))}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Message</label>
                            <div className="relative">
                                <MessageSquare size={14} className="absolute left-3 top-3.5 text-slate-500" />
                                <textarea
                                    placeholder="Tell us about yourself and why you want to join AiRA Lab..."
                                    value={form.message}
                                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                    rows={4}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl glass border border-aira-border/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aira-cyan/50 bg-transparent resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || uploadingPhoto}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold text-sm hover:shadow-lg hover:shadow-aira-cyan/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 font-orbitron uppercase tracking-wider"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send size={16} /> Submit Application
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
