"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
    BarChart3,
    Users,
    UsersRound,
    CalendarDays,
    FileText,
    Settings,
    ClipboardList,
    LogOut,
    ShieldCheck,
    Trophy,
    CheckSquare,
    Menu,
    X,
    UserCheck,
    Globe,
    Radio,
    ChevronLeft,
    Crown,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
    { label: "Analytics",           href: "/admin",                icon: BarChart3 },
    { label: "Live Broadcast",      href: "/admin/broadcast",      icon: Radio, highlight: true },
    { label: "Poster Studio",       href: "/admin/posters",        icon: Sparkles },
    { label: "Projects",            href: "/admin/projects",       icon: Globe },
    { label: "Leadership & People", href: "/admin/team-members",   icon: Crown },
    { label: "User Accounts",       href: "/admin/users",          icon: UserCheck },
    { label: "Teams",               href: "/admin/teams",          icon: UsersRound },
    { label: "Tasks",               href: "/admin/tasks",          icon: CheckSquare },
    { label: "Events",              href: "/admin/events",         icon: CalendarDays },
    { label: "Applications",        href: "/admin/applications",   icon: FileText },
    { label: "Certificates",        href: "/admin/certificates",   icon: ClipboardList },
    { label: "Reports",             href: "/admin/reports",        icon: BarChart3 },
    { label: "Achievements",        href: "/admin/achievements",   icon: Trophy },
    { label: "Settings",            href: "/admin/settings",       icon: Settings },
];


export default function FloatingAdminMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const pathname = usePathname();
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset idle timer whenever user interacts, scrolls, or moves mouse
    const resetIdleTimer = useCallback(() => {
        setIsIdle(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

        // Don't minimize while drawer is open
        if (!isOpen) {
            idleTimerRef.current = setTimeout(() => {
                setIsIdle(true);
            }, 3500); // 3.5 seconds of inactivity -> auto-minimizes to avoid blocking view
        }
    }, [isOpen]);

    useEffect(() => {
        const events = ["mousemove", "mousedown", "scroll", "touchstart", "keydown"];
        events.forEach((event) => window.addEventListener(event, resetIdleTimer, { passive: true }));

        resetIdleTimer();

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer]);

    // Prevent body scroll when drawer menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setIsIdle(false);
        } else {
            document.body.style.overflow = "unset";
            resetIdleTimer();
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, resetIdleTimer]);

    const handleFabClick = () => {
        if (isIdle) {
            setIsIdle(false);
            resetIdleTimer();
        } else {
            setIsOpen(!isOpen);
        }
    };

    return (
        <>
            {/* 
              Floating Action Button (FAB)
              - Smart auto-hide / auto-minimize when idle so it NEVER blocks user view
              - Smooth spring expansion on click / hover / scroll
              - High z-index z-[9990]
            */}
            <div
                className={`fixed z-[9990] transition-all duration-500 ease-out pointer-events-auto ${
                    isIdle && !isOpen
                        ? "bottom-24 md:bottom-8 -right-2 opacity-40 hover:opacity-100 hover:right-4 scale-75 hover:scale-100"
                        : "bottom-24 right-4 md:bottom-8 md:right-8 opacity-100 scale-100"
                }`}
                onMouseEnter={() => {
                    setIsIdle(false);
                    resetIdleTimer();
                }}
            >
                <button
                    onClick={handleFabClick}
                    className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-nb-ink bg-nb-sun text-nb-ink shadow-[4px_4px_0_0_#6C5CE7] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#6C5CE7] active:shadow-none transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-nb-violet/50 flex items-center justify-center"
                    aria-label="Toggle admin control menu"
                    title={isIdle ? "Click to expand menu" : "Open Admin Menu"}
                >
                    {isOpen ? <X size={24} /> : isIdle ? <ChevronLeft size={22} className="-ml-0.5" /> : <ShieldCheck size={24} />}
                </button>
            </div>

            {/* Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[9980] transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Sidebar Menu */}
            <aside
                className={`w-[85vw] max-w-xs sm:w-80 h-full border-r-2 border-nb-sun bg-[#111] text-[#F3EFE4] flex flex-col fixed left-0 top-0 bottom-0 z-[9985] shadow-2xl shadow-black transform transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="p-5 border-b-2 border-[#F3EFE4]/10 flex items-center justify-between">
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-[3px_3px_0_0_#6C5CE7]">
                            <ShieldCheck size={19} className="text-nb-ink" />
                        </div>
                        <div>
                            <span className="font-brico font-extrabold text-base text-[#F3EFE4]">Admin console</span>
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-nb-sun">Lab command centre</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-lg border-2 border-[#F3EFE4]/15 text-[#F3EFE4]"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive =
                            link.href === "/admin"
                                ? pathname === "/admin"
                                : pathname === link.href || pathname.startsWith(link.href + "/");

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 font-brico text-sm transition-all ${
                                    isActive
                                        ? "bg-nb-sun text-nb-ink border-nb-ink font-extrabold shadow-[3px_3px_0_0_#6C5CE7]"
                                        : "border-transparent text-[#F3EFE4]/70 font-semibold hover:text-[#F3EFE4] hover:bg-[#F3EFE4]/[0.06]"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={17} className={isActive ? "text-nb-ink" : "text-[#F3EFE4]/45"} />
                                    <span>{link.label}</span>
                                </div>
                                {link.highlight && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border-2 border-nb-ink bg-nb-peach text-nb-ink uppercase tracking-wider">
                                        Live
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t-2 border-[#F3EFE4]/10 space-y-2">
                    <Link
                        href="/portal/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 border-[#F3EFE4]/15 font-brico font-semibold text-sm text-[#F3EFE4]/80 hover:text-[#F3EFE4] transition-all"
                    >
                        <BarChart3 size={17} className="text-nb-sun" />
                        Member Portal View
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-nb-ink bg-[#F3EFE4] font-brico font-bold text-sm text-nb-ink shadow-[3px_3px_0_0_#6C5CE7] transition-all"
                    >
                        <LogOut size={17} />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
