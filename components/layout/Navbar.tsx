"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/leadership", label: "Leadership" },
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blog" },
    { href: "/magazine", label: "Magazine" },
    { href: "/achievements", label: "Achievements" },
    { href: "/join", label: "Join Us" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on route change or Escape
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9990] md:hidden"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-[9999] transition-all duration-500",
                    scrolled
                        ? "glass-strong py-3 shadow-lg shadow-black/30"
                        : "py-3.5 sm:py-4 md:py-5 bg-transparent backdrop-blur-none border-b border-white/5 md:border-none"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Logo href="/" size="md" showText priority />

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    pathname === link.href
                                        ? "text-aira-cyan bg-aira-cyan/10 font-semibold"
                                        : "text-slate-300 hover:text-aira-cyan hover:bg-white/5"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {session && <NotificationBell />}

                        {session ? (
                            <Link
                                href="/portal/dashboard"
                                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-300 text-sm font-medium hover:bg-sky-500/20 transition-all"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-slate-950">
                                    {session.user?.name?.[0]}
                                </div>
                                Portal
                            </Link>
                        ) : (
                            <Link
                                href="/portal/login"
                                className="hidden md:block px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-slate-200 hover:bg-white hover:text-slate-950 transition-all duration-200"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-2 sm:p-2.5 rounded-xl text-aira-cyan bg-aira-cyan/10 border border-aira-cyan/20 active:scale-95 transition-transform"
                            aria-label="Toggle menu"
                        >
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu drawer */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="md:hidden fixed left-0 right-0 top-16 sm:top-20 mx-3 sm:mx-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl border border-aira-cyan/40 rounded-2xl shadow-2xl shadow-aira-cyan/20 z-[9998]"
                        >
                            <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "block px-4 sm:px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all",
                                            pathname === link.href
                                                ? "text-aira-cyan bg-aira-cyan/10 border border-aira-cyan/20 font-bold"
                                                : "text-slate-300 hover:text-aira-cyan hover:bg-white/5 active:bg-white/10"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="pt-2">
                                    <Link
                                        href={session ? "/portal/dashboard" : "/portal/login"}
                                        onClick={() => setOpen(false)}
                                        className="block px-4 sm:px-5 py-3 rounded-xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-aira-cyan/25 to-sky-500/25 border border-aira-cyan/40 text-center hover:bg-aira-cyan/30 active:scale-98 transition-all"
                                    >
                                        {session ? "Access Portal Dashboard →" : "Login to Portal →"}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
