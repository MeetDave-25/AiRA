"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, Home, LayoutDashboard, Calendar, Users, CheckSquare, Award, Settings, FileText } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated" && pathname !== "/portal/login") {
            router.push("/portal/login");
        }
    }, [status, pathname, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-aira-bg flex items-center justify-center">
                <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
            </div>
        );
    }

    // If on login page and unauthenticated, just show login page
    if (pathname === "/portal/login") {
        return <div className="min-h-screen bg-aira-bg">{children}</div>;
    }

    if (!session) return null; // Will redirect via useEffect

    const role: string = (session.user as any)?.role || "TEAM_MEMBER";
    const userTeams = (session.user as any)?.teams || [];

    const navItems = [
        { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/admin", label: "Admin Analytics", icon: LayoutDashboard, roles: ["ADMIN"] },
        { href: "/portal/tasks", label: "Tasks", icon: CheckSquare, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/portal/requirements", label: "Requirements", icon: FileText, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/admin/events", label: "All Events", icon: Calendar, roles: ["ADMIN"] },
        { href: "/portal/events", label: "My Events", icon: Calendar, roles: ["TEAM_LEAD", "TEAM_MEMBER"] },
        ...(userTeams.length > 0 ? [{ href: "/portal/team-dashboard", label: "Team Hub", icon: Users, roles: ["TEAM_LEAD", "TEAM_MEMBER"] }] : []),
        { href: "/admin/teams", label: "Teams & Users", icon: Users, roles: ["ADMIN"] },
        { href: "/admin/team-members", label: "Team Profiles", icon: Users, roles: ["ADMIN"] },
        { href: "/admin/applications", label: "Applications", icon: FileText, roles: ["ADMIN"] },
        { href: "/admin/achievements", label: "Achievements", icon: Award, roles: ["ADMIN"] },
        { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
    ];

    const filteredNav = navItems.filter((item) => item.roles.includes(role));

    return (
        <div className="min-h-screen bg-aira-bg flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-aira-border/50 bg-aira-surface/50 hidden md:flex flex-col">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-orbitron font-bold text-xs text-white">
                            AL
                        </div>
                        <span className="font-orbitron font-bold text-lg gradient-text-cyan">
                            Portal
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
                                        ? "bg-aira-cyan/10 text-aira-cyan border border-aira-cyan/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                    }`}
                            >
                                <Icon size={18} className={active ? "text-aira-cyan" : "text-slate-500"} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-aira-border/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center text-white font-bold">
                            {session.user?.name?.[0] || "?"}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white line-clamp-1">{session.user?.name}</p>
                            <p className="text-xs text-aira-cyan font-orbitron">{role.replace("_", " ")}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-aira-magenta hover:bg-aira-magenta/10 hover:border-aira-magenta/30 border border-transparent transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-aira-border/50 glass">
                    <Link href="/" className="font-orbitron font-bold gradient-text-cyan">AL Portal</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="text-aira-magenta p-2"><LogOut size={18} /></button>
                </header>

                {/* Page content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto page-enter">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
