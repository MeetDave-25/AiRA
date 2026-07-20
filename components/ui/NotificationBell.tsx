"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationProvider";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
    const { notifications, unreadBadge, setUnreadBadge, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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

    // Also close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const toggleOpen = () => {
        if (!open) {
            // When opening, clear the badge (they are seeing the list)
            setUnreadBadge(false);
        }
        setOpen(!open);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggleOpen}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-aira-cyan/50"
            >
                <Bell size={20} />
                {unreadBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aira-magenta animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-[340px] max-h-[85vh] flex flex-col glass border border-aira-cyan/20 bg-slate-900/95 rounded-2xl shadow-2xl shadow-black overflow-hidden z-[999]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/50">
                            <h3 className="font-bold text-white">Notifications</h3>
                            {notifications.some(n => !n.read) && (
                                <button onClick={markAllAsRead} className="text-[11px] text-aira-cyan hover:underline flex items-center gap-1 font-medium">
                                    <Check size={12} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                                    <Bell size={32} className="opacity-20 mb-3" />
                                    <p className="text-sm">You have no notifications yet.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            className={`p-4 transition-colors hover:bg-white/5 ${!notif.read ? "bg-aira-cyan/5" : ""}`}
                                            onMouseEnter={() => {
                                                if (!notif.read) markAsRead(notif.id);
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                {!notif.read && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-aira-cyan mt-1.5 shrink-0" />
                                                )}
                                                <div className={`flex-1 min-w-0 ${notif.read ? "pl-2.5" : ""}`}>
                                                    <p className={`text-sm mb-1 line-clamp-2 leading-relaxed ${notif.read ? "text-slate-300" : "text-white font-medium"}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-400 line-clamp-3 mb-2 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] text-slate-500">
                                                            {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {notif.link && (
                                                            <Link href={notif.link} onClick={() => setOpen(false)} className="text-[11px] text-aira-cyan font-semibold flex items-center gap-1 hover:underline">
                                                                View <ExternalLink size={10} />
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
