"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink, Trash2, Smartphone, Volume2 } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export function NotificationBell() {
    const { 
        notifications, 
        unreadCount, 
        unreadBadge, 
        setUnreadBadge, 
        markAsRead, 
        markAllAsRead, 
        requestPushPermission,
        openPushPrompt,
        pushPermission 
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

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggleOpen}
                className="relative p-2.5 rounded-xl text-slate-300 hover:text-aira-cyan hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-aira-cyan/50"
                aria-label="Notifications"
            >
                <Bell size={20} className={unreadBadge ? "text-aira-cyan" : ""} />
                {unreadCount > 0 ? (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-aira-magenta text-white font-bold text-[10px] flex items-center justify-center shadow-lg shadow-aira-magenta/40 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                ) : unreadBadge ? (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-aira-cyan shadow-sm shadow-aira-cyan animate-ping" />
                ) : null}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-[330px] sm:w-[380px] max-h-[85vh] flex flex-col glass border border-aira-cyan/30 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black overflow-hidden z-[9999]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/60">
                            <div className="flex items-center gap-2">
                                <Bell size={16} className="text-aira-cyan" />
                                <h3 className="font-orbitron font-bold text-sm text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-aira-cyan/20 border border-aira-cyan/30 text-[10px] text-aira-cyan font-bold">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            {notifications.some(n => !n.read) && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] text-aira-cyan hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <Check size={13} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* Push Permission Prompt (if default or prompt) */}
                        {pushPermission !== "granted" && (
                            <div className="p-3 bg-gradient-to-r from-aira-cyan/10 to-aira-purple/10 border-b border-white/10 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Smartphone size={15} className="text-aira-cyan shrink-0" />
                                    <span className="text-[11px]">Get lock screen alerts</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        openPushPrompt();
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-aira-cyan text-aira-bg font-bold text-[11px] hover:scale-105 transition-transform shrink-0"
                                >
                                    Enable
                                </button>
                            </div>
                        )}

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-white/5">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-600">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
                                    <p className="text-xs text-slate-600">You will be alerted instantly when announcements, tasks, or events are posted.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            if (!notif.read) markAsRead(notif.id);
                                        }}
                                        className={`p-4 transition-colors hover:bg-white/5 cursor-pointer ${
                                            !notif.read ? "bg-aira-cyan/5 border-l-2 border-aira-cyan" : ""
                                        }`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            {!notif.read && (
                                                <span className="w-2 h-2 rounded-full bg-aira-cyan mt-1.5 shrink-0 animate-pulse" />
                                            )}
                                            <div className={`flex-1 min-w-0 ${notif.read ? "pl-2" : ""}`}>
                                                <p className={`text-xs sm:text-sm leading-snug ${notif.read ? "text-slate-300" : "text-white font-bold"}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2.5 pt-1">
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        {timeAgo(notif.createdAt)}
                                                    </span>
                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            onClick={() => setOpen(false)}
                                                            className="text-[11px] text-aira-cyan font-semibold flex items-center gap-1 hover:underline ml-auto"
                                                        >
                                                            View <ExternalLink size={11} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
