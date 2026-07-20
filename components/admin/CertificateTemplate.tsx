"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";
import { Award, Cpu, Globe2, ShieldCheck, Sparkles } from "lucide-react";

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
                className="relative flex flex-col font-serif"
                style={{
                    width: "1122px",
                    height: "794px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)", // Canva-like rich off-white base
                }}
            >
                {/* ---------- CANVA-STYLE DECORATIVE ELEMENTS ---------- */}

                {/* Top Left Corner Geometric Overlays */}
                <div
                    className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#0A2540] opacity-90 z-0 shadow-2xl"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                />
                <div
                    className="absolute top-0 left-0 w-[450px] h-[450px] bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] opacity-70 z-0"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)", transform: "translate(-30px, -30px)" }}
                />

                {/* Bottom Right Corner Geometric Overlays */}
                <div
                    className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-[#0A2540] opacity-95 z-0 shadow-2xl"
                    style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] opacity-60 z-0"
                    style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)", transform: "translate(40px, 40px)" }}
                />

                {/* Geometric Stripe Accent Lines */}
                <div className="absolute top-[80px] -right-[150px] w-[400px] h-3 bg-[#D4AF37] opacity-40 rotate-45 z-[1]" />
                <div className="absolute top-[120px] -right-[150px] w-[500px] h-1 bg-[#D4AF37] opacity-60 rotate-45 z-[1]" />
                <div className="absolute bottom-[100px] -left-[100px] w-[350px] h-4 bg-[#D4AF37] opacity-50 rotate-45 z-[1]" />

                {/* Ornate Gold Frame (Double Border) */}
                <div className="absolute top-[35px] left-[35px] right-[35px] bottom-[35px] border-4 border-[#D4AF37] opacity-80 z-10 pointer-events-none" />
                <div className="absolute top-[45px] left-[45px] right-[45px] bottom-[45px] border border-[#0A2540]/30 z-10 pointer-events-none" />

                {/* Faint Abstract Watermark Logo in Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.03]">
                    <Globe2 size={600} color="#0A2540" strokeWidth={1} />
                </div>

                {/* ----------------------------------------------------- */}


                <div className="relative z-20 flex-1 flex flex-col pt-16 px-20 pb-16">

                    {/* Header: Left Logo, Center Title, Right Logo */}
                    <div className="w-full flex items-center justify-between mb-10 px-6 h-28 mt-4">

                        {/* Partner / College Logo (Left) */}
                        <div className="w-48 h-full flex items-center justify-start opacity-90 drop-shadow-md">
                            {collegeLogoUrl ? (
                                <img src={collegeLogoUrl} crossOrigin="anonymous" alt="Partner Logo" className="max-h-full object-contain max-w-full rounded-md" />
                            ) : (
                                <div className="w-full h-full rounded border-2 border-dashed border-white/50 flex flex-col items-center justify-center text-white/50 text-[10px] text-center p-2 opacity-80">
                                    <Sparkles size={16} className="mb-1" />
                                    <span>College Logo</span>
                                </div>
                            )}
                        </div>

                        {/* Center: AiRA Lab Classic Text Form */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <span className="font-serif font-black text-[55px] tracking-[0.15em] text-[#0A2540] drop-shadow-md">
                                AiRA<span className="text-[#3B82F6]"> Lab</span>
                            </span>
                            <p className="text-[10px] text-[#0A2540] tracking-[0.4em] uppercase mt-2 font-bold opacity-80">Innovation & Research Laboratory</p>
                        </div>

                        {/* Official AiRA Logo Image (Right) */}
                        <div className="w-48 h-full flex items-center justify-end opacity-90 drop-shadow-md">
                            {logoUrl ? (
                                <img src={logoUrl} crossOrigin="anonymous" alt="Official Logo" className="max-h-full object-contain max-w-full rounded-md" />
                            ) : (
                                <div className="w-[120px] h-full rounded bg-gradient-to-br from-[#0A2540]/10 to-transparent border border-[#0A2540]/20 flex flex-col items-center justify-center font-bold text-lg text-[#0A2540] opacity-80 text-center shadow-inner">
                                    AiRA<br /><span className="text-sm font-normal">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-start text-center pt-8">
                        <h1 className="text-6xl font-black text-[#D4AF37] uppercase tracking-[0.1em] mb-4 drop-shadow-sm" style={{ fontFamily: "Georgia, serif" }}>
                            {title || "Certificate of Excellence"}
                        </h1>

                        <p className="text-xl text-[#0A2540] tracking-[0.25em] uppercase mb-12 font-bold opacity-90 flex items-center gap-3">
                            <span className="w-12 h-px bg-[#0A2540]" />
                            {eventStr || "Proudly presented at AiRA Lab"}
                            <span className="w-12 h-px bg-[#0A2540]" />
                        </p>

                        <p className="text-2xl text-slate-600 mb-6 font-medium italic" style={{ fontFamily: "'Times New Roman', Times, serif" }}>This certifies that</p>

                        <h2 className="text-[85px] font-bold text-[#0A2540] mb-6 capitalize leading-none drop-shadow-md" style={{ fontFamily: "Georgia, serif" }}>
                            {name || "John Doe"}
                        </h2>

                        <div className="w-[150px] h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mb-8 opacity-80" />

                        <p className="text-2xl text-[#1e293b] max-w-4xl leading-relaxed font-light mx-auto" style={{ fontFamily: "Georgia, serif" }}>
                            {description || "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application."}
                        </p>
                    </div>

                    {/* Signatures & Date Area - Safe Flexbox Row at bottom */}
                    <div className="flex justify-between items-end w-full px-16 mt-12 pb-4">
                        <div className="text-center w-72">
                            <div className="text-2xl font-bold text-[#0A2540] mb-3" style={{ fontFamily: "Georgia, serif" }}>{date ? format(new Date(date), "MMMM do, yyyy") : format(new Date(), "MMMM do, yyyy")}</div>
                            <div className="w-full h-px bg-[#0A2540]/50 mb-3" />
                            <div className="text-sm text-[#0A2540] tracking-[0.15em] uppercase font-bold opacity-90">Date of Issuance</div>
                        </div>

                        {/* Center Seal Plaque */}
                        <div className="w-40 h-40 absolute left-1/2 bottom-8 transform -translate-x-1/2 flex items-center justify-center">
                            <div className="relative flex items-center justify-center">
                                {/* Golden Outer Starburst / Circle */}
                                <div className="absolute w-36 h-36 border-[8px] border-double border-[#D4AF37] rounded-full opacity-90 animate-spin-slow rotate-45" />
                                <div className="absolute w-32 h-32 bg-[#0A2540] rounded-full drop-shadow-2xl" />
                                <Award size={64} className="text-[#D4AF37] z-10" strokeWidth={1.5} />
                                <span className="absolute bottom-5 text-[#D4AF37] text-[9px] font-bold tracking-widest uppercase z-10">Trusted</span>
                            </div>
                        </div>

                        <div className="text-center w-72 relative">
                            <div className="h-24 flex items-end justify-center mb-1 w-full relative z-10">
                                {signatureUrl ? (
                                    <img src={signatureUrl} crossOrigin="anonymous" alt="Signature" className="h-[120%] object-contain mb-2 max-w-[250px]" />
                                ) : (
                                    <span className="text-[50px] text-white -rotate-6 mb-2 drop-shadow-md" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontStyle: "italic" }}>AiRA Director</span>
                                )}
                            </div>
                            <div className="w-full h-px bg-white/50 mb-3 z-10 relative shadow-md" />
                            <div className="text-sm text-white tracking-[0.15em] uppercase font-bold z-10 relative drop-shadow-md">AiRA Lab Director</div>

                            {/* A subtle shadow block behind signature if they upload a transparent one because the corner is dark blue */}
                            <div className="absolute inset-0 bg-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
