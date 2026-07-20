"use client";

import React, { forwardRef } from "react";
import type { CertificateDesign, DesignElement } from "@/lib/certificate-types";

interface Props {
    design: CertificateDesign;
    // Runtime substitution values
    recipientName: string;
    formattedDate: string;
    logoUrl?: string;
    signatureUrl?: string;
    collegeLogoUrl?: string;
}

function renderElement(el: DesignElement, { recipientName, formattedDate, logoUrl, signatureUrl, collegeLogoUrl }: Omit<Props, "design">) {
    if (el.type === "divider") {
        return (
            <div key={el.id} style={{
                position: "absolute", left: el.x, top: el.y, width: el.width,
                height: el.thickness || 2, zIndex: 10,
                background: el.id === "name-divider"
                    ? `linear-gradient(to right, transparent, ${el.color || "#C9A84C"}, transparent)`
                    : (el.color || "#C9A84C"),
                opacity: el.opacity ?? 1,
            }} />
        );
    }

    if (el.type === "image") {
        let src = el.imageUrl || "";
        if (el.id === "official-logo") src = logoUrl || "";
        if (el.id === "signature") src = signatureUrl || "";
        if (el.id === "college-logo") src = collegeLogoUrl || "";

        if (!src) {
            return (
                <div key={el.id} style={{
                    position: "absolute", left: el.x, top: el.y,
                    width: el.width, height: el.height || 80, zIndex: 10,
                    border: "2px dashed rgba(10,37,64,0.15)", borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(10,37,64,0.25)", fontSize: 11, textAlign: "center",
                }}>
                    {el.imageAlt}
                </div>
            );
        }
        return (
            <img key={el.id} src={src} crossOrigin="anonymous" alt={el.imageAlt || ""}
                style={{
                    position: "absolute", left: el.x, top: el.y, zIndex: 10,
                    width: el.width, height: el.height || 80,
                    objectFit: el.objectFit || "contain", display: "block",
                }} />
        );
    }

    // text
    let text = el.text || "";
    if (el.id === "name") text = recipientName;
    if (el.id === "date") text = formattedDate;

    return (
        <div key={el.id} style={{
            position: "absolute", left: el.x, top: el.y, zIndex: 10,
            width: el.width,
            fontSize: el.fontSize || 16,
            fontFamily: el.fontFamily || "Georgia, serif",
            fontWeight: el.fontWeight || "400",
            fontStyle: el.fontStyle || "normal",
            color: el.color || "#000",
            textAlign: el.textAlign || "left",
            opacity: el.opacity ?? 1,
            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
            textTransform: el.uppercase ? "uppercase" : undefined,
            lineHeight: 1.35,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        }}>
            {text}
        </div>
    );
}

function CornerDecorations({ style }: { style: string }) {
    if (style === "none") return null;
    const navy = style === "navy-gold" ? "#0A2540" : "#1E5FA8";
    const gold = style === "navy-gold" ? "#C9A84C" : "#90CAF9";
    return (
        <>
            <div style={{ position: "absolute", top: 0, left: 0, width: 160, height: 160, background: navy, clipPath: "polygon(0 0, 100% 0, 0 100%)", zIndex: 1 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 180, height: 180, background: gold, clipPath: "polygon(0 0, 22% 0, 0 22%)", zIndex: 1 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 160, height: 160, background: navy, clipPath: "polygon(100% 100%, 0 100%, 100% 0)", zIndex: 1 }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 180, height: 180, background: gold, clipPath: "polygon(100% 100%, 78% 100%, 100% 78%)", zIndex: 1 }} />
        </>
    );
}

export const CertificateTemplate = forwardRef<HTMLDivElement, Props>(
    ({ design, recipientName, formattedDate, logoUrl, signatureUrl, collegeLogoUrl }, ref) => {
        return (
            <div
                ref={ref}
                style={{
                    width: "1122px", height: "794px",
                    position: "relative", overflow: "hidden", boxSizing: "border-box",
                    background: design.background.startsWith("#") ? design.background : undefined,
                }}
            >
                {!design.background.startsWith("#") && (
                    <div style={{ position: "absolute", inset: 0, background: design.background, zIndex: 0 }} />
                )}

                <CornerDecorations style={design.cornerStyle} />

                <div style={{
                    position: "absolute", top: 16, left: 16, right: 16, bottom: 16,
                    border: `${design.borderThickness}px solid ${design.borderColor}`, zIndex: 2, pointerEvents: "none",
                }} />
                <div style={{ position: "absolute", top: 26, left: 26, right: 26, bottom: 26, border: "1px solid rgba(10,37,64,0.15)", zIndex: 2, pointerEvents: "none" }} />

                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, opacity: 0.035, pointerEvents: "none", lineHeight: 0 }}>
                    <svg width="500" height="500" viewBox="0 0 24 24" fill="none" stroke="#0A2540" strokeWidth="0.5">
                        <circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" />
                        <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
                        <path d="M4.93 4.93 C 7 8 7 16 4.93 19.07" /><path d="M19.07 4.93 C 17 8 17 16 19.07 19.07" />
                    </svg>
                </div>

                {design.elements.map(el => renderElement(el, { recipientName, formattedDate, logoUrl, signatureUrl, collegeLogoUrl }))}
            </div>
        );
    }
);

CertificateTemplate.displayName = "CertificateTemplate";
