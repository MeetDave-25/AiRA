"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LogOut,
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
    Briefcase,
    MessageSquare,
    BookOpen,
    Newspaper
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "next-auth/react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import FloatingAdminMenu from "@/components/admin/FloatingAdminMenu";
import ConsoleLoader from "@/components/admin/ConsoleLoader";
import ConsoleScrollReveal from "@/components/admin/ConsoleScrollReveal";

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    // Define public routes that don't require authentication
    const isPublicRoute = pathname === "/portal/login" || pathname === "/portal/setup-password";

    useEffect(() => {
        if (status === "unauthenticated" && !isPublicRoute) {
            router.push("/portal/login");
        }
    }, [status, pathname, router, isPublicRoute]);

    if (status === "loading") {
        return (
            <div className="nb-console min-h-screen flex items-center justify-center">
                <ConsoleLoader />
            </div>
        );
    }

    // If on a public page and unauthenticated, just show that page (no sidebar)
    if (isPublicRoute) {
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
        { href: "/portal/team-members", label: "Team Members", icon: Users, roles: ["TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/portal/team-updates", label: "Team Updates", icon: MessageSquare, roles: ["TEAM_LEAD", "TEAM_MEMBER"] },
        // Blog & Magazine
        { href: "/portal/blog", label: "Blog", icon: BookOpen, roles: ["ADMIN", "CONTENT_MANAGER", "TEAM_LEAD", "TEAM_MEMBER"] },
        { href: "/portal/admin/blog", label: "Blog Management", icon: BookOpen, roles: ["ADMIN", "CONTENT_MANAGER", "TEAM_LEAD"] },
        { href: "/portal/admin/magazine", label: "Magazine Studio", icon: Newspaper, roles: ["ADMIN"] },
        // Reports & Admin
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

    const initials = (session.user?.name || "?").split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
    const avatar = (session.user as any)?.avatar as string | undefined;
    const roleLabel = role.replace(/_/g, " ");

    return (
        <div className="nb-console min-h-screen flex relative">
            {/* If Admin, render floating admin menu */}
            {isAdmin && <FloatingAdminMenu />}

            {/* Desktop Sidebar */}
            <aside className="w-[264px] shrink-0 sticky top-0 h-screen border-r-2 border-[#F3EFE4]/10 bg-[#111] hidden md:flex flex-col">
                <div className="px-5 pt-5 pb-4">
                    <Logo href="/" size="sm" showText textVariant="portal" priority />
                    <span className="mt-4 inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-nb-ink bg-nb-sun px-2.5 py-0.5 font-brico font-extrabold text-[11px] text-nb-ink shadow-[2px_2px_0_0_#6C5CE7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-nb-ink" /> {isAdmin ? "Admin console" : "Member portal"}
                    </span>
                </div>

                <nav className="flex-1 px-3 pb-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 font-brico text-[14px] transition-all ${
                                    active
                                        ? "bg-nb-sun text-nb-ink border-nb-ink font-extrabold shadow-[3px_3px_0_0_#6C5CE7]"
                                        : "border-transparent text-[#F3EFE4]/65 font-semibold hover:text-[#F3EFE4] hover:bg-[#F3EFE4]/[0.06]"
                                }`}
                            >
                                <Icon size={17} className={active ? "text-nb-ink" : "text-[#F3EFE4]/40"} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="m-3 rounded-2xl border-2 border-[#F3EFE4]/15 bg-[#1B1B1B] p-3.5 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-3 mb-3">
                        {avatar ? (
                            <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-nb-sun shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-nb-lilac border-2 border-nb-ink flex items-center justify-center text-nb-ink font-brico font-extrabold text-sm shrink-0">
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-brico font-bold text-sm text-[#F3EFE4] truncate">{session.user?.name}</p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-nb-sun truncate">{roleLabel}</p>
                        </div>
                        <NotificationBell />
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-nb-ink bg-[#F3EFE4] py-2 font-brico font-bold text-xs text-nb-ink shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000]"
                    >
                        <LogOut size={14} /> Log out
                    </button>
                </div>
            </aside>

            {/* Main content area */}
            <main className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between px-4 py-3 border-b-2 border-[#F3EFE4]/10 bg-[#111]/95 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setMobileDrawerOpen(true)}
                            className="p-2 rounded-xl border-2 border-[#F3EFE4]/15 text-[#F3EFE4]"
                            aria-label="Open portal navigation"
                        >
                            <Menu size={19} />
                        </button>
                        <Link href="/" className="flex items-center gap-2 font-brico font-extrabold text-base text-[#F3EFE4]">
                            <span className="w-2.5 h-2.5 rounded-full bg-nb-sun border-2 border-nb-ink" /> AiRA {isAdmin ? "Console" : "Portal"}
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <NotificationBell />
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="p-2 rounded-xl border-2 border-[#F3EFE4]/15 text-[#F3EFE4]/80 hover:text-nb-peach"
                            aria-label="Log out"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </header>

                {/* Page content with bottom padding for the mobile dock */}
                <div className="flex-1 p-4 sm:p-6 md:p-8 pb-28 md:pb-10">
                    <div id="console-content" className="max-w-6xl mx-auto page-enter">
                        {children}
                    </div>
                    <ConsoleScrollReveal rootId="console-content" />
                </div>

                {/* Mobile bottom dock */}
                <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl border-2 border-nb-ink bg-[#F3EFE4] px-1.5 py-1.5 flex items-center justify-around shadow-[4px_4px_0_0_#6C5CE7]">
                    {mobileTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl border-2 transition-all ${
                                    active ? "bg-nb-sun border-nb-ink text-nb-ink" : "border-transparent text-nb-ink/60"
                                }`}
                            >
                                <Icon size={18} />
                                <span className="font-brico text-[10px] font-bold">{tab.label}</span>
                            </Link>
                        );
                    })}

                    <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl border-2 border-transparent text-nb-ink/60"
                    >
                        <Menu size={18} />
                        <span className="font-brico text-[10px] font-bold">More</span>
                    </button>
                </nav>

                {/* Mobile full drawer */}
                {mobileDrawerOpen && (
                    <div className="md:hidden fixed inset-0 z-[9995]">
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />
                        <aside className="fixed left-0 top-0 bottom-0 w-[82vw] max-w-xs bg-[#111] border-r-2 border-nb-sun flex flex-col z-[9996] p-4">
                            <div className="flex items-center justify-between pb-4 border-b-2 border-[#F3EFE4]/10">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-nb-lilac border-2 border-nb-ink flex items-center justify-center text-nb-ink font-brico font-extrabold text-sm shrink-0">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-brico font-bold text-[#F3EFE4] truncate">{session.user?.name}</p>
                                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-nb-sun">{roleLabel}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setMobileDrawerOpen(false)}
                                    className="p-1.5 rounded-lg border-2 border-[#F3EFE4]/15 text-[#F3EFE4]"
                                    aria-label="Close navigation"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                                {filteredNav.map((item) => {
                                    const Icon = item.icon;
                                    const active = pathname === item.href || pathname.startsWith(item.href + "/");
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileDrawerOpen(false)}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 font-brico text-sm ${
                                                active
                                                    ? "bg-nb-sun text-nb-ink border-nb-ink font-extrabold shadow-[3px_3px_0_0_#6C5CE7]"
                                                    : "border-transparent text-[#F3EFE4]/70 font-semibold"
                                            }`}
                                        >
                                            <Icon size={17} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-nb-ink bg-[#F3EFE4] py-2.5 font-brico font-bold text-sm text-nb-ink shadow-[3px_3px_0_0_#6C5CE7]"
                            >
                                <LogOut size={15} /> Log out
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
