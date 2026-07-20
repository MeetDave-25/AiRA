"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { Bell, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    unreadBadge: boolean;
    setUnreadBadge: (v: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    unreadBadge: false,
    setUnreadBadge: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadBadge, setUnreadBadge] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Fetch initial notifications
        const fetchInitial = async () => {
            const { data } = await supabase
                .from("Notification")
                .select("*")
                .eq("userId", userId)
                .order("createdAt", { ascending: false })
                .limit(50);

            if (data) {
                setNotifications(data);
                if (data.some((n: Notification) => !n.read)) setUnreadBadge(true);
            }
        };

        fetchInitial();

        // Subscribe to real-time additions (INSERT)
        const channel = supabase
            .channel("realtime_notifications")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "Notification",
                    filter: `userId=eq.${userId}`,
                },
                (payload: any) => {
                    const newNotif = payload.new as Notification;

                    // Show a toast for the new notification
                    toast.custom((t) => (
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass border border-aira-cyan/30 bg-slate-900/90 rounded-2xl p-4 shadow-2xl flex items-start gap-4 max-w-sm pointer-events-auto"
                            >
                                <div className="w-10 h-10 rounded-full bg-aira-cyan/20 flex items-center justify-center shrink-0">
                                    <Bell size={18} className="text-aira-cyan" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm mb-1">{newNotif.title}</h3>
                                    <p className="text-slate-300 text-xs leading-relaxed mb-2 line-clamp-2">{newNotif.message}</p>
                                    <div className="flex items-center justify-between">
                                        {newNotif.link ? (
                                            <Link href={newNotif.link} onClick={() => toast.dismiss(t.id)} className="text-aira-cyan text-[11px] font-semibold flex items-center gap-1 hover:underline">
                                                View <ExternalLink size={10} />
                                            </Link>
                                        ) : <div />}
                                        <span className="text-[10px] text-slate-500">Just now</span>
                                    </div>
                                </div>
                                <button onClick={() => toast.dismiss(t.id)} className="p-1 rounded-full hover:bg-white/10 text-slate-400">
                                    <X size={14} />
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    ), { duration: 6000, position: "top-right" });

                    // Prepend to state
                    setNotifications(prev => [newNotif, ...prev]);
                    setUnreadBadge(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, supabase]);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        await supabase.from("Notification").update({ read: true }).eq("id", id);

        // Update badge if no more unread
        setNotifications(prev => {
            const hasUnread = prev.some(n => !n.read && n.id !== id);
            setUnreadBadge(hasUnread);
            return prev;
        });
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadBadge(false);
        await supabase.from("Notification").update({ read: true }).eq("userId", userId).eq("read", false);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, unreadBadge, setUnreadBadge }}>
            {children}
        </NotificationContext.Provider>
    );
}
