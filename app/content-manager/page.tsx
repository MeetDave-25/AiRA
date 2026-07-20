"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, Image, ArrowRight, Layers } from "lucide-react";

export default function ContentManagerDashboard() {
    const { data: session } = useSession();
    const name = (session?.user as any)?.name || "Content Manager";

    const tiles = [
        {
            href: "/content-manager/events",
            icon: <Calendar size={26} className="text-aira-cyan" />,
            title: "Events",
            desc: "Create and edit events, upload event banners, set dates and descriptions, and manage participant registrations.",
            color: "from-aira-cyan/10 to-transparent border-aira-cyan/20 hover:border-aira-cyan/50",
            iconBg: "bg-aira-cyan/10",
        },
        {
            href: "/content-manager/achievements",
            icon: <Image size={26} className="text-aira-purple" />,
            title: "Achievements & Media",
            desc: "Upload achievement photos, project highlights, workshop summaries and videos for the public gallery.",
            color: "from-aira-purple/10 to-transparent border-aira-purple/20 hover:border-aira-purple/50",
            iconBg: "bg-aira-purple/10",
        },
        {
            href: "/content-manager/gallery",
            icon: <Layers size={26} className="text-emerald-400" />,
            title: "Gallery",
            desc: "Manage the homepage gallery. Reorder, add, or remove media items shown publicly.",
            color: "from-emerald-400/10 to-transparent border-emerald-400/20 hover:border-emerald-400/50",
            iconBg: "bg-emerald-400/10",
        },
    ];

    return (
        <div className="min-h-screen bg-aira-bg p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="glass rounded-2xl border border-white/5 p-6 bg-gradient-to-r from-emerald-500/5 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                        <Calendar size={26} className="text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl text-white">Content Manager</h1>
                        <p className="text-slate-400 text-sm">Welcome, <span className="text-emerald-400 font-semibold">{name}</span></p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm mt-4">Upload and manage all public-facing content — events, achievements, and media gallery.</p>
            </div>

            {/* Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tiles.map(t => (
                    <Link key={t.href} href={t.href}
                        className={`group glass rounded-2xl border p-6 bg-gradient-to-br transition-all duration-200 ${t.color} flex flex-col gap-4 cursor-pointer`}>
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl ${t.iconBg} flex items-center justify-center`}>
                                {t.icon}
                            </div>
                            <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg mb-1">{t.title}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{t.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
