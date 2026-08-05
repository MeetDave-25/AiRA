"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { Bell, ExternalLink, X, Smartphone, Sparkles, Volume2, ShieldCheck, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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
    triggerDelayedOutsideTest: (seconds?: number) => void;
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
    triggerDelayedOutsideTest: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

// Crystal-clear acoustic bell chime synthesizer (Apple / Glass Bell resonance)
function playBellChime() {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Strike 1 (High Crystal Ting - C6)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1046.5, now);
        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Strike 2 (Bell Harmony - E6)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1318.5, now + 0.08);
        gain2.gain.setValueAtTime(0.25, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 1.2);

        // Resonant Body (G6 Bell body with warm decay)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "triangle";
        osc3.frequency.setValueAtTime(1567.98, now + 0.12);
        gain3.gain.setValueAtTime(0.18, now + 0.12);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.12);
        osc3.stop(now + 1.4);

        // Sparkle Harmonic (High subtle overtone - E7)
        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.type = "sine";
        osc4.frequency.setValueAtTime(2637.0, now + 0.12);
        gain4.gain.setValueAtTime(0.08, now + 0.12);
        gain4.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc4.connect(gain4);
        gain4.connect(ctx.destination);
        osc4.start(now + 0.12);
        osc4.stop(now + 0.8);
    } catch {
        // Audio restricted by browser
    }
}

// Haptic feedback trigger for mobile
function triggerMobileHaptic() {
    try {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([100, 50, 100, 50, 100]);
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
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    // Check existing push permission & show prompt if not decided
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
            if (Notification.permission === "default") {
                const timer = setTimeout(() => {
                    const dismissed = localStorage.getItem("aira_push_prompt_dismissed");
                    if (!dismissed) setShowPushPrompt(true);
                }, 4000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // Request native device push permission (for Outside-App Lock Screen Push)
    const requestPushPermission = async (): Promise<boolean> => {
        if (typeof window !== "undefined" && "Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setPushPermission(permission);
                setShowPushPrompt(false);

                if (permission === "granted") {
                    // Send an immediate test notification to confirm
                    triggerNativeOutsideNotification({
                        title: "🔔 AiRA Lab Alerts Enabled!",
                        message: "You will now receive instant lock screen notifications like Instagram & Snapchat.",
                        link: "/portal/dashboard",
                    });
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        }
        return false;
    };

    // Helper: Trigger Native OS-Level Notification (Shows outside app, on lock screen, status bar)
    const triggerNativeOutsideNotification = (notif: { title: string; message: string; link?: string | null }) => {
        if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
            return;
        }

        try {
            // If service worker is active, trigger system-level notification via service worker
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification(notif.title, {
                        body: notif.message,
                        icon: "/icon.svg",
                        badge: "/icon.svg",
                        vibrate: [200, 100, 200, 100, 200],
                        tag: `aira-push-${Date.now()}`,
                        renotify: true,
                        data: {
                            url: notif.link || "/",
                        },
                    } as any);
                }).catch(() => {
                    // Fallback to standard Notification API
                    new Notification(notif.title, {
                        body: notif.message,
                        icon: "/icon.svg",
                    });
                });
            } else {
                new Notification(notif.title, {
                    body: notif.message,
                    icon: "/icon.svg",
                });
            }
        } catch {}
    };

    const showInstagramStyleBanner = useCallback((notif: Notification) => {
        // 1. Play crystal bell chime
        playBellChime();

        // 2. Trigger mobile haptic vibration
        triggerMobileHaptic();

        // 3. Trigger OS Lock Screen / Outside-App Push Notification
        triggerNativeOutsideNotification(notif);

        // 4. Show top in-app dynamic dropdown banner
        setActiveBanner(notif);

        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = setTimeout(() => {
            setActiveBanner(null);
        }, 7000);
    }, []);

    const dismissBanner = () => {
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        setActiveBanner(null);
    };

    // Delayed outside test helper so user can lock screen or switch apps to test!
    const triggerDelayedOutsideTest = (seconds: number = 4) => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
            requestPushPermission().then((granted) => {
                if (granted) {
                    toast.success(`Lock your phone or switch apps! Notification will pop in ${seconds}s 🔔`);
                    setTimeout(() => {
                        triggerNativeOutsideNotification({
                            title: "🚀 AiRA Lab: Lock Screen Alert!",
                            message: "This notification appeared outside the app just like Instagram & Snapchat!",
                            link: "/events",
                        });
                        playBellChime();
                    }, seconds * 1000);
                } else {
                    toast.error("Please allow notification permission to receive lock screen alerts.");
                }
            });
            return;
        }

        toast.success(`Lock your phone or switch apps! Alert will pop in ${seconds}s 🔔`);
        setTimeout(() => {
            triggerNativeOutsideNotification({
                title: "🚀 AiRA Lab: Lock Screen Alert!",
                message: "This notification appeared outside the app just like Instagram & Snapchat!",
                link: "/events",
            });
            playBellChime();
        }, seconds * 1000);
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
                fetchedList.forEach((n) => seenIdsRef.current.add(n.id));
                setNotifications(fetchedList);
                if (data.unreadCount > 0) setUnreadBadge(true);
            } else {
                const newItems = fetchedList.filter((n) => !seenIdsRef.current.has(n.id) && !n.read);
                if (newItems.length > 0) {
                    newItems.forEach((n) => seenIdsRef.current.add(n.id));
                    showInstagramStyleBanner(newItems[0]);
                }
                setNotifications(fetchedList);
                setUnreadBadge(data.unreadCount > 0);
            }
        } catch {}
    }, [session, showInstagramStyleBanner]);

    // Initial load & Polling fallback every 12s
    useEffect(() => {
        if (session?.user?.email) {
            fetchNotifications(true);

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
                triggerDelayedOutsideTest,
            }}
        >
            {children}

            {/* ══ OUTSIDE-APP LOCK SCREEN PUSH PROMPT PILL ══ */}
            <AnimatePresence>
                {showPushPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99995] w-full max-w-sm px-4 pointer-events-auto"
                    >
                        <div className="bg-slate-950/95 backdrop-blur-2xl border border-aira-cyan/50 rounded-2xl p-3.5 shadow-2xl shadow-black flex items-center justify-between gap-3 ring-1 ring-aira-cyan/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-aira-cyan/20 flex items-center justify-center text-aira-cyan shrink-0">
                                    <Smartphone size={17} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate">Enable Outside-App Alerts</p>
                                    <p className="text-[10px] text-slate-400 truncate">Get lock screen alerts like Instagram</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={requestPushPermission}
                                    className="px-3 py-1.5 rounded-xl bg-aira-cyan text-aira-bg font-bold text-xs hover:scale-105 transition-transform"
                                >
                                    Enable
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPushPrompt(false);
                                        localStorage.setItem("aira_push_prompt_dismissed", "true");
                                    }}
                                    className="p-1 text-slate-500 hover:text-white"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ INSTAGRAM / SNAPCHAT STYLE DYNAMIC DROP-DOWN PUSH BANNER ══ */}
            <div className="fixed top-4 inset-x-0 z-[99999] flex justify-center px-4 pointer-events-none">
                <AnimatePresence>
                    {activeBanner && (
                        <motion.div
                            initial={{ opacity: 0, y: -70, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -60, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            className="pointer-events-auto w-full max-w-md bg-slate-950/95 backdrop-blur-2xl border border-aira-cyan/40 rounded-3xl p-4 shadow-2xl shadow-aira-cyan/20 ring-1 ring-white/10"
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
