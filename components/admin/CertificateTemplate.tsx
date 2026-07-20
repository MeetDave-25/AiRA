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
                className="relative bg-white flex flex-col font-serif text-slate-800"
                style={{
                    width: "1122px",
                    height: "794px",
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >
                {/* Background Details - Light Blue Theme */}
                <div className="absolute top-0 left-0 w-full h-full border-[16px] border-[#0A3D6B] z-10 pointer-events-none" />
                <div className="absolute top-[20px] left-[20px] right-[20px] bottom-[20px] border-2 border-[#1E88E5]/40 z-10 pointer-events-none" />
                <div className="absolute top-[24px] left-[24px] right-[24px] bottom-[24px] border border-[#1E88E5]/20 z-10 pointer-events-none" />

                {/* Elegant subtle gradients */}
                <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] pointer-events-none z-0"
                    style={{ background: "radial-gradient(circle, rgba(144, 202, 249, 0.2) 0%, rgba(255,255,255,0) 70%)" }} />
                <div className="absolute -bottom-[150px] -left-[150px] w-[500px] h-[500px] pointer-events-none z-0"
                    style={{ background: "radial-gradient(circle, rgba(30, 136, 229, 0.15) 0%, rgba(255,255,255,0) 70%)" }} />

                {/* subtle texture overlay if any */}
                <div
                    className="absolute top-0 left-0 w-full h-full opacity-[0.02] z-[1] pointer-events-none mix-blend-multiply"
                    style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }}
                />

                <div className="relative z-20 flex-1 flex flex-col pt-16 px-20 pb-16">

                    {/* Header: Left Logo, Center Title, Right Logo */}
                    <div className="w-full flex items-center justify-between mb-10 px-4 h-28">

                        {/* Partner / College Logo (Left) */}
                        <div className="w-64 h-full flex items-center justify-start">
                            {collegeLogoUrl ? (
                                <img src={collegeLogoUrl} crossOrigin="anonymous" alt="Partner Logo" className="h-full object-contain max-w-full" />
                            ) : (
                                <div className="w-full max-w-[120px] h-full rounded-lg border-2 border-dashed border-[#1E88E5]/30 flex items-center justify-center text-slate-400 text-xs text-center p-2 opacity-60">
                                    College / Partner Logo Placeholder
                                </div>
                            )}
                        </div>

                        {/* Center: AiRA Lab Classic Text Form */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="font-serif font-black text-[50px] tracking-widest text-[#0A3D6B]">
                                AiRA<span className="text-[#1E88E5]"> Lab</span>
                            </span>
                            <p className="text-xs text-[#0A3D6B]/70 tracking-[0.3em] uppercase mt-2 font-medium">Driving Next-Gen Innovation</p>
                        </div>

                        {/* Official AiRA Logo Image (Right) */}
                        <div className="w-64 h-full flex items-center justify-end">
                            {logoUrl ? (
                                <img src={logoUrl} crossOrigin="anonymous" alt="Official Logo" className="h-full object-contain max-w-full" />
                            ) : (
                                <div className="w-full max-w-[120px] h-full rounded-lg bg-gradient-to-br from-[#1E88E5]/10 to-transparent border border-[#0A3D6B]/20 flex flex-col items-center justify-center font-bold text-lg text-[#0A3D6B] opacity-60 text-center shadow-inner">
                                    AiRA<br /><span className="text-sm font-normal">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-start text-center pt-6">
                        <h1 className="text-5xl font-black text-[#0A3D6B] uppercase tracking-[0.15em] mb-4 drop-shadow-sm" style={{ fontFamily: "Georgia, serif" }}>
                            {title || "Certificate of Excellence"}
                        </h1>

                        <p className="text-lg text-[#1E88E5] tracking-[0.2em] uppercase mb-12 font-medium">
                            {eventStr || "Proudly presented at AiRA Lab"}
                        </p>

                        <p className="text-xl text-slate-500 mb-4 font-medium italic" style={{ fontFamily: "'Times New Roman', Times, serif" }}>This certifies that</p>

                        <h2 className="text-7xl font-bold text-[#0A3D6B] mb-8 capitalize" style={{ fontFamily: "Georgia, serif" }}>
                            {name || "John Doe"}
                        </h2>

                        <div className="w-[120px] h-[3px] bg-[#1E88E5] mx-auto mb-8" />

                        <p className="text-2xl text-slate-600 max-w-4xl leading-relaxed font-light mx-auto" style={{ fontFamily: "Georgia, serif" }}>
                            {description || "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application."}
                        </p>
                    </div>

                    {/* Signatures & Date Area - Safe Flexbox Row at bottom */}
                    <div className="flex justify-between items-end w-full px-16 mt-16 pb-4">
                        <div className="text-center w-72">
                            <div className="text-xl font-medium text-slate-800 mb-3" style={{ fontFamily: "Georgia, serif" }}>{date ? format(new Date(date), "MMMM do, yyyy") : format(new Date(), "MMMM do, yyyy")}</div>
                            <div className="w-full h-px bg-slate-400 mb-3" />
                            <div className="text-sm text-[#0A3D6B] tracking-[0.15em] uppercase font-bold">Date of Issuance</div>
                        </div>

                        {/* Optional Center Stamp? */}
                        <div className="w-32 h-32 absolute left-1/2 bottom-12 transform -translate-x-1/2 opacity-10 pointer-events-none flex items-center justify-center">
                            {/* A beautiful official looking insignia / stamp SVG or logo could go here, currently using an elegant CSS stamp */}
                            <div className="w-24 h-24 rounded-full border-4 border-[#0A3D6B] flex items-center justify-center">
                                <span className="font-bold text-[#0A3D6B] text-xl transform -rotate-12">SEAL</span>
                            </div>
                        </div>

                        <div className="text-center w-72">
                            <div className="h-20 flex items-end justify-center mb-1 w-full relative">
                                {signatureUrl ? (
                                    <img src={signatureUrl} crossOrigin="anonymous" alt="Signature" className="h-[120%] object-contain mb-2 max-w-[250px]" />
                                ) : (
                                    <span className="text-[40px] text-slate-800 opacity-90 -rotate-3 mb-2" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>AiRA Director</span>
                                )}
                            </div>
                            <div className="w-full h-px bg-slate-400 mb-3" />
                            <div className="text-sm text-[#0A3D6B] tracking-[0.15em] uppercase font-bold">AiRA Lab Director</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
