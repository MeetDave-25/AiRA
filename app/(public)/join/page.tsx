"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail, Phone, User, MessageSquare, Zap } from "lucide-react";
import toast from "react-hot-toast";

const interests = [
    "Web Development", "App Development", "AI/ML", "Cybersecurity",
    "Data Science", "Robotics", "Design", "Content Creation", "Management", "Other"
];

export default function JoinPage() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", interest: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
                        onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", interest: "", message: "" }); }}
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
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-aira-cyan to-aira-purple text-white font-semibold text-sm hover:shadow-lg hover:shadow-aira-cyan/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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
