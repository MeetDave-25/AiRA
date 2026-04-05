"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Trash2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface TaskUpdate {
    id: string;
    message: string;
    createdAt: string;
    task?: {
        id: string;
        title: string;
    };
    user?: {
        name: string;
        email: string;
    };
}

export default function TeamUpdatesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    const [updates, setUpdates] = useState<TaskUpdate[]>([]);
    const [teamData, setTeamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user?.teams || user.teams.length === 0) {
            router.push("/portal/dashboard");
            return;
        }

        const loadData = async () => {
            try {
                const teamId = user.teams[0].id;

                // Fetch team
                const teamRes = await fetch(`/api/teams?teamId=${teamId}`);
                const teams = teamRes.ok ? await teamRes.json() : [];
                const team = teams.find((t: any) => t.id === teamId);
                setTeamData(team);

                // Fetch team task updates (all updates for team tasks)
                const updatesRes = await fetch(`/api/task-updates?teamId=${teamId}`);
                const allUpdates = updatesRes.ok ? await updatesRes.json() : [];
                setUpdates(Array.isArray(allUpdates) ? allUpdates : []);
            } catch (error) {
                console.error("Error loading updates:", error);
                toast.error("Failed to load updates");
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // Poll for new updates every 30s
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [user, router]);

    const handlePostAnnouncement = async () => {
        if (!newMessage.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsSubmitting(true);
        try {
            // Create announcement as a special task update without taskId
            const res = await fetch("/api/task-updates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId: "ANNOUNCEMENT", // Special marker for announcements
                    message: `📢 ANNOUNCEMENT: ${newMessage}`,
                }),
            });

            if (!res.ok) throw new Error("Failed to post announcement");

            toast.success("Announcement posted!");
            setNewMessage("");

            // Reload updates
            if (user?.teams?.[0]) {
                const updatesRes = await fetch(`/api/task-updates?teamId=${user.teams[0].id}`);
                const allUpdates = updatesRes.ok ? await updatesRes.json() : [];
                setUpdates(Array.isArray(allUpdates) ? allUpdates : []);
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to post announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUpdate = async (updateId: string) => {
        if (!confirm("Delete this update?")) return;

        try {
            const res = await fetch(`/api/task-updates/${updateId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");

            setUpdates((prev) => prev.filter((u) => u.id !== updateId));
            toast.success("Update deleted");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-aira-cyan/30 border-t-aira-cyan rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading updates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 border border-white/5"
            >
                <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                    Team Updates
                </h1>
                <p className="text-slate-400">
                    Stay updated with {teamData?.name} progress
                </p>
            </motion.div>

            {/* Post New Update */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl border border-white/5 p-6"
            >
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={18} /> Share an Update
                </h2>
                <div className="flex gap-3">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share news, updates, or announcements with your team..."
                        rows={3}
                        className="flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-white outline-none focus:border-aira-cyan/60 resize-none"
                    />
                    <button
                        disabled={isSubmitting || !newMessage.trim()}
                        onClick={handlePostAnnouncement}
                        className="px-6 py-3 rounded-xl bg-aira-cyan text-aira-bg font-semibold disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Send size={16} />
                        Post
                    </button>
                </div>
            </motion.div>

            {/* Updates Timeline */}
            <div className="space-y-3">
                {updates.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 mx-auto text-slate-700 mb-4 opacity-50" />
                        <p className="text-slate-400">No updates yet</p>
                    </div>
                ) : (
                    updates.map((update, idx) => (
                        <motion.div
                            key={update.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass rounded-xl border border-white/5 p-5 hover:border-aira-cyan/30 transition-all group"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-white">
                                        {update.user?.name || "Someone"}
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(update.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {user?.id === update.user?.email && (
                                    <button
                                        onClick={() => handleDeleteUpdate(update.id)}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Task Reference */}
                            {update.task && (
                                <div className="mb-3 p-2 rounded-lg bg-slate-900/50 border border-white/5">
                                    <p className="text-xs text-slate-400">Referenced Task:</p>
                                    <p className="text-sm text-aira-cyan font-medium">{update.task.title}</p>
                                </div>
                            )}

                            {/* Message */}
                            <p className="text-slate-300 leading-relaxed">{update.message}</p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
