"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Calendar, Image, FileText, ArrowRight } from "lucide-react";

export default function ContentManagerDashboard() {
    const { data: session } = useSession();
    const name = (session?.user as any)?.name || "Content Manager";

    const tiles = [
        {
            href: "/content-manager/certificates",
            icon: <Award size={28} className="text-aira-gold" />,
            title: "Certificate Designer",
            desc: "Design certificate templates and generate bulk certificates for any event.",
            color: "from-aira-gold/10 to-transparent border-aira-gold/20 hover:border-aira-gold/50",
        },
        {
            href: "/content-manager/events",
            icon: <Calendar size={28} className="text-aira-cyan" />,
            title: "Events",
            desc: "Create, edit, and publish events. Upload event banners and manage registrations.",
            color: "from-aira-cyan/10 to-transparent border-aira-cyan/20 hover:border-aira-cyan/50",
        },
        {
            href: "/content-manager/achievements",
            icon: <Image size={28} className="text-aira-purple" />,
            title: "Achievements & Media",
            desc: "Upload achievement photos, videos, and gallery content for the public page.",
            color: "from-aira-purple/10 to-transparent border-aira-purple/20 hover:border-aira-purple/50",
        },
    ];

    return (
        <div className="min-h-screen bg-aira-bg p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="glass rounded-2xl border border-white/5 p-6">
                <h1 className="font-orbitron font-bold text-3xl text-white">
                    Content Manager
                </h1>
                <p className="text-slate-400 mt-1">Welcome, <span className="text-aira-cyan font-semibold">{name}</span>. Manage all AiRA Lab content from here.</p>
            </div>

            {/* Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tiles.map(t => (
                    <Link key={t.href} href={t.href}
                        className={`group glass rounded-2xl border p-6 bg-gradient-to-br transition-all duration-200 ${t.color} flex flex-col gap-4 cursor-pointer`}>
                        <div className="flex items-start justify-between">
                            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
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
