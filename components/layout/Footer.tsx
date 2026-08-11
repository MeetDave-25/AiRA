import Link from "next/link";
import { Github, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
    return (
        <footer className="mt-16 sm:mt-20 border-t border-aira-border/50 grid-bg relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 md:col-span-1">
                        <div className="mb-4">
                            <Logo href="/" size="md" showText />
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                            A premier college innovation lab fostering creativity, technology, and excellence through events, research, and collaborative projects.
                        </p>
                        <div className="flex gap-3 mt-5 sm:mt-6">
                            {[
                                { icon: Github, href: "https://github.com/MeetDave-25/AiRA", label: "GitHub" },
                                { icon: Linkedin, href: "https://www.linkedin.com/company/aira-lab", label: "LinkedIn" },
                                { icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
                            ].map(({ icon: Icon, href, label }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-aira-cyan hover:border-aira-cyan/50 hover:scale-110 active:scale-95 transition-all"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-orbitron font-semibold text-xs sm:text-sm text-aira-cyan mb-3 sm:mb-4 tracking-widest uppercase">
                            Navigate
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                            {[
                                { href: "/", label: "Home" },
                                { href: "/projects", label: "Community Project Showcase" },
                                { href: "/leadership", label: "Leadership & Visionaries" },
                                { href: "/events", label: "Events & Workshops" },
                                { href: "/about", label: "About Us" },
                                { href: "/magazine", label: "AiRA Magazine" },
                                { href: "/achievements", label: "Achievements" },
                                { href: "/join", label: "Join AIRA Labs" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-400 hover:text-aira-cyan text-xs sm:text-sm transition-colors flex items-center gap-2 group py-0.5"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-aira-cyan opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-orbitron font-semibold text-xs sm:text-sm text-aira-cyan mb-3 sm:mb-4 tracking-widest uppercase">
                            Contact
                        </h3>
                        <ul className="space-y-2.5 sm:space-y-3">
                            <li className="flex items-start sm:items-center gap-3 text-slate-400 text-xs sm:text-sm">
                                <Mail size={14} className="text-aira-cyan shrink-0 mt-0.5 sm:mt-0" />
                                <a 
                                    href="mailto:info@aira-lab.in" 
                                    className="hover:text-aira-cyan hover:underline transition-colors break-all"
                                >
                                    info@aira-lab.in
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-xs sm:text-sm">
                                <Phone size={14} className="text-aira-cyan shrink-0" />
                                <a 
                                    href="tel:+918160901481" 
                                    className="hover:text-aira-cyan transition-colors"
                                >
                                    +91 81609 01481
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400 text-xs sm:text-sm">
                                <MapPin size={14} className="text-aira-cyan shrink-0 mt-0.5" />
                                <span>LJCCA, L J College of Computer Application, Vastrapur, Ahmedabad</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 sm:mt-12 pt-6 border-t border-aira-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <p className="text-slate-400 text-xs sm:text-sm">
                            © {new Date().getFullYear()} AIRA Labs. All rights reserved.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">Powered by</span>
                        <span className="text-aira-cyan text-xs font-medium font-orbitron">AIRA Labs</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
