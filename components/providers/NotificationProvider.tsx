"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { Bell, ExternalLink, X, Sparkles, Volume2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    link?: string | null;
    read: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    unreadBadge: boolean;
    activeBanner: Notification | null;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    setUnreadBadge: (v: boolean) => void;
    dismissBanner: () => void;
    requestPushPermission: () => Promise<boolean>;
    pushPermission: NotificationPermission | "default";
    triggerLocalNotification: (notif: Partial<Notification>) => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    unreadBadge: false,
    activeBanner: null,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    setUnreadBadge: () => { },
    dismissBanner: () => { },
    requestPushPermission: async () => false,
    pushPermission: "default",
    triggerLocalNotification: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

// Web Audio API notification chime generator (Instagram / iOS / Snapchat pop style)
function playSocialChime() {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Tone 1: Soft high pop
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
        gain1.gain.setValueAtTime(0.18, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.22);

        // Tone 2: Crisp chime harmonic
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1174.66, now + 0.06); // D6
        gain2.gain.setValueAtTime(0.14, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.28);
    } catch {
        // Audio playback restricted by browser autoplay policies
    }
}

// Haptic feedback trigger for mobile
function triggerMobileHaptic() {
    try {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([60, 30, 60]);
        }
    } catch {}
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadBadge, setUnreadBadge] = useState(false);
    const [activeBanner, setActiveBanner] = useState<Notification | null>(null);
    const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");
    const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    // Check existing push permission
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
        }
    }, []);

    // Request native device push permission
    const requestPushPermission = async (): Promise<boolean> => {
        if (typeof window !== "undefined" && "Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setPushPermission(permission);
                return permission === "granted";
            } catch {
                return false;
            }
        }
        return false;
    };

    const showInstagramStyleBanner = useCallback((notif: Notification) => {
        // 1. Play chime
        playSocialChime();

        // 2. Trigger mobile vibration
        triggerMobileHaptic();

        // 3. Trigger native device push notification if permission granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
                new Notification(notif.title, {
                    body: notif.message,
                    icon: "/icon.svg",
                    badge: "/icon.svg",
                    tag: notif.id,
                });
            } catch {}
        }

        // 4. Show top dropdown banner
        setActiveBanner(notif);

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
            setActiveBanner(null);
        }, 7000); // 7s display time
    }, []);

    const dismissBanner = () => {
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        setActiveBanner(null);
    };

    // Fetch notifications from API
    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (!session?.user?.email) return;

        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const data = await res.json();
            const fetchedList: Notification[] = data.notifications || [];

            if (isInitial) {
                // Seed seen IDs on first load so we don't alert on historical notifications
                fetchedList.forEach(n => seenIdsRef.current.add(n.id));
                setNotifications(fetchedList);
                if (data.unreadCount > 0) setUnreadBadge(true);
            } else {
                // Find new unseen notifications
                const newItems = fetchedList.filter(n => !seenIdsRef.current.has(n.id) && !n.read);
                if (newItems.length > 0) {
                    newItems.forEach(n => seenIdsRef.current.add(n.id));
                    // Show banner for the newest one
                    showInstagramStyleBanner(newItems[0]);
                }
                setNotifications(fetchedList);
                setUnreadBadge(data.unreadCount > 0);
            }
        } catch {
            // Silently handle fetch error
        }
    }, [session, showInstagramStyleBanner]);

    // Initial load & Polling fallback
    useEffect(() => {
        if (session?.user?.email) {
            fetchNotifications(true);

            // Fast polling every 12 seconds for responsive updates across all devices
            const interval = setInterval(() => {
                fetchNotifications(false);
            }, 12000);

            return () => clearInterval(interval);
        }
    }, [session, fetchNotifications]);

    // Realtime Supabase Subscription
    useEffect(() => {
        if (!userId || userId.startsWith("local-bypass-")) return;

        const channel = supabase
            .channel(`realtime_notifications_${userId}`)
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
                    if (newNotif && !seenIdsRef.current.has(newNotif.id)) {
                        seenIdsRef.current.add(newNotif.id);
                        setNotifications((prev) => [newNotif, ...prev]);
                        setUnreadBadge(true);
                        showInstagramStyleBanner(newNotif);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, showInstagramStyleBanner]);

    const markAsRead = async (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const unreadLeft = notifications.filter((n) => !n.read && n.id !== id).length;
            setUnreadBadge(unreadLeft > 0);
        } catch {}
    };

    const markAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadBadge(false);
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAll: true }),
            });
        } catch {}
    };

    const triggerLocalNotification = (notif: Partial<Notification>) => {
        const fullNotif: Notification = {
            id: `local-${Date.now()}`,
            userId: userId || "local",
            title: notif.title || "AiRA Notification",
            message: notif.message || "You have a new update.",
            link: notif.link || null,
            read: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [fullNotif, ...prev]);
        setUnreadBadge(true);
        showInstagramStyleBanner(fullNotif);
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                unreadBadge,
                activeBanner,
                markAsRead,
                markAllAsRead,
                setUnreadBadge,
                dismissBanner,
                requestPushPermission,
                pushPermission,
                triggerLocalNotification,
            }}
        >
            {children}

            {/* ══ INSTAGRAM / SNAPCHAT STYLE DYNAMIC DROP-DOWN PUSH BANNER ══ */}
            <div className="fixed top-4 inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none">
                <AnimatePresence>
                    {activeBanner && (
                        <motion.div
                            initial={{ opacity: 0, y: -70, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -60, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            className="pointer-events-auto w-full max-w-md bg-slate-950/90 backdrop-blur-2xl border border-aira-cyan/40 rounded-3xl p-4 shadow-2xl shadow-aira-cyan/20 ring-1 ring-white/10"
                        >
                            {/* App Header Tag */}
                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-aira-cyan/50">
                                        AL
                                    </div>
                                    <span className="text-[11px] font-orbitron font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                        AiRA Lab <span className="w-1.5 h-1.5 rounded-full bg-aira-cyan animate-ping" />
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-sans">Just now</span>
                                    <button
                                        onClick={dismissBanner}
                                        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                        aria-label="Dismiss notification"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Notification Body */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aira-cyan/20 to-aira-purple/20 border border-aira-cyan/30 flex items-center justify-center shrink-0 text-aira-cyan shadow-inner">
                                    <Bell size={18} className="animate-bounce" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white truncate font-orbitron tracking-tight">
                                        {activeBanner.title}
                                    </h4>
                                    <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 font-sans leading-relaxed">
                                        {activeBanner.message}
                                    </p>

                                    {activeBanner.link && (
                                        <div className="mt-3 flex items-center justify-end">
                                            <Link
                                                href={activeBanner.link}
                                                onClick={dismissBanner}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aira-cyan text-aira-bg font-semibold text-xs hover:scale-105 transition-transform shadow-md shadow-aira-cyan/30"
                                            >
                                                Open Details <ExternalLink size={12} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}
