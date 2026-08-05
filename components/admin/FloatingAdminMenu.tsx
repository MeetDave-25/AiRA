"use client";

import { useState, useEffect } from "react";
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
    Sparkles,
} from "lucide-react";

const adminLinks = [
    { label: "Analytics", href: "/admin", icon: BarChart3 },
    { label: "Live Broadcast", href: "/admin/broadcast", icon: Radio, highlight: true },
    { label: "User Accounts", href: "/admin/users", icon: UserCheck },
    { label: "Public Profiles", href: "/admin/team-members", icon: Globe },
    { label: "Teams", href: "/admin/teams", icon: UsersRound },
    { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { label: "Events", href: "/admin/events", icon: CalendarDays },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Certificates", href: "/admin/certificates", icon: ClipboardList },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Achievements", href: "/admin/achievements", icon: Trophy },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function FloatingAdminMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Prevent body scroll when menu is open on mobile
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            {/* 
              Floating Action Button (FAB)
              - Fixed firmly in the bottom right corner with highest z-index z-[9990]
              - High-contrast animated gradient glow & pulse indicator
              - Touch-friendly sizing (56px x 56px on mobile, 64px x 64px on desktop)
            */}
            <div className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[9990] pointer-events-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative group w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-aira-cyan via-aira-purple to-aira-magenta p-[2px] shadow-2xl shadow-aira-cyan/40 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-aira-cyan/40 flex items-center justify-center"
                    aria-label="Toggle admin control menu"
                    title="Open Admin Menu"
                >
                    <span className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white group-hover:bg-slate-900 transition-colors">
                        {isOpen ? <X size={26} className="text-white animate-spin-fast" /> : <Menu size={26} className="text-aira-cyan" />}
                    </span>
                    {/* Glowing pulse ring */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-aira-cyan to-aira-magenta opacity-40 blur-md group-hover:opacity-75 transition-opacity -z-10 animate-pulse" />
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
                className={`w-[85vw] max-w-xs sm:w-80 h-full border-r border-white/10 bg-slate-950/98 backdrop-blur-2xl flex flex-col fixed left-0 top-0 bottom-0 z-[9985] shadow-2xl shadow-black transform transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center shadow-lg shadow-aira-cyan/20">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-orbitron font-bold text-base gradient-text-cyan">Admin Panel</span>
                            <p className="text-[10px] text-slate-400 font-orbitron">LAB COMMAND CENTER</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-aira-cyan/15 text-aira-cyan border border-aira-cyan/40 shadow-sm shadow-aira-cyan/10 font-semibold"
                                        : link.highlight
                                            ? "bg-gradient-to-r from-aira-magenta/15 to-aira-purple/15 text-aira-magenta border border-aira-magenta/30 hover:border-aira-magenta/60"
                                            : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon size={18} className={isActive ? "text-aira-cyan" : link.highlight ? "text-aira-magenta" : "text-slate-400"} />
                                    <span>{link.label}</span>
                                </div>
                                {link.highlight && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-aira-magenta text-white uppercase tracking-wider animate-pulse">
                                        Live
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 space-y-2 bg-slate-900/40">
                    <Link
                        href="/portal/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
                    >
                        <BarChart3 size={17} className="text-aira-cyan" />
                        Member Portal View
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-aira-magenta hover:bg-aira-magenta/10 hover:border-aira-magenta/30 border border-transparent transition-all"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
