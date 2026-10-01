import Link from "next/link";
import { Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
    title: "Contact",
    description: "Contact AiRA Lab, the student-led software, AI and robotics community at L J College of Computer Application (LJCCA), Ahmedabad.",
    path: "/contact",
});

const channels = [
    { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}`, color: "bg-nb-sky" },
    { icon: Phone, label: "Phone", value: "+91 81609 01481", href: "tel:+918160901481", color: "bg-nb-peach" },
    {
        icon: MapPin,
        label: "Visit us",
        value: `${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.region}`,
        href: "https://www.google.com/maps/search/?api=1&query=L+J+College+of+Computer+Application+Vastrapur+Ahmedabad",
        color: "bg-nb-mint",
    },
];

const topics = [
    ["Joining the lab", "Applications open through the Join page — no experience needed.", "/join"],
    ["Events & workshops", "Questions about registrations, venues or certificates.", "/events"],
    ["Collaborations & sponsorships", "Companies, colleges and clubs who want to build something with us.", null],
    ["Privacy requests", "Access, correct or delete your personal data.", "/privacy"],
] as const;

export default function ContactPage() {
    return (
        <div className="px-5 sm:px-8 lg:px-12 max-w-[1360px] mx-auto pt-32 sm:pt-36 pb-24">
            <header className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-nb-ink bg-nb-sun px-3 py-1 font-brico font-bold text-sm shadow-nb-sm">
                    <MessageCircle size={15} /> Contact
                </span>
                <h1 className="mt-5 font-brico font-extrabold tracking-[-0.04em] leading-[0.95] text-[clamp(2.6rem,7vw,5.5rem)]">Say hello.</h1>
                <p className="mt-5 text-lg text-nb-muted leading-relaxed">
                    AiRA Lab is led by LJCCA students at L J College of Computer Application, Ahmedabad. Whether you want to join, collaborate,
                    sponsor an event or just ask a question — we read every message.
                </p>
            </header>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                {channels.map(({ icon: Icon, label, value, href, color }) => (
                    <a
                        key={label}
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className={`rounded-[22px] border-2 border-nb-ink p-6 shadow-nb transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-nb-lg ${color}`}
                    >
                        <span className="w-12 h-12 rounded-full border-2 border-nb-ink bg-white flex items-center justify-center shadow-nb-sm">
                            <Icon size={20} />
                        </span>
                        <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-nb-ink/70">{label}</p>
                        <p className="mt-1 font-brico font-bold text-lg break-words">{value}</p>
                    </a>
                ))}
            </div>

            <section className="mt-16 grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <h2 className="font-brico font-extrabold text-3xl tracking-tight">What can we help with?</h2>
                    <p className="mt-3 flex items-center gap-2 text-nb-muted">
                        <Clock size={16} /> We usually reply within 2–3 working days.
                    </p>
                </div>
                <ul className="lg:col-span-8 grid sm:grid-cols-2 gap-4">
                    {topics.map(([title, desc, href]) => (
                        <li key={title} className="rounded-[20px] border-2 border-nb-ink bg-white p-5 shadow-nb-sm">
                            <h3 className="font-brico font-bold text-lg">{title}</h3>
                            <p className="mt-1 text-sm text-nb-muted leading-relaxed">{desc}</p>
                            {href ? (
                                <Link href={href} className="mt-3 inline-block font-bold text-sm text-nb-violet hover:underline">Learn more →</Link>
                            ) : (
                                <a href={`mailto:${siteConfig.email}?subject=Collaboration`} className="mt-3 inline-block font-bold text-sm text-nb-violet hover:underline">Email us →</a>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
