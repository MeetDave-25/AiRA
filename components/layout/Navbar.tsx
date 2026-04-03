"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/about", label: "About Us" },
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

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                scrolled ? "glass-strong py-3 shadow-lg shadow-black/30" : "py-6 bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-orbitron font-bold text-sm text-white glow-cyan group-hover:scale-110 transition-transform">
                            AL
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-aira-cyan to-aira-purple opacity-30 blur-md group-hover:opacity-60 transition-opacity" />
                    </div>
                    <span className="font-orbitron font-bold text-xl gradient-text-cyan hidden sm:block">
                        AIRA<span className="text-aira-magenta"> Labs</span>
                    </span>
                </Link>

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
                <div className="flex items-center gap-3">
                    {session ? (
                        <Link
                            href="/portal/dashboard"
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-aira-cyan/10 border border-aira-cyan/30 text-aira-cyan text-sm font-medium hover:bg-aira-cyan/20 transition-all"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center text-xs font-bold text-white">
                                {session.user?.name?.[0]}
                            </div>
                            Portal
                        </Link>
                    ) : (
                        <Link
                            href="/portal/login"
                            className="hidden md:block px-4 py-2 text-sm font-medium rounded-lg border border-aira-cyan/30 text-aira-cyan hover:bg-aira-cyan hover:text-aira-bg transition-all duration-200"
                        >
                            Login
                        </Link>
                    )}

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setOpen(!open)}
                        className="md:hidden p-2 rounded-lg text-slate-300 hover:text-aira-cyan"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden glass-strong mt-1 mx-4 rounded-xl overflow-hidden"
                    >
                        <div className="p-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "block px-4 py-3 rounded-lg text-sm font-medium transition-all",
                                        pathname === link.href
                                            ? "text-aira-cyan bg-aira-cyan/10"
                                            : "text-slate-300 hover:text-aira-cyan hover:bg-white/5"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/portal/login"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-aira-cyan bg-aira-cyan/10 border border-aira-cyan/30"
                            >
                                {session ? "My Portal" : "Login"}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
