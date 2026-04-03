import Link from "next/link";
import { Github, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-aira-border/50 grid-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center font-orbitron font-bold text-sm text-white">
                                AL
                            </div>
                            <span className="font-orbitron font-bold text-xl gradient-text-cyan">
                                AIRA<span className="text-aira-magenta"> Labs</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            A premier college innovation lab fostering creativity, technology, and excellence through events, research, and collaborative projects.
                        </p>
                        <div className="flex gap-3 mt-6">
                            {[
                                { icon: Github, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Instagram, href: "#" },
                            ].map(({ icon: Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-aira-cyan hover:border-aira-cyan/50 transition-all"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-orbitron font-semibold text-sm text-aira-cyan mb-4 tracking-widest uppercase">
                            Navigate
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: "/", label: "Home" },
                                { href: "/events", label: "Events" },
                                { href: "/about", label: "About Us" },
                                { href: "/achievements", label: "Achievements" },
                                { href: "/join", label: "Join AIRA Labs" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 hover:text-aira-cyan text-sm transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 rounded-full bg-aira-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-orbitron font-semibold text-sm text-aira-cyan mb-4 tracking-widest uppercase">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { icon: Mail, text: "contact@airalabs.edu" },
                                { icon: Phone, text: "+91 00000 00000" },
                                { icon: MapPin, text: "College Campus, Innovation Block" },
                            ].map(({ icon: Icon, text }, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                                    <Icon size={14} className="text-aira-cyan shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-aira-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-xs">
                        © 2024 AIRA Labs. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">Powered by</span>
                        <span className="text-aira-cyan text-xs font-medium font-orbitron">AIRA Labs</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
