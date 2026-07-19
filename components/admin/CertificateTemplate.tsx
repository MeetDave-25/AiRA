"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface CertificateTemplateProps {
    name: string;
    title: string;
    eventStr: string;
    description: string;
    date: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ name, title, eventStr, description, date }, ref) => {
        return (
            <div
                ref={ref}
                className="relative bg-[#050505] overflow-hidden flex flex-col font-sans"
                style={{
                    width: "1122px",
                    height: "794px",
                    // The inline styles ensure html2canvas captures it perfectly regardless of Tailwind tailwinds responsive rules
                    boxSizing: "border-box",
                }}
            >
                {/* Background Details */}
                <div className="absolute inset-0 border-[16px] border-[#0A0A0A] z-50 pointer-events-none" />
                <div className="absolute inset-[16px] border border-[#00D4FF]/30 z-50 pointer-events-none" />

                <div className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] rounded-full bg-[#00D4FF]/20 blur-[150px]" />
                <div className="absolute -bottom-[400px] -left-[400px] w-[800px] h-[800px] rounded-full bg-[#7C3AED]/20 blur-[150px]" />

                {/* Noise texture overlay for premium feel */}
                <div
                    className="absolute inset-0 opacity-[0.03] z-[1] pointer-events-none"
                    style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
                />

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-16 text-center">
                    {/* Header Logo */}
                    <div className="mb-10 flex items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] flex items-center justify-center font-orbitron font-bold text-3xl text-white shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                            AL
                        </div>
                        <span className="font-orbitron font-extrabold text-4xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-white">
                            AiRA<span className="text-[#FF2A85]"> Lab</span>
                        </span>
                    </div>

                    <h1 className="text-5xl font-orbitron font-black text-[#00D4FF] uppercase tracking-[0.2em] mb-4" style={{ textShadow: "0 0 40px rgba(0,212,255,0.5)" }}>
                        {title || "Certificate of Excellence"}
                    </h1>

                    <p className="text-xl text-slate-400 tracking-widest uppercase mb-12">
                        {eventStr || "Proudly presented at"}
                    </p>

                    <p className="text-lg text-slate-500 mb-4 font-medium italic">This certifies that</p>

                    <h2 className="text-7xl font-bold text-white mb-8 capitalize" style={{ fontFamily: "Georgia, serif" }}>
                        {name || "John Doe"}
                    </h2>

                    <div className="w-[100px] h-1 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] mb-8" />

                    <p className="text-2xl text-slate-300 max-w-3xl leading-relaxed font-light">
                        {description || "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application."}
                    </p>

                    {/* Signatures & Date Area */}
                    <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end px-16">
                        <div className="text-center">
                            <div className="text-xl font-medium text-white mb-2">{date ? format(new Date(date), "MMMM do, yyyy") : format(new Date(), "MMMM do, yyyy")}</div>
                            <div className="w-48 h-px bg-slate-700 mb-2 mx-auto" />
                            <div className="text-sm text-[#00D4FF] tracking-widest uppercase font-semibold">Date of Issuance</div>
                        </div>

                        <div className="text-center">
                            <div className="w-48 h-12 flex items-end justify-center mb-1">
                                <span className="font-[Brush_Script_MT,cursive] text-4xl text-white opacity-90 -rotate-2">AiRA Director</span>
                            </div>
                            <div className="w-48 h-px bg-slate-700 mb-2 mx-auto" />
                            <div className="text-sm text-[#7C3AED] tracking-widest uppercase font-semibold">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
