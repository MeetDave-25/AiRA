"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Award, Download, Palette, ArrowRight } from "lucide-react";

export default function CertificateManagerDashboard() {
    const { data: session } = useSession();
    const name = (session?.user as any)?.name || "Certificate Manager";

    return (
        <div className="min-h-screen bg-aira-bg p-6 md:p-10 space-y-8">
            {/* Header */}
            <div className="glass rounded-2xl border border-white/5 p-6 bg-gradient-to-r from-orange-500/5 to-transparent">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center">
                        <Award size={26} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="font-orbitron font-bold text-2xl text-white">Certificate Manager</h1>
                        <p className="text-slate-400 text-sm">Welcome, <span className="text-orange-400 font-semibold">{name}</span></p>
                    </div>
                </div>
                <p className="text-slate-500 text-sm mt-3">Design certificate templates, customise branding, and bulk-generate certificates for AiRA Lab events.</p>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Link href="/certificate-manager/designer"
                    className="group glass rounded-2xl border border-orange-400/20 hover:border-orange-400/50 p-6 bg-gradient-to-br from-orange-400/10 to-transparent transition-all flex flex-col gap-4 cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center">
                            <Palette size={24} className="text-orange-400" />
                        </div>
                        <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg mb-1">Design & Customise</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">Open the visual editor to drag, resize, and style every element of the certificate. Change themes, fonts, colours, and layout.</p>
                    </div>
                </Link>

                <Link href="/certificate-manager/generate"
                    className="group glass rounded-2xl border border-aira-cyan/20 hover:border-aira-cyan/50 p-6 bg-gradient-to-br from-aira-cyan/10 to-transparent transition-all flex flex-col gap-4 cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-aira-cyan/10 flex items-center justify-center">
                            <Download size={24} className="text-aira-cyan" />
                        </div>
                        <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg mb-1">Generate Certificates</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">Upload recipient names or load from an event, upload logos and signature, then bulk-generate and download a ZIP of all PDFs.</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
