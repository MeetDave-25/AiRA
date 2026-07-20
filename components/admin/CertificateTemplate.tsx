"use client";

import React, { forwardRef } from "react";
import { format } from "date-fns";
import { Award } from "lucide-react";

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

/**
 * PIXEL BUDGET (total height = 794px):
 *  - Outer border inset: 24px top/bottom  -> 748px usable
 *  - Header row (logos + lab name): 100px
 *  - Separator bar: 8px
 *  - Title block: 120px
 *  - Sub-event row: 36px
 *  - "This certifies that": 30px
 *  - Name: 96px
 *  - Gold divider: 12px
 *  - Description: 80px
 *  - Spacer (flex-1)
 *  - Footer row: 100px
 *  Total text blocks ≈ 582px, fits easily in 748px.
 */
export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
    ({ name, title, eventStr, description, date, logoUrl, signatureUrl, collegeLogoUrl }, ref) => {
        const formattedDate = (() => { try { return format(new Date(date), "MMMM d, yyyy"); } catch { return date; } })();

        return (
            <div
                ref={ref}
                style={{
                    width: "1122px",
                    height: "794px",
                    position: "relative",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    background: "#FDFCF8",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                }}
            >
                {/* ===== BACKGROUND DECORATIONS (all strictly bounded, z-index 0-1) ===== */}

                {/* Main ivory background with subtle texture tone */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 0,
                    background: "linear-gradient(160deg, #FDFCF8 60%, #EFF3FA 100%)"
                }} />

                {/* Top-left navy triangle accent — strictly 260×260 */}
                <div style={{
                    position: "absolute", top: 0, left: 0,
                    width: 260, height: 260, zIndex: 1,
                    background: "#0A2540",
                    clipPath: "polygon(0 0, 100% 0, 0 100%)"
                }} />
                {/* Gold edge on top-left triangle */}
                <div style={{
                    position: "absolute", top: 0, left: 0,
                    width: 290, height: 290, zIndex: 1,
                    background: "#C9A84C",
                    clipPath: "polygon(0 0, 22% 0, 0 22%)"
                }} />

                {/* Bottom-right navy triangle — strictly 260×260 */}
                <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 260, height: 260, zIndex: 1,
                    background: "#0A2540",
                    clipPath: "polygon(100% 100%, 0 100%, 100% 0)"
                }} />
                {/* Gold edge on bottom-right */}
                <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 290, height: 290, zIndex: 1,
                    background: "#C9A84C",
                    clipPath: "polygon(100% 100%, 78% 100%, 100% 78%)"
                }} />

                {/* Outer gold frame */}
                <div style={{
                    position: "absolute", top: 16, left: 16, right: 16, bottom: 16,
                    border: "3px solid #C9A84C", zIndex: 2, pointerEvents: "none"
                }} />
                {/* Inner thin frame */}
                <div style={{
                    position: "absolute", top: 26, left: 26, right: 26, bottom: 26,
                    border: "1px solid rgba(10,37,64,0.18)", zIndex: 2, pointerEvents: "none"
                }} />

                {/* Faint globe watermark — centered, very light */}
                <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1, opacity: 0.035, pointerEvents: "none",
                    lineHeight: 0
                }}>
                    <svg width="500" height="500" viewBox="0 0 24 24" fill="none" stroke="#0A2540" strokeWidth="0.5">
                        <circle cx="12" cy="12" r="10" />
                        <ellipse cx="12" cy="12" rx="4" ry="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <line x1="12" y1="2" x2="12" y2="22" />
                        <path d="M4.93 4.93 C 7 8 7 16 4.93 19.07" />
                        <path d="M19.07 4.93 C 17 8 17 16 19.07 19.07" />
                    </svg>
                </div>

                {/* ===== MAIN CONTENT LAYOUT (z-index 10, strict pixel heights) ===== */}
                <div style={{
                    position: "absolute",
                    top: 36, left: 44, right: 44, bottom: 36,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>

                    {/* === HEADER ROW: 100px === */}
                    <div style={{
                        width: "100%",
                        height: 100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                    }}>
                        {/* Left: College Logo */}
                        <div style={{ width: 160, height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                            {collegeLogoUrl ? (
                                <img src={collegeLogoUrl} crossOrigin="anonymous" alt="Partner Logo" style={{ maxHeight: "90%", maxWidth: "100%", objectFit: "contain" }} />
                            ) : (
                                <div style={{
                                    width: 120, height: 64, borderRadius: 8,
                                    border: "2px dashed rgba(10,37,64,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "rgba(10,37,64,0.3)", fontSize: 10, textAlign: "center", padding: 8
                                }}>College / Partner Logo</div>
                            )}
                        </div>

                        {/* Center: AiRA Lab Name */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontSize: 46, fontWeight: 900, color: "#0A2540", letterSpacing: "0.12em", lineHeight: 1.1 }}>
                                AiRA<span style={{ color: "#1E5FA8" }}> Lab</span>
                            </div>
                            <div style={{ fontSize: 10, color: "#0A2540", letterSpacing: "0.35em", textTransform: "uppercase", marginTop: 6, opacity: 0.7 }}>
                                Innovation &amp; Research Laboratory
                            </div>
                        </div>

                        {/* Right: Official AiRA Logo */}
                        <div style={{ width: 160, height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                            {logoUrl ? (
                                <img src={logoUrl} crossOrigin="anonymous" alt="Official Logo" style={{ maxHeight: "90%", maxWidth: "100%", objectFit: "contain" }} />
                            ) : (
                                <div style={{
                                    width: 120, height: 64, borderRadius: 8,
                                    border: "2px dashed rgba(10,37,64,0.2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "rgba(10,37,64,0.4)", fontSize: 12, fontWeight: "bold"
                                }}>AiRA Logo</div>
                            )}
                        </div>
                    </div>

                    {/* === GOLD SEPARATOR: 4px === */}
                    <div style={{ width: "100%", height: 2, background: "linear-gradient(to right, transparent, #C9A84C, transparent)", margin: "4px 0 12px 0", flexShrink: 0 }} />

                    {/* === TITLE: fixed height 110px === */}
                    <div style={{ height: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{
                            fontSize: 52, fontWeight: 900, color: "#C9A84C",
                            textTransform: "uppercase", letterSpacing: "0.12em",
                            textAlign: "center", lineHeight: 1.15,
                            textShadow: "1px 1px 2px rgba(0,0,0,0.08)"
                        }}>
                            {title || "Certificate of Excellence"}
                        </div>
                    </div>

                    {/* === EVENT SUBTITLE: 36px === */}
                    <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexShrink: 0 }}>
                        <div style={{ width: 60, height: 1, background: "#0A2540" }} />
                        <div style={{ fontSize: 13, color: "#0A2540", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700 }}>
                            {eventStr || "Proudly Presented at AiRA Lab"}
                        </div>
                        <div style={{ width: 60, height: 1, background: "#0A2540" }} />
                    </div>

                    {/* === "This certifies that": 36px === */}
                    <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 18, color: "#64748b", fontStyle: "italic" }}>This certifies that</div>
                    </div>

                    {/* === NAME: 92px === */}
                    <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{
                            fontSize: 72, fontWeight: 700, color: "#0A2540",
                            letterSpacing: "0.02em", lineHeight: 1,
                            textShadow: "1px 1px 3px rgba(0,0,0,0.1)"
                        }}>
                            {name || "John Doe"}
                        </div>
                    </div>

                    {/* === GOLD DIVIDER: 16px === */}
                    <div style={{ height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ width: 140, height: 3, background: "linear-gradient(to right, transparent, #C9A84C, transparent)" }} />
                    </div>

                    {/* === DESCRIPTION: 72px, overflow ellipsis === */}
                    <div style={{
                        height: 72, display: "flex", alignItems: "flex-start", justifyContent: "center",
                        padding: "4px 32px 0 32px", textAlign: "center", flexShrink: 0, overflow: "hidden"
                    }}>
                        <div style={{ fontSize: 17, color: "#334155", lineHeight: 1.65, fontWeight: 300 }}>
                            {description || "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application."}
                        </div>
                    </div>

                    {/* === SPACER: flexes to fill remaining height === */}
                    <div style={{ flex: 1, minHeight: 0 }} />

                    {/* === FOOTER ROW: 96px, signature + date + seal === */}
                    <div style={{
                        width: "100%",
                        height: 96,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        flexShrink: 0,
                        paddingBottom: 8,
                    }}>
                        {/* Date - left */}
                        <div style={{ width: 240, textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#0A2540", marginBottom: 8 }}>{formattedDate}</div>
                            <div style={{ height: 1, background: "rgba(10,37,64,0.4)", marginBottom: 6 }} />
                            <div style={{ fontSize: 10, color: "#0A2540", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>Date of Issuance</div>
                        </div>

                        {/* Center Seal */}
                        <div style={{ width: 96, height: 96, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{
                                width: 90, height: 90, borderRadius: "50%",
                                border: "5px double #C9A84C",
                                background: "#0A2540",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 16px rgba(10,37,64,0.35)"
                            }}>
                                <Award size={44} color="#C9A84C" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Director Signature - right */}
                        <div style={{ width: 240, textAlign: "center" }}>
                            <div style={{ height: 52, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                                {signatureUrl ? (
                                    <img src={signatureUrl} crossOrigin="anonymous" alt="Signature" style={{ maxHeight: "100%", objectFit: "contain", maxWidth: 200 }} />
                                ) : (
                                    <div style={{
                                        fontSize: 38, color: "#0A2540", opacity: 0.85,
                                        transform: "rotate(-4deg)",
                                        fontFamily: "'Brush Script MT', cursive",
                                        fontStyle: "italic"
                                    }}>AiRA Director</div>
                                )}
                            </div>
                            <div style={{ height: 1, background: "rgba(10,37,64,0.4)", marginBottom: 6 }} />
                            <div style={{ fontSize: 10, color: "#0A2540", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>AiRA Lab Director</div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
