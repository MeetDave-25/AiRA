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
    openPushPrompt: () => void;
    pushPermission: NotificationPermission | "default";
    triggerLocalNotification: (notif: Partial<Notification>) => void;
    triggerDelayedOutsideTest: (customData?: { title?: string; message?: string; link?: string }, seconds?: number) => void;
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
    openPushPrompt: () => { },
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
    const [showBlockedGuide, setShowBlockedGuide] = useState(false);
    const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    // Prompt user on visit if notifications are not yet enabled (just like mobile games / Instagram)
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
            if (Notification.permission !== "granted") {
                const sessionDismissed = sessionStorage.getItem("aira_notif_prompt_session_dismissed");
                if (!sessionDismissed) {
                    const timer = setTimeout(() => {
                        setShowPushPrompt(true);
                    }, 2200);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, []);

    const openPushPrompt = () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
            if (Notification.permission === "denied") {
                setShowBlockedGuide(true);
            } else {
                setShowPushPrompt(true);
            }
        } else {
            setShowPushPrompt(true);
        }
    };

    // Request native device push permission (for Outside-App Lock Screen Push)
    const requestPushPermission = async (): Promise<boolean> => {
        if (typeof window !== "undefined" && "Notification" in window) {
            try {
                if (Notification.permission === "denied") {
                    setShowPushPrompt(false);
                    setShowBlockedGuide(true);
                    return false;
                }

                const permission = await Notification.requestPermission();
                setPushPermission(permission);
                setShowPushPrompt(false);

                if (permission === "granted") {
                    playBellChime();
                    toast.success("🔔 Instant notifications enabled!");
                    triggerNativeOutsideNotification({
                        title: "🔔 AiRA Lab Alerts Enabled!",
                        message: "You will now receive instant lock screen notifications like Instagram & Snapchat.",
                        link: "/portal/dashboard",
                    });
                    return true;
                } else if (permission === "denied") {
                    setShowBlockedGuide(true);
                    return false;
                }
                return false;
            } catch {
                return false;
            }
        }
        return false;
    };

    const handleSessionOnly = () => {
        playBellChime();
        setShowPushPrompt(false);
        sessionStorage.setItem("aira_notif_prompt_session_dismissed", "true");
        toast("🔊 In-app sound & live drop alerts active for this visit!", { icon: "🔔" });
    };

    const handleDecline = () => {
        setShowPushPrompt(false);
        sessionStorage.setItem("aira_notif_prompt_session_dismissed", "true");
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

    // Delayed outside test helper so user can lock screen or switch apps to test with custom message!
    const triggerDelayedOutsideTest = (customData?: { title?: string; message?: string; link?: string }, seconds: number = 4) => {
        const finalTitle = customData?.title?.trim() || "🚀 AiRA Lab: Lock Screen Alert!";
        const finalMessage = customData?.message?.trim() || "This notification appeared outside the app just like Instagram & Snapchat!";
        const finalLink = customData?.link?.trim() || "/portal/dashboard";

        const deliverAlert = () => {
            triggerNativeOutsideNotification({
                title: finalTitle,
                message: finalMessage,
                link: finalLink,
            });
            playBellChime();
        };

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
            requestPushPermission().then((granted) => {
                if (granted) {
                    toast.success(`Lock your phone or switch apps! Your custom notification will pop in ${seconds}s 🔔`);
                    setTimeout(deliverAlert, seconds * 1000);
                } else {
                    toast.error("Please allow notification permission to receive lock screen alerts.");
                }
            });
            return;
        }

        toast.success(`Lock your phone or switch apps! Your custom alert will pop in ${seconds}s 🔔`);
        setTimeout(deliverAlert, seconds * 1000);
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
                openPushPrompt,
                pushPermission,
                triggerLocalNotification,
                triggerDelayedOutsideTest,
            }}
        >
            {children}

            {/* ══ OUTSIDE-APP LOCK SCREEN PUSH PERMISSION CARD (Game & Instagram Style) ══ */}
            <AnimatePresence>
                {showPushPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className="fixed bottom-4 inset-x-3 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:w-96 z-[99995] pointer-events-auto mx-auto max-w-md"
                    >
                        <div className="relative bg-slate-950/95 backdrop-blur-2xl border border-aira-cyan/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/90 ring-1 ring-white/15 overflow-hidden">
                            {/* Glowing background highlights */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-aira-cyan/20 blur-2xl rounded-full pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-aira-purple/20 blur-2xl rounded-full pointer-events-none" />

                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 relative z-10 mb-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aira-cyan/20 to-aira-purple/30 border border-aira-cyan/40 flex items-center justify-center text-aira-cyan shadow-md shrink-0">
                                        <Bell size={20} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-1.5">
                                            Enable Notifications
                                            <span className="w-2 h-2 rounded-full bg-aira-cyan animate-ping" />
                                        </h3>
                                        <p className="text-[11px] text-slate-400 font-sans">Lock screen & real-time updates</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDecline}
                                    className="w-7 h-7 rounded-full glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all shrink-0"
                                    aria-label="Close notification prompt"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Body Message */}
                            <p className="text-xs text-slate-300 font-sans leading-relaxed relative z-10 mb-3.5">
                                Would you like to receive instant notifications for live event broadcasts, leadership announcements, and tasks (like Instagram & Snapchat)?
                            </p>

                            {/* 3-Action Options */}
                            <div className="flex flex-col gap-2 relative z-10">
                                <button
                                    onClick={requestPushPermission}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-aira-cyan via-blue-500 to-aira-purple text-white font-orbitron font-bold text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-aira-cyan/25 flex items-center justify-center gap-2"
                                >
                                    <Bell size={14} /> Always Allow
                                </button>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleSessionOnly}
                                        className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Volume2 size={12} className="text-aira-cyan" /> While Using App
                                    </button>

                                    <button
                                        onClick={handleDecline}
                                        className="py-2 px-3 rounded-xl glass border border-white/10 text-slate-400 hover:text-white font-semibold text-[11px] transition-colors"
                                    >
                                        Don&apos;t Allow
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ BROWSER UNBLOCK GUIDE MODAL (If user previously clicked 'Block' in browser) ══ */}
            <AnimatePresence>
                {showBlockedGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowBlockedGuide(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-slate-950 border border-aira-cyan/50 rounded-3xl p-6 shadow-2xl shadow-aira-cyan/20 ring-1 ring-white/10 relative overflow-hidden"
                        >
                            <div className="absolute -top-12 -right-12 w-36 h-36 bg-aira-cyan/20 blur-3xl rounded-full pointer-events-none" />

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-orbitron font-bold text-sm text-white">Unblock in Browser</h3>
                                        <p className="text-xs text-slate-400">Notifications are currently blocked</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowBlockedGuide(false)}
                                    className="p-1.5 rounded-full glass border border-white/10 text-slate-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                                Your browser is currently blocking notifications for this site. Follow these quick steps to enable them:
                            </p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                                    <span className="w-6 h-6 rounded-full bg-aira-cyan/20 text-aira-cyan font-bold text-xs flex items-center justify-center shrink-0">1</span>
                                    <p className="text-xs text-slate-300">
                                        Click the <strong className="text-white">🔒 Lock / Settings icon</strong> next to the URL in your browser address bar.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                                    <span className="w-6 h-6 rounded-full bg-aira-cyan/20 text-aira-cyan font-bold text-xs flex items-center justify-center shrink-0">2</span>
                                    <p className="text-xs text-slate-300">
                                        Find <strong className="text-white">Notifications</strong> and switch it to <strong className="text-emerald-400">Allow</strong>.
                                    </p>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
                                    <span className="w-6 h-6 rounded-full bg-aira-cyan/20 text-aira-cyan font-bold text-xs flex items-center justify-center shrink-0">3</span>
                                    <p className="text-xs text-slate-300">
                                        Refresh the page or tap the button below to confirm.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (typeof window !== "undefined" && "Notification" in window) {
                                            if (Notification.permission === "granted") {
                                                setPushPermission("granted");
                                                setShowBlockedGuide(false);
                                                toast.success("Notifications are now unblocked & active!");
                                                playBellChime();
                                            } else {
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-aira-cyan text-aira-bg font-orbitron font-bold text-xs hover:scale-105 transition-transform text-center shadow-lg shadow-aira-cyan/20"
                                >
                                    Check Status / Reload
                                </button>
                                <button
                                    onClick={() => setShowBlockedGuide(false)}
                                    className="px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
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
