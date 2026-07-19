"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";

export interface CertificateTemplateProps {
    name: string;
    title: string;
    eventStr: string;
    description: string;
    date: string;
    logoUrl?: string;
    signatureUrl?: string;
    collegeLogoUrl?: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ name, title, eventStr, description, date, logoUrl, signatureUrl, collegeLogoUrl }, ref) => {
        return (
            <div
                ref={ref}
                className="relative bg-[#050505] flex flex-col font-sans"
                style={{
                    width: "1122px",
                    height: "794px",
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >
                {/* Background Details */}
                <div className="absolute top-0 left-0 w-full h-full border-[16px] border-[#0A0A0A] z-10 pointer-events-none" />
                <div className="absolute top-[16px] left-[16px] right-[16px] bottom-[16px] border border-[#00D4FF]/30 z-10 pointer-events-none" />

                {/* Safe Radial Gradients instead of CSS filter: blur */}
                <div className="absolute -top-[200px] -right-[200px] w-[800px] h-[800px] pointer-events-none z-0"
                    style={{ background: "radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0) 70%)" }} />
                <div className="absolute -bottom-[200px] -left-[200px] w-[800px] h-[800px] pointer-events-none z-0"
                    style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0) 70%)" }} />

                {/* Noise texture */}
                <div
                    className="absolute top-0 left-0 w-full h-full opacity-[0.03] z-[1] pointer-events-none"
                    style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
                />

                <div className="relative z-20 flex-1 flex flex-col pt-16 px-16 pb-16">

                    {/* Header: Left Logo, Center Title, Right Logo */}
                    <div className="w-full flex items-center justify-between mb-8 px-4">

                        {/* Partner / College Logo (Left) */}
                        <div className="w-64 h-24 flex items-center justify-start">
                            {collegeLogoUrl ? (
                                <img src={collegeLogoUrl} crossOrigin="anonymous" alt="Partner Logo" className="h-full object-contain max-w-full" />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#00D4FF]/30 flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-2 opacity-50">
                                    College / Partner Logo Placeholder
                                </div>
                            )}
                        </div>

                        {/* Center: AiRA Lab Classic Text Form */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="font-orbitron font-black text-5xl tracking-widest text-[#00D4FF]">
                                AiRA<span className="text-white"> Lab</span>
                            </span>
                            <p className="text-[11px] text-slate-300 tracking-[0.3em] uppercase mt-2 font-medium">Driving Next-Gen Innovation & AI Research</p>
                        </div>

                        {/* Official AiRA Logo Image (Right) */}
                        <div className="w-64 h-24 flex items-center justify-end">
                            {logoUrl ? (
                                <img src={logoUrl} crossOrigin="anonymous" alt="Official Logo" className="h-full object-contain max-w-full" />
                            ) : (
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 border border-white/10 flex items-center justify-center font-orbitron font-bold text-lg text-white opacity-50 text-center">
                                    AiRA<br />Logo
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-start text-center pt-8">
                        <h1 className="text-5xl font-orbitron font-black text-[#00D4FF] uppercase tracking-[0.2em] mb-4" style={{ textShadow: "0 0 40px rgba(0,212,255,0.5)" }}>
                            {title || "Certificate of Excellence"}
                        </h1>

                        <p className="text-xl text-slate-400 tracking-widest uppercase mb-10">
                            {eventStr || "Proudly presented at"}
                        </p>

                        <p className="text-lg text-slate-500 mb-2 font-medium italic">This certifies that</p>

                        <h2 className="text-6xl font-bold text-white mb-6 capitalize" style={{ fontFamily: "Georgia, serif" }}>
                            {name || "John Doe"}
                        </h2>

                        <div className="w-[100px] h-[4px] bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] mx-auto mb-6" />

                        <p className="text-2xl text-slate-300 max-w-3xl leading-relaxed font-light mx-auto">
                            {description || "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application."}
                        </p>
                    </div>

                    {/* Signatures & Date Area - Safe Flexbox Row at bottom instead of absolute bottom-16 */}
                    <div className="flex justify-between items-end w-full px-8 mt-12">
                        <div className="text-center w-64">
                            <div className="text-xl font-medium text-white mb-2">{date ? format(new Date(date), "MMMM do, yyyy") : format(new Date(), "MMMM do, yyyy")}</div>
                            <div className="w-full h-px bg-slate-700 mb-2" />
                            <div className="text-sm text-[#00D4FF] tracking-widest uppercase font-semibold">Date of Issuance</div>
                        </div>

                        <div className="text-center w-64">
                            <div className="h-20 flex items-end justify-center mb-1 w-full relative">
                                {signatureUrl ? (
                                    <img src={signatureUrl} crossOrigin="anonymous" alt="Signature" className="h-[90%] object-contain mb-2 max-w-[200px]" />
                                ) : (
                                    <span className="font-serif text-4xl text-white opacity-90 -rotate-2" style={{ fontFamily: "Georgia, cursive", fontStyle: "italic" }}>AiRA Director</span>
                                )}
                            </div>
                            <div className="w-full h-px bg-slate-700 mb-2" />
                            <div className="text-sm text-[#7C3AED] tracking-widest uppercase font-semibold">AiRA Lab Director</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
