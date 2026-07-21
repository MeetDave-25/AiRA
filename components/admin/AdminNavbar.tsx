"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const adminLinks = [
    { label: "Analytics", href: "/admin" },
    { label: "Teams", href: "/admin/teams" },
    { label: "People", href: "/admin/team-members" },
    { label: "Events", href: "/admin/events" },
    { label: "Applications", href: "/admin/applications" },
    { label: "Certificates", href: "/admin/certificates" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings" },
    { label: "Users", href: "/admin/users" },
    { label: "Achievements", href: "/admin/achievements" },
];

export default function AdminNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const isMainPage = pathname === "/admin";

    return (
        <div className="fixed top-0 left-0 right-0 z-40 bg-aira-bg/95 border-b border-white/10 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Back Button */}
                    {!isMainPage && (
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 border border-white/20 transition-all"
                            title="Go back"
                        >
                            <ArrowLeft size={16} className="text-slate-300" />
                            <span className="text-sm text-slate-300">Back</span>
                        </button>
                    )}

                    {/* Navigation Links */}
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto ml-4">
                        {adminLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                                        isActive
                                            ? "bg-aira-cyan/20 text-aira-cyan border border-aira-cyan/30"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
