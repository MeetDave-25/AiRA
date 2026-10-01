"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { Bell, ExternalLink, X, Volume2, ShieldCheck } from "lucide-react";
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

// ══ SHARED AUDIO CONTEXT & UNLOCK SYSTEM ══
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
        if (!sharedAudioCtx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                sharedAudioCtx = new AudioCtx();
            }
        }
        if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
            sharedAudioCtx.resume().catch(() => {});
        }
        return sharedAudioCtx;
    } catch {
        return null;
    }
}

// Crystal-clear acoustic bell chime (Apple / Glass Bell resonance)
function playBellChime() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // Strike 1 (High Crystal Ting - C6)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1046.5, now);
        gain1.gain.setValueAtTime(0.25, now);
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
        gain2.gain.setValueAtTime(0.28, now + 0.08);
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
        gain3.gain.setValueAtTime(0.2, now + 0.12);
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
        gain4.gain.setValueAtTime(0.1, now + 0.12);
        gain4.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc4.connect(gain4);
        gain4.connect(ctx.destination);
        osc4.start(now + 0.12);
        osc4.stop(now + 0.8);
    } catch {}
}

// Haptic feedback trigger for mobile
function triggerMobileHaptic() {
    try {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([100, 50, 100, 50, 120]);
        }
    } catch {}
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const userId = (session?.user as any)?.id;
    const userEmail = session?.user?.email;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadBadge, setUnreadBadge] = useState(false);
    const [activeBanner, setActiveBanner] = useState<Notification | null>(null);
    const [pushPermission, setPushPermission] = useState<NotificationPermission | "default">("default");
    const [showPushPrompt, setShowPushPrompt] = useState(false);
    const [showBlockedGuide, setShowBlockedGuide] = useState(false);
    const [promptStyle, setPromptStyle] = useState<"standard" | "compact">("standard");
    const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);
    const seenIdsRef = useRef<Set<string>>(new Set());

    // Unlock WebAudio on first user touch/click anywhere on page
    useEffect(() => {
        const unlock = () => {
            getAudioContext();
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
        window.addEventListener("click", unlock, { passive: true });
        window.addEventListener("touchstart", unlock, { passive: true });
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
        };
    }, []);

    // Check permission & auto-show prompt on visit (Instagram / Snapchat style bottom prompt)
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPushPermission(Notification.permission);
            if (Notification.permission === "default") {
                const sessionDismissed = sessionStorage.getItem("aira_notif_prompt_dismissed_v2");
                if (!sessionDismissed) {
                    // Ask only once the visitor is engaged (scrolled ~1.5 screens or 30s on site) and has
                    // already answered the cookie banner — never stack two popups over the hero.
                    let shown = false;
                    const consentGiven = () => {
                        try { return !!localStorage.getItem("aira_cookie_consent_v1"); } catch { return true; }
                    };
                    const tryShow = () => {
                        if (shown || !consentGiven()) return;
                        shown = true;
                        setShowPushPrompt(true);
                        cleanup();
                    };
                    let engagedMs = 0;
                    const onScroll = () => window.scrollY > window.innerHeight * 1.5 && tryShow();
                    const timer = setInterval(() => document.visibilityState === "visible" && (engagedMs += 1000) >= 30000 && tryShow(), 1000);
                    const cleanup = () => {
                        clearInterval(timer);
                        window.removeEventListener("scroll", onScroll);
                    };
                    window.addEventListener("scroll", onScroll, { passive: true });
                    return cleanup;
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

    // Helper: Trigger Native OS-Level Notification (Shows outside app, on lock screen, status bar)
    const triggerNativeOutsideNotification = useCallback((notif: { title?: string; message?: string; link?: string | null }) => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return;
        }

        if (Notification.permission !== "granted") {
            return;
        }

        const title = notif.title?.trim() || "AiRA Lab";
        const message = notif.message?.trim() || "You have a new update in AiRA Lab.";
        const targetUrl = notif.link?.trim() || "/";

        const options: NotificationOptions = {
            body: message,
            icon: "/icon.svg",
            badge: "/icon.svg",
            tag: `aira-push-${Date.now()}`,
            renotify: true,
            requireInteraction: true,
            silent: false,
            vibrate: [300, 100, 300, 100, 300],
            data: {
                url: targetUrl,
                dateOfArrival: Date.now(),
            },
            actions: [
                { action: "open", title: "Open App 🚀" },
                { action: "dismiss", title: "Dismiss" }
            ],
        } as any;

        // 1. Try active Service Worker registration (Works on Mobile Android, PWA & Desktop Lock Screen)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration()
                .then((reg) => {
                    if (reg && reg.showNotification) {
                        return reg.showNotification(title, options);
                    }
                    if (navigator.serviceWorker.ready) {
                        return navigator.serviceWorker.ready.then((readyReg) => {
                            return readyReg.showNotification(title, options);
                        });
                    }
                    throw new Error("No active SW registration");
                })
                .catch(() => {
                    // Fallback to direct Window Notification
                    try {
                        new Notification(title, options);
                    } catch {}
                });
        } else {
            // 2. Direct Window Notification fallback
            try {
                new Notification(title, options);
            } catch {}
        }
    }, []);

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
    }, [triggerNativeOutsideNotification]);

    // Request native device push permission
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
                    triggerMobileHaptic();
                    toast.success("🔔 AiRA Lab notifications activated!");
                    
                    // Trigger a celebratory welcome notification
                    setTimeout(() => {
                        triggerNativeOutsideNotification({
                            title: "🎉 Welcome to AiRA Lab Alerts!",
                            message: "You're all set to receive instant updates, live broadcasts, and announcements.",
                            link: "/",
                        });
                    }, 400);

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
        sessionStorage.setItem("aira_notif_prompt_dismissed_v2", "true");
        toast("🔊 In-app sound & live alert alerts active for this session!", { icon: "🔔" });
    };

    const handleDecline = () => {
        setShowPushPrompt(false);
        sessionStorage.setItem("aira_notif_prompt_dismissed_v2", "true");
    };

    const dismissBanner = () => {
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        setActiveBanner(null);
    };

    // Delayed outside test helper so user can lock screen or switch apps with custom messages!
    const triggerDelayedOutsideTest = (customData?: { title?: string; message?: string; link?: string }, seconds: number = 4) => {
        const finalTitle = customData?.title?.trim() || "🚀 AiRA Lab: Lock Screen Alert!";
        const finalMessage = customData?.message?.trim() || "This notification appeared outside the app just like Instagram & Snapchat!";
        const finalLink = customData?.link?.trim() || "/";

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
                    toast.success(`Lock your phone or switch apps! Your custom alert will pop in ${seconds}s 🔔`);
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

    // Initial load & Polling fallback every 10s
    useEffect(() => {
        if (session?.user?.email) {
            fetchNotifications(true);

            const interval = setInterval(() => {
                fetchNotifications(false);
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [session, fetchNotifications]);

    // Realtime Supabase Broadcast & User Subscriptions
    useEffect(() => {
        // Global Broadcast Channel for all visitors (even non-logged-in)
        const globalChannel = supabase
            .channel("aira_global_broadcasts")
            .on(
                "broadcast",
                { event: "notification" },
                (payload: any) => {
                    const data = payload?.payload;
                    if (data && data.title && !seenIdsRef.current.has(data.id || data.title)) {
                        seenIdsRef.current.add(data.id || data.title);
                        const newNotif: Notification = {
                            id: data.id || `broadcast-${Date.now()}`,
                            userId: "global",
                            title: data.title,
                            message: data.message || "",
                            link: data.link || null,
                            read: false,
                            createdAt: new Date().toISOString(),
                        };
                        setNotifications((prev) => [newNotif, ...prev]);
                        setUnreadBadge(true);
                        showInstagramStyleBanner(newNotif);
                    }
                }
            )
            .subscribe();

        // Specific user database channel if logged in
        let userChannel: any = null;
        if (userId && !userId.startsWith("local-bypass-")) {
            userChannel = supabase
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
        }

        return () => {
            supabase.removeChannel(globalChannel);
            if (userChannel) supabase.removeChannel(userChannel);
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

            {/* Notification permission prompt — compact neo-brutal card */}
            <AnimatePresence>
                {showPushPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, rotate: 2 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        className="fixed bottom-3 inset-x-3 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[360px] z-[99995] pointer-events-auto"
                        role="dialog"
                        aria-label="Turn on AiRA Lab notifications"
                    >
                        <div className="rounded-[20px] border-2 border-nb-ink bg-nb-paper text-nb-ink p-4 shadow-[5px_5px_0_0_#111]">
                            <div className="flex items-start gap-3">
                                <span className="relative w-11 h-11 shrink-0 rounded-xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-[2px_2px_0_0_#111]">
                                    <Bell size={19} />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-nb-ink bg-nb-mint" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-brico font-extrabold text-base leading-tight">Never miss a lab drop</p>
                                    <p className="mt-1 text-[13px] leading-snug text-nb-ink/70">
                                        Get a ping for new events, hackathons and broadcasts from AiRA Lab.
                                    </p>
                                </div>
                                <button
                                    onClick={handleDecline}
                                    className="w-7 h-7 shrink-0 rounded-lg border-2 border-nb-ink bg-white flex items-center justify-center hover:bg-nb-peach transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            <div className="mt-3.5 flex flex-wrap gap-2">
                                <button
                                    onClick={requestPushPermission}
                                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-nb-ink bg-nb-violet px-3 py-2.5 font-brico font-bold text-sm text-white shadow-[3px_3px_0_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                                >
                                    <Bell size={14} /> Allow
                                </button>
                                <button
                                    onClick={handleSessionOnly}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-nb-ink bg-white px-3 py-2.5 font-brico font-bold text-sm shadow-[3px_3px_0_0_#111] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111]"
                                >
                                    <Volume2 size={14} /> While here
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="px-2 py-2.5 font-brico font-semibold text-sm text-nb-ink/60 underline underline-offset-4 hover:text-nb-ink"
                                >
                                    Not now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Browser unblock guide (shown if notifications were blocked before) */}
            <AnimatePresence>
                {showBlockedGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99998] bg-nb-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowBlockedGuide(false)}
                        role="dialog"
                        aria-modal="true"
                        data-lenis-prevent
                    >
                        <motion.div
                            initial={{ scale: 0.94, y: 20, rotate: -1 }}
                            animate={{ scale: 1, y: 0, rotate: 0 }}
                            exit={{ scale: 0.94, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-[24px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-[8px_8px_0_0_#111] overflow-hidden"
                        >
                            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b-2 border-nb-ink bg-nb-sun">
                                <span className="inline-flex items-center gap-2 font-brico font-extrabold">
                                    <ShieldCheck size={18} /> Unblock notifications
                                </span>
                                <button
                                    onClick={() => setShowBlockedGuide(false)}
                                    className="w-8 h-8 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            <div className="p-5">
                                <p className="text-sm text-nb-ink/75 leading-relaxed">
                                    Your browser is blocking notifications for AiRA Lab. Three quick steps to turn them on:
                                </p>
                                <ol className="mt-4 space-y-2.5">
                                    {[
                                        <>Click the <strong>🔒 lock / settings icon</strong> in the address bar.</>,
                                        <>Find <strong>Notifications</strong> and switch it to <strong>Allow</strong>.</>,
                                        <>Refresh the page, or press the button below to check.</>,
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 rounded-xl border-2 border-nb-ink bg-white p-3 text-sm">
                                            <span className="w-6 h-6 shrink-0 rounded-full border-2 border-nb-ink bg-nb-lilac font-brico font-extrabold text-xs flex items-center justify-center">{i + 1}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>

                                <div className="mt-5 flex gap-3">
                                    <button
                                        onClick={() => {
                                            if (typeof window !== "undefined" && "Notification" in window) {
                                                if (Notification.permission === "granted") {
                                                    setPushPermission("granted");
                                                    setShowBlockedGuide(false);
                                                    toast.success("Notifications are active!");
                                                    playBellChime();
                                                } else {
                                                    window.location.reload();
                                                }
                                            }
                                        }}
                                        className="flex-1 rounded-xl border-2 border-nb-ink bg-nb-violet py-2.5 font-brico font-bold text-sm text-white shadow-[3px_3px_0_0_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#111] transition-all"
                                    >
                                        Check again
                                    </button>
                                    <button
                                        onClick={() => setShowBlockedGuide(false)}
                                        className="px-4 rounded-xl border-2 border-nb-ink bg-white py-2.5 font-brico font-bold text-sm shadow-[3px_3px_0_0_#111]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drop-down notification banner */}
            <div className="fixed top-3 sm:top-4 inset-x-0 z-[99999] flex justify-center px-3 pointer-events-none">
                <AnimatePresence>
                    {activeBanner && (
                        <motion.div
                            initial={{ opacity: 0, y: -70, rotate: -1.5 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, y: -60 }}
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                            className="pointer-events-auto w-full max-w-md rounded-[20px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-[5px_5px_0_0_#111] overflow-hidden"
                            role="status"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b-2 border-nb-ink bg-nb-lilac">
                                <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
                                    <span className="w-2 h-2 rounded-full border border-nb-ink bg-nb-mint" /> AiRA Lab · just now
                                </span>
                                <button
                                    onClick={dismissBanner}
                                    className="w-6 h-6 rounded-md border-2 border-nb-ink bg-white flex items-center justify-center"
                                    aria-label="Dismiss notification"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                            <div className="flex items-start gap-3 p-4">
                                <span className="w-10 h-10 shrink-0 rounded-xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-[2px_2px_0_0_#111]">
                                    <Bell size={17} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-brico font-extrabold text-[15px] leading-tight truncate">{activeBanner.title}</h4>
                                    <p className="mt-0.5 text-[13px] leading-snug text-nb-ink/70 line-clamp-2">{activeBanner.message}</p>
                                    {activeBanner.link && (
                                        <Link
                                            href={activeBanner.link}
                                            onClick={dismissBanner}
                                            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border-2 border-nb-ink bg-nb-violet px-3 py-1 font-brico font-bold text-xs text-white shadow-[2px_2px_0_0_#111]"
                                        >
                                            Open <ExternalLink size={12} />
                                        </Link>
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
