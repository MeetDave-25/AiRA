"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/ui/NotificationBell";

const primaryLinks = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blog" },
];

const moreLinks = [
    { href: "/leadership", label: "Leadership" },
    { href: "/magazine", label: "Magazine" },
    { href: "/achievements", label: "Achievements" },
];

const allNavLinks = [{ href: "/", label: "Home" }, ...primaryLinks, ...moreLinks, { href: "/join", label: "Join Us" }];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** Neo-brutal navigation bar for all public pages. */
export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    // Close menus on route change, Escape, or outside click.
    useEffect(() => {
        setOpen(false);
        setMoreOpen(false);
    }, [pathname]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                setMoreOpen(false);
            }
        };
        const onClick = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, []);

    const linkCls = (href: string) =>
        cn(
            "px-3.5 py-2 rounded-xl font-brico font-semibold text-[15px] transition-colors",
            isActive(pathname, href) ? "bg-nb-ink text-nb-paper" : "text-nb-ink hover:bg-nb-ink/10"
        );
    const moreActive = moreLinks.some((l) => isActive(pathname, l.href));

    return (
        <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-6 z-[9999]">
            <nav className="mx-auto max-w-[1360px] flex items-center justify-between gap-3 rounded-2xl border-2 border-nb-ink bg-nb-paper/90 backdrop-blur-md shadow-nb px-2.5 py-2">
                <Link href="/" aria-label="AiRA Lab home" className="flex items-center gap-2.5 pl-1">
                    <Image src="/logo.png" alt="" width={34} height={34} className="rounded-lg border-2 border-nb-ink" priority />
                    <span className="font-brico font-extrabold text-lg tracking-tight text-nb-ink">AiRA Lab</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {primaryLinks.map((l) => (
                        <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                            {l.label}
                        </Link>
                    ))}
                    <div ref={moreRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setMoreOpen((o) => !o)}
                            aria-expanded={moreOpen}
                            className={cn(
                                "flex items-center gap-1 px-3.5 py-2 rounded-xl font-brico font-semibold text-[15px] transition-colors",
                                moreActive ? "bg-nb-ink text-nb-paper" : "text-nb-ink hover:bg-nb-ink/10"
                            )}
                        >
                            More <ChevronDown size={15} className={cn("transition-transform", moreOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {moreOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-3 w-52 rounded-2xl border-2 border-nb-ink bg-nb-paper shadow-nb p-1.5"
                                >
                                    {moreLinks.map((l) => (
                                        <Link key={l.href} href={l.href} className={cn("block", linkCls(l.href))}>
                                            {l.label}
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {session && <NotificationBell />}
                    <Link
                        href={session ? "/portal/dashboard" : "/portal/login"}
                        className="hidden md:inline-flex px-3.5 py-2 rounded-xl font-brico font-semibold text-[15px] text-nb-ink hover:underline underline-offset-4"
                    >
                        {session ? "Portal" : "Login"}
                    </Link>
                    <Link
                        href="/join"
                        className="hidden sm:inline-flex items-center rounded-xl border-2 border-nb-ink bg-nb-violet text-white px-4 py-2 font-brico font-bold text-[15px] shadow-nb-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        Join us
                    </Link>
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        className="md:hidden w-10 h-10 rounded-xl border-2 border-nb-ink bg-nb-sun flex items-center justify-center shadow-nb-sm"
                    >
                        {open ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="md:hidden mt-2 max-h-[calc(100svh-6rem)] overflow-y-auto rounded-2xl border-2 border-nb-ink bg-nb-paper shadow-nb p-2"
                    >
                        {allNavLinks.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={cn("block px-4 py-3 rounded-xl font-brico font-bold text-lg", isActive(pathname, l.href) ? "bg-nb-ink text-nb-paper" : "text-nb-ink hover:bg-nb-ink/5")}
                            >
                                {l.label}
                            </Link>
                        ))}
                        <Link
                            href={session ? "/portal/dashboard" : "/portal/login"}
                            className="mt-2 block text-center px-4 py-3 rounded-xl border-2 border-nb-ink bg-nb-violet text-white font-brico font-bold"
                        >
                            {session ? "Open portal" : "Login to portal"}
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
