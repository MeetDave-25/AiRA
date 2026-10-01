"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink, Smartphone } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

/** `placement="sidebar"` opens the panel beside the portal sidebar (the bell sits at its bottom). */
export function NotificationBell({ placement = "down" }: { placement?: "down" | "sidebar" }) {
    const { 
        notifications, 
        unreadCount, 
        unreadBadge, 
        setUnreadBadge, 
        markAsRead, 
        markAllAsRead, 
        requestPushPermission,
        openPushPrompt,
        pushPermission,
        triggerDelayedOutsideTest
    } = useNotifications();
    
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    function timeAgo(dateStr: string) {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const toggleOpen = () => {
        if (!open) {
            setUnreadBadge(false);
        }
        setOpen(!open);
    };

    const handleEnablePush = async () => {
        const granted = await requestPushPermission();
        if (granted) {
            toast.success("Push notifications enabled on this device!");
        } else {
            toast.error("Push permission was not granted.");
        }
    };

    const panelPos =
        placement === "sidebar"
            ? "fixed left-[280px] bottom-4 origin-bottom-left"
            : "absolute right-0 mt-3 origin-top-right";

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggleOpen}
                className="relative p-2.5 rounded-xl text-current hover:text-nb-sun hover:bg-black/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-nb-violet/50"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell size={20} />
                {unreadCount > 0 ? (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-nb-ink bg-nb-peach text-nb-ink font-bold text-[10px] flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                ) : unreadBadge ? (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border border-nb-ink bg-nb-sun animate-ping" />
                ) : null}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className={`${panelPos} w-[min(360px,calc(100vw-24px))] max-h-[min(560px,80vh)] flex flex-col rounded-[20px] border-2 border-nb-ink bg-nb-paper text-nb-ink shadow-[6px_6px_0_0_#111] overflow-hidden z-[9999]`}
                        role="dialog"
                        aria-label="Notifications"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b-2 border-nb-ink bg-nb-sun flex items-center justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                                <Bell size={16} />
                                <h3 className="font-brico font-extrabold text-base">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="rounded-full border-2 border-nb-ink bg-white px-2 py-0.5 text-[10px] font-bold">{unreadCount} new</span>
                                )}
                            </div>
                            {notifications.some((n) => !n.read) && (
                                <button onClick={markAllAsRead} className="inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4">
                                    <Check size={13} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* Push prompt */}
                        {pushPermission !== "granted" && (
                            <div className="px-4 py-2.5 border-b-2 border-nb-ink/15 bg-nb-lilac/50 flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-2 text-xs font-semibold">
                                    <Smartphone size={14} /> Get alerts on your lock screen
                                </span>
                                <button
                                    onClick={() => { setOpen(false); openPushPrompt(); }}
                                    className="shrink-0 rounded-lg border-2 border-nb-ink bg-nb-violet px-2.5 py-1 font-brico font-bold text-[11px] text-white shadow-[2px_2px_0_0_#111]"
                                >
                                    Enable
                                </button>
                            </div>
                        )}

                        {/* List */}
                        <div className="flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                                    <span className="w-12 h-12 rounded-2xl border-2 border-nb-ink bg-white flex items-center justify-center shadow-[2px_2px_0_0_#111]">
                                        <Bell size={22} />
                                    </span>
                                    <p className="font-brico font-bold">All caught up</p>
                                    <p className="text-xs text-nb-muted">Announcements, tasks and events will show up here.</p>
                                </div>
                            ) : (
                                <ul className="p-2 space-y-2">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            onClick={() => { if (!notif.read) markAsRead(notif.id); }}
                                            className={`rounded-xl border-2 p-3 cursor-pointer transition-colors ${
                                                notif.read ? "border-nb-ink/15 bg-white/60 hover:bg-white" : "border-nb-ink bg-white shadow-[2px_2px_0_0_#111]"
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <span className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${notif.read ? "bg-nb-ink/20" : "bg-nb-violet"}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug ${notif.read ? "text-nb-ink/70" : "font-brico font-bold"}`}>{notif.title}</p>
                                                    <p className="mt-0.5 text-xs text-nb-muted line-clamp-3 leading-relaxed">{notif.message}</p>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="font-mono text-[10px] text-nb-muted">{timeAgo(notif.createdAt)}</span>
                                                        {notif.link && (
                                                            <Link
                                                                href={notif.link}
                                                                onClick={() => setOpen(false)}
                                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-nb-violet hover:underline"
                                                            >
                                                                View <ExternalLink size={11} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t-2 border-nb-ink/15 flex items-center justify-between gap-2 shrink-0">
                            <span className="text-[11px] text-nb-muted">Lock screen alerts</span>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    triggerDelayedOutsideTest({
                                        title: "🔔 AiRA Lab: lock screen test",
                                        message: "Lock screen notifications are working!",
                                        link: "/",
                                    }, 3);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-nb-ink bg-white px-2.5 py-1 text-[11px] font-bold"
                            >
                                <Smartphone size={12} /> Send a test
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
