"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, MessageSquare, ArrowLeft } from "lucide-react";

export function TeamSubNav({ teamName }: { teamName?: string }) {
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/portal/team-dashboard" },
        { icon: Users, label: "Members", href: "/portal/team-members" },
        { icon: MessageSquare, label: "Updates", href: "/portal/team-updates" },
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
                <Link
                    href="/portal/dashboard"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-aira-cyan/20 text-slate-400 hover:text-aira-cyan transition-colors"
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h2 className="font-orbitron font-bold text-xl text-white">{teamName || "Team Portal"}</h2>
                </div>
            </div>

            <div className="flex items-center gap-2 border-b border-white/10 pb-1 overflow-x-auto hide-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-medium text-sm transition-all whitespace-nowrap ${
                                isActive
                                    ? "bg-aira-cyan/10 text-aira-cyan border-b-2 border-aira-cyan"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
