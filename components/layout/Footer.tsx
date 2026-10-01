import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Instagram, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

const NAV = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/events", label: "Events" },
    { href: "/blog", label: "Blog" },
    { href: "/magazine", label: "Magazine" },
    { href: "/achievements", label: "Achievements" },
    { href: "/leadership", label: "Leadership" },
    { href: "/join", label: "Join us" },
    { href: "/contact", label: "Contact" },
];

const SOCIAL = [
    { icon: Github, href: "https://github.com/MeetDave-25/AiRA", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/aira-lab", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
];

export default function Footer() {
    return (
        <footer className="relative z-10 bg-nb-paper text-nb-ink px-3 sm:px-6 pb-24 sm:pb-28">
            <div className="mx-auto max-w-[1360px] rounded-[28px] border-2 border-nb-ink bg-nb-ink text-nb-paper shadow-nb-lg overflow-hidden">
                {/* Big call to action */}
                <div className="p-8 sm:p-12 lg:p-14 border-b-2 border-nb-paper/15 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-paper/50">Led by LJCCA students · Software · AI · Robotics</p>
                        <p className="mt-3 font-brico font-extrabold tracking-[-0.04em] leading-[0.92] text-[clamp(2.6rem,6.5vw,5.75rem)]">
                            Come build
                            <br />
                            with <span className="inline-block rotate-[-2deg] rounded-xl border-2 border-nb-paper bg-nb-violet px-3">us.</span>
                        </p>
                    </div>
                    <Link
                        href="/join"
                        className="self-start lg:self-auto inline-flex items-center gap-2 rounded-xl border-2 border-nb-paper bg-nb-sun text-nb-ink px-6 py-3.5 font-brico font-bold text-lg shadow-[5px_5px_0_0_#F3EFE4] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#F3EFE4]"
                    >
                        Join the community <ArrowUpRight size={20} />
                    </Link>
                </div>

                <div className="p-8 sm:p-12 lg:p-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <Link href="/" className="inline-flex items-center gap-3">
                            <Image src="/logo.png" alt="" width={40} height={40} className="rounded-lg border-2 border-nb-paper" />
                            <span className="font-brico font-extrabold text-2xl tracking-tight">AiRA Lab</span>
                        </Link>
                        <p className="mt-4 max-w-sm text-nb-paper/70 leading-relaxed">
                            A student-led community at L J College of Computer Application building software, AI and robotics — together.
                        </p>
                        <div className="mt-6 flex gap-2">
                            {SOCIAL.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-11 h-11 rounded-xl border-2 border-nb-paper/30 flex items-center justify-center hover:bg-nb-paper hover:text-nb-ink transition-colors"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <nav aria-label="Footer" className="lg:col-span-3">
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-paper/50 mb-4">Explore</p>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                            {NAV.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="font-brico font-semibold hover:text-nb-sun transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="lg:col-span-4">
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-nb-paper/50 mb-4">Say hello</p>
                        <ul className="space-y-3">
                            <li>
                                <a href="mailto:info@aira-lab.in" className="flex items-center gap-3 hover:text-nb-sun transition-colors">
                                    <Mail size={16} /> info@aira-lab.in
                                </a>
                            </li>
                            <li>
                                <a href="tel:+918160901481" className="flex items-center gap-3 hover:text-nb-sun transition-colors">
                                    <Phone size={16} /> +91 81609 01481
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-nb-paper/80">
                                <MapPin size={16} className="mt-1 shrink-0" /> LJCCA, L J College of Computer Application, Vastrapur, Ahmedabad
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="px-8 sm:px-12 lg:px-14 py-5 border-t-2 border-nb-paper/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-nb-paper/60">
                    <p>© {new Date().getFullYear()} AiRA Lab. Built by students, for students.</p>
                    <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
                        <Link href="/privacy" className="hover:text-nb-paper transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-nb-paper transition-colors">
                            Terms
                        </Link>
                        <Link href="/cookies" className="hover:text-nb-paper transition-colors">
                            Cookies
                        </Link>
                        <CookieSettingsButton className="hover:text-nb-paper transition-colors" />
                    </nav>
                </div>
            </div>
        </footer>
    );
}
