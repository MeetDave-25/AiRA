"use client";

import { useState } from "react";
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
    ChevronLeft,
    Menu,
    X,
} from "lucide-react";

const adminLinks = [
    { label: "Analytics", href: "/admin", icon: BarChart3 },
    { label: "People", href: "/admin/team-members", icon: Users },
    { label: "Teams", href: "/admin/teams", icon: UsersRound },
    { label: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { label: "Events", href: "/admin/events", icon: CalendarDays },
    { label: "Applications", href: "/admin/applications", icon: FileText },
    { label: "Certificates", href: "/admin/certificates", icon: ClipboardList },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Achievements", href: "/admin/achievements", icon: Trophy },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

const FloatingAdminMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* FAB */}
            <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-aira-cyan to-aira-purple rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Menu Content */}
            <aside
                className={`w-full max-w-xs sm:w-72 min-h-screen border-r border-white/10 bg-aira-surface flex flex-col fixed left-0 top-0 bottom-0 z-40 transform transition-transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                        <div>
                            <span className="font-orbitron font-bold text-base gradient-text-cyan">Admin</span>
                            <p className="text-[10px] text-slate-500 font-orbitron">CONTROL PANEL</p>
                        </div>
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-aira-cyan/10 text-aira-cyan border border-aira-cyan/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <Icon size={17} className={isActive ? "text-aira-cyan" : "text-slate-500"} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        href="/portal/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all"
                    >
                        <BarChart3 size={17} className="text-slate-500" />
                        Portal View
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

export default FloatingAdminMenu;
