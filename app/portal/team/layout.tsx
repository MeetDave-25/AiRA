"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, MessageSquare, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const user = session?.user as any;

    const [teamName, setTeamName] = useState("Team");

    useEffect(() => {
        if (!user?.teams || user.teams.length === 0) {
            router.push("/portal/dashboard");
        } else {
            setTeamName(user.teams[0].name || "Team");
        }
    }, [user, router]);

    const navItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/portal/team-dashboard" },
        { icon: Users, label: "Members", href: "/portal/team-members" },
        { icon: MessageSquare, label: "Updates", href: "/portal/team-updates" },
    ];

    return (
        <div className="min-h-screen bg-aira-bg">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 glass border-r border-white/10 p-6 flex flex-col">
                {/* Back Button */}
                <Link
                    href="/portal/dashboard"
                    className="flex items-center gap-2 text-slate-400 hover:text-aira-cyan text-sm mb-6 transition"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                {/* Team Name */}
                <div className="mb-8">
                    <h2 className="font-orbitron font-bold text-lg text-white">{teamName}</h2>
                    <p className="text-xs text-slate-500">Team Portal</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-aira-cyan/20 text-aira-cyan"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500">Logged in as:</p>
                    <p className="text-sm text-white truncate font-medium">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8">
                {children}
            </div>
        </div>
    );
}
