"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    LogOut, 
    Home, 
    LayoutDashboard, 
    Calendar, 
    Users, 
    CheckSquare, 
    Award, 
    Settings, 
    FileText,
    Menu,
    X,
    Radio,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { signOut } from "next-auth/react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import FloatingAdminMenu from "@/components/admin/FloatingAdminMenu";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

    if (!session) return null;

    const role: string = (session.user as any)?.role || "TEAM_MEMBER";
    const isAdmin = role === "ADMIN";

    const navItems = [
        { href: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER", "CONTENT_MANAGER", "CERTIFICATE_MANAGER"] },
        { href: "/admin", label: "Admin Analytics", icon: ShieldCheck, roles: ["ADMIN"] },
        { href: "/admin/broadcast", label: "Live Broadcast", icon: Radio, roles: ["ADMIN", "CONTENT_MANAGER"] },
        { href: "/admin/users", label: "User Accounts", icon: Users, roles: ["ADMIN"] },
        { href: "/admin/team-members", label: "People Profiles", icon: Users, roles: ["ADMIN"] },
        { href: "/admin/teams", label: "Teams", icon: Users, roles: ["ADMIN"] },
        { href: "/portal/tasks", label: "Tasks Board", icon: CheckSquare, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/portal/requirements", label: "Requirements", icon: FileText, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/admin/events", label: "Events Manager", icon: Calendar, roles: ["ADMIN", "CONTENT_MANAGER"] },
        { href: "/portal/events", label: "My Events", icon: Calendar, roles: ["TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/portal/team-dashboard", label: "Team Hub", icon: Briefcase, roles: ["TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/admin/reports", label: "Team Reports", icon: FileText, roles: ["ADMIN"] },
        { href: "/admin/applications", label: "Applications", icon: FileText, roles: ["ADMIN"] },
        { href: "/admin/achievements", label: "Achievements", icon: Award, roles: ["ADMIN", "CONTENT_MANAGER"] },
        { href: "/admin/certificates", label: "Certificates", icon: FileText, roles: ["ADMIN", "CERTIFICATE_MANAGER"] },
        { href: "/admin/settings", label: "Lab Settings", icon: Settings, roles: ["ADMIN"] },
        { href: "/portal/settings", label: "Settings & Security", icon: Settings, roles: ["ADMIN", "TEAM_LEAD", "TEAM_MEMBER", "CONTENT_MANAGER", "CERTIFICATE_MANAGER"] },
    ];

    const filteredNav = navItems.filter((item) => item.roles.includes(role));

    // Mobile quick tabs
    const mobileTabs = [
        { href: "/portal/dashboard", label: "Home", icon: LayoutDashboard },
        { href: "/portal/tasks", label: "Tasks", icon: CheckSquare },
        { href: "/portal/events", label: "Events", icon: Calendar },
        { href: isAdmin ? "/admin" : "/portal/team-dashboard", label: isAdmin ? "Admin" : "Team", icon: isAdmin ? ShieldCheck : Briefcase },
    ];

    return (
        <div className="min-h-screen bg-aira-bg flex relative">
            {/* If Admin, render floating admin menu */}
            {isAdmin && <FloatingAdminMenu />}

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-orbitron font-bold text-xs text-white shadow-md shadow-aira-cyan/20">
                            AL
                        </div>
                        <div>
                            <span className="font-orbitron font-bold text-base gradient-text-cyan">
                                AiRA Lab
                            </span>
                            <p className="text-[10px] text-slate-400 font-orbitron">MEMBER PORTAL</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? "bg-aira-cyan/15 text-aira-cyan border border-aira-cyan/40 shadow-sm shadow-aira-cyan/10 font-semibold"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <Icon size={18} className={active ? "text-aira-cyan" : "text-slate-500"} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 bg-slate-900/40">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-aira-cyan/30">
                            {session.user?.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{session.user?.name}</p>
                            <p className="text-[11px] text-aira-cyan font-mono truncate">{role.replace("_", " ")}</p>
                        </div>
                        <NotificationBell />
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-aira-magenta bg-aira-magenta/10 hover:bg-aira-magenta/20 border border-aira-magenta/30 transition-all"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 glass sticky top-0 z-30">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setMobileDrawerOpen(true)}
                            className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10"
                            aria-label="Open portal navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <Link href="/" className="font-orbitron font-bold text-base gradient-text-cyan">
                            AiRA Portal
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <button 
                            onClick={() => signOut({ callbackUrl: "/" })} 
                            className="p-2 rounded-xl text-aira-magenta hover:bg-aira-magenta/10 border border-transparent hover:border-aira-magenta/30 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Page content with bottom padding for mobile dock */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-6xl mx-auto page-enter">
                        {children}
                    </div>
                </div>

                {/* ══ MOBILE BOTTOM NAVIGATION DOCK ══ */}
                <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 z-40 px-2 py-2 flex items-center justify-around shadow-2xl shadow-black">
                    {mobileTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
                                    active
                                        ? "text-aira-cyan bg-aira-cyan/10 font-bold"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Icon size={19} className={active ? "text-aira-cyan animate-pulse" : "text-slate-400"} />
                                <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
                            </Link>
                        );
                    })}
                    
                    <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-slate-400 hover:text-white"
                    >
                        <Menu size={19} />
                        <span className="text-[10px] font-medium tracking-tight">More</span>
                    </button>
                </nav>

                {/* ══ MOBILE FULL DRAWER ══ */}
                {mobileDrawerOpen && (
                    <div className="md:hidden fixed inset-0 z-[9995]">
                        <div 
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setMobileDrawerOpen(false)}
                        />
                        <aside className="fixed left-0 top-0 bottom-0 w-[80vw] max-w-xs bg-slate-950 border-r border-white/10 flex flex-col z-[9996] p-5">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <div>
                                    <h3 className="font-orbitron font-bold text-white text-base">Menu</h3>
                                    <p className="text-xs text-slate-400">{session.user?.name}</p>
                                </div>
                                <button
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                                {filteredNav.map((item) => {
                                    const Icon = item.icon;
                                    const active = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileDrawerOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                                                active ? "bg-aira-cyan/15 text-aira-cyan font-bold" : "text-slate-300 hover:bg-white/5"
                                            }`}
                                        >
                                            <Icon size={17} className={active ? "text-aira-cyan" : "text-slate-400"} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full py-2.5 rounded-xl text-xs font-semibold text-aira-magenta bg-aira-magenta/15 border border-aira-magenta/30 flex items-center justify-center gap-2"
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
