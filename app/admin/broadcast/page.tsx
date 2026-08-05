"use client";

import { useState, useEffect } from "react";
import { 
    Radio, 
    Send, 
    Bell, 
    Users, 
    Sparkles, 
    Volume2, 
    ShieldCheck, 
    Trophy, 
    Calendar, 
    AlertTriangle, 
    CheckCircle2, 
    ExternalLink, 
    Layers,
    Smartphone,
    X,
    Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNotifications } from "@/components/providers/NotificationProvider";

const CATEGORIES = [
    { id: "ANNOUNCEMENT", label: "Announcement", icon: "📢", desc: "General update or news", color: "from-aira-cyan to-blue-500" },
    { id: "EVENT", label: "Event / Hackathon", icon: "📅", desc: "New workshop or competition", color: "from-amber-500 to-orange-500" },
    { id: "ACHIEVEMENT", label: "Achievement", icon: "🏆", desc: "Lab award or milestone", color: "from-yellow-400 to-amber-600" },
    { id: "TASK", label: "Project Update", icon: "🚀", desc: "Development or sprint alert", color: "from-purple-500 to-pink-500" },
    { id: "ALERT", label: "Urgent Alert", icon: "⚡", desc: "Important deadline or action", color: "from-red-500 to-rose-600" },
];

const TARGETS = [
    { id: "ALL", label: "All Users (Broadcast to Everyone)", icon: Users },
    { id: "TEAM_MEMBER", label: "Team Members Only", icon: Layers },
    { id: "TEAM_LEAD", label: "Team Leads Only", icon: Sparkles },
    { id: "ADMIN", label: "Admin Team Only", icon: ShieldCheck },
];

export default function BroadcastPage() {
    const { triggerLocalNotification } = useNotifications();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    const [category, setCategory] = useState("ANNOUNCEMENT");
    const [targetAudience, setTargetAudience] = useState("ALL");
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/teams")
            .then(r => r.ok ? r.json() : [])
            .then(d => setTeams(Array.isArray(d) ? d : []))
            .catch(() => setTeams([]));
    }, []);

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) {
            toast.error("Please enter both a title and a message");
            return;
        }

        setIsSending(true);
        try {
            const res = await fetch("/api/notifications/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    message,
                    link: link.trim() || null,
                    category,
                    targetAudience: targetAudience === "TEAM" ? "TEAM" : targetAudience,
                    teamId: targetAudience === "TEAM" ? selectedTeamId : undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Broadcast failed");

            toast.success(`Broadcast sent successfully to ${data.recipientCount || "all"} user(s)!`);

            // Add to local history
            setBroadcastHistory(prev => [
                {
                    id: Date.now().toString(),
                    title: data.title || title,
                    message,
                    link,
                    category,
                    target: targetAudience,
                    recipients: data.recipientCount || 0,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
                ...prev,
            ]);

            // Reset form
            setTitle("");
            setMessage("");
            setLink("");
        } catch (error: any) {
            toast.error(error?.message || "Failed to send broadcast");
        } finally {
            setIsSending(false);
        }
    };

    const handleTestPreview = () => {
        if (!title.trim() && !message.trim()) {
            toast.error("Enter a title or message first to test");
            return;
        }
        triggerLocalNotification({
            title: title.trim() || "AiRA Broadcast Preview",
            message: message.trim() || "This is how users will see the real-time banner!",
            link: link.trim() || undefined,
        });
    };

    const currentCatObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

    return (
        <div className="space-y-8 relative max-w-5xl mx-auto">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-aira-cyan/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-72 h-72 bg-aira-magenta/15 blur-3xl rounded-full pointer-events-none" />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 md:p-8 rounded-3xl border border-white/10 animated-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-aira-magenta/20 text-aira-magenta border border-aira-magenta/40">
                                <Radio size={20} className="animate-pulse" />
                            </span>
                            <h1 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text-cyan">
                                Live Broadcast Center
                            </h1>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Instantly push real-time alerts like Instagram & Snapchat to all active users and portal members.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleTestPreview}
                        className="px-4 py-2.5 rounded-xl border border-aira-cyan/40 bg-aira-cyan/10 text-aira-cyan font-semibold text-xs flex items-center gap-2 hover:bg-aira-cyan/20 transition-all self-start md:self-auto"
                    >
                        <Volume2 size={16} /> Test Sound & Banner Preview
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Broadcast Composer Form (7 cols) */}
                <div className="lg:col-span-7">
                    <motion.form
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSendBroadcast}
                        className="glass p-6 rounded-3xl border border-white/10 space-y-5"
                    >
                        <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                            <Send size={18} className="text-aira-cyan" /> Compose Broadcast
                        </h2>

                        {/* Category Badges */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                1. Notification Type
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                                            category === cat.id
                                                ? "bg-white/15 border-aira-cyan text-white shadow-md shadow-aira-cyan/20"
                                                : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20"
                                        }`}
                                    >
                                        <span className="text-lg">{cat.icon}</span>
                                        <span className="text-xs font-bold text-white mt-1">{cat.label}</span>
                                        <span className="text-[10px] text-slate-400 leading-tight">{cat.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                2. Target Audience
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {TARGETS.map((t) => {
                                    const Icon = t.icon;
                                    return (
                                        <button
                                            type="button"
                                            key={t.id}
                                            onClick={() => setTargetAudience(t.id)}
                                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${
                                                targetAudience === t.id
                                                    ? "bg-aira-cyan/20 border-aira-cyan text-aira-cyan shadow-sm shadow-aira-cyan/20"
                                                    : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20"
                                            }`}
                                        >
                                            <Icon size={16} /> {t.label}
                                        </button>
                                    );
                                })}

                                {teams.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTargetAudience("TEAM");
                                            if (!selectedTeamId && teams.length > 0) setSelectedTeamId(teams[0].id);
                                        }}
                                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 sm:col-span-2 ${
                                            targetAudience === "TEAM"
                                                ? "bg-aira-purple/20 border-aira-purple text-violet-300 shadow-sm"
                                                : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20"
                                        }`}
                                    >
                                        <Layers size={16} /> Specific Team Only
                                    </button>
                                )}
                            </div>

                            {targetAudience === "TEAM" && (
                                <div className="mt-3">
                                    <select
                                        value={selectedTeamId}
                                        onChange={(e) => setSelectedTeamId(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-aira-purple/40 text-white text-xs outline-none"
                                    >
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                3. Notification Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Hackathon Registrations Are Now Live! 🚀"
                                maxLength={80}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/70 text-white placeholder-slate-500 text-sm outline-none focus:border-aira-cyan/50"
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                4. Message Content
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write the announcement message that all users will receive..."
                                rows={3}
                                maxLength={240}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-950/70 text-white placeholder-slate-500 text-sm outline-none focus:border-aira-cyan/50 resize-none font-sans"
                                required
                            />
                        </div>

                        {/* Action Link */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                5. Destination Link (Optional)
                            </label>
                            <input
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="e.g., /events or /portal/tasks or /achievements"
                                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/70 text-white placeholder-slate-500 text-xs outline-none focus:border-aira-cyan/50 font-mono"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button type="button" onClick={() => setLink("/events")} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400">
                                    + /events
                                </button>
                                <button type="button" onClick={() => setLink("/achievements")} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400">
                                    + /achievements
                                </button>
                                <button type="button" onClick={() => setLink("/portal/tasks")} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400">
                                    + /portal/tasks
                                </button>
                                <button type="button" onClick={() => setLink("/join")} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400">
                                    + /join
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-white font-orbitron font-bold text-sm tracking-wide hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-aira-cyan/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Send size={16} />
                            {isSending ? "Broadcasting..." : "Broadcast Real-Time Notification 🚀"}
                        </button>
                    </motion.form>
                </div>

                {/* Live Preview & Sent History (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Live Mobile Simulation Card */}
                    <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                        <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <Eye size={16} className="text-aira-cyan" /> Live Device Dropdown Preview
                        </h3>
                        <p className="text-xs text-slate-400">
                            Here is how the dynamic top banner will pop on users' screens when you broadcast:
                        </p>

                        {/* Simulated Phone Top Screen */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-white/15 relative overflow-hidden shadow-2xl">
                            <div className="w-24 h-3 bg-white/10 rounded-full mx-auto mb-4" />

                            {/* Simulated Dropdown Banner */}
                            <div className="bg-slate-900/90 backdrop-blur-xl border border-aira-cyan/40 rounded-2xl p-3.5 shadow-xl shadow-aira-cyan/10">
                                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-bold text-[8px] text-white">
                                            AL
                                        </div>
                                        <span className="font-orbitron font-bold text-slate-300">AiRA Lab</span>
                                    </div>
                                    <span className="text-slate-500">now</span>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <span className="text-xl shrink-0">{currentCatObj.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate font-orbitron">
                                            {title.trim() || "Your Notification Title Here"}
                                        </p>
                                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 font-sans">
                                            {message.trim() || "Your message preview will render here in real-time as you type."}
                                        </p>
                                    </div>
                                </div>

                                {link && (
                                    <div className="mt-2 text-right">
                                        <span className="inline-flex items-center gap-1 text-[10px] text-aira-cyan font-bold">
                                            Open Link <ExternalLink size={9} />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 rounded-xl bg-white/5 border border-white/5">
                            <Smartphone size={15} className="text-emerald-400 shrink-0" />
                            <span>Includes audio chime pop, haptic vibration, and native browser push.</span>
                        </div>
                    </div>

                    {/* Broadcast History */}
                    <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                        <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                            <Sparkles size={16} className="text-aira-gold" /> Session Broadcast History
                        </h3>

                        {broadcastHistory.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-4">
                                No broadcasts sent during this session yet.
                            </p>
                        ) : (
                            <div className="space-y-2.5 max-h-60 overflow-y-auto">
                                {broadcastHistory.map((item) => (
                                    <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-white truncate">{item.title}</span>
                                            <span className="text-[10px] text-slate-500">{item.time}</span>
                                        </div>
                                        <p className="text-slate-400 text-[11px] line-clamp-1">{item.message}</p>
                                        <div className="flex items-center justify-between text-[10px] text-aira-cyan pt-1">
                                            <span>Audience: {item.target}</span>
                                            <span>{item.recipients} delivered</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
