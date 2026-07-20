// Shared types for the visual certificate editor

export type TextAlign = "left" | "center" | "right";
export type CornerStyle = "navy-gold" | "blue-white" | "none";

export interface DesignElement {
    id: string;
    type: "text" | "divider" | "image";
    x: number;
    y: number;
    width: number;

    // text
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    textAlign?: TextAlign;
    opacity?: number;
    uppercase?: boolean;
    letterSpacing?: number;

    // divider
    thickness?: number;
    height?: number;

    // image
    imageUrl?: string;
    imageAlt?: string;
    objectFit?: "contain" | "cover";
}

export interface CertificateDesign {
    background: string;
    cornerStyle: CornerStyle;
    borderColor: string;
    borderThickness: number;
    elements: DesignElement[];
}

export function defaultDesign(): CertificateDesign {
    return {
        background: "linear-gradient(160deg, #FDFCF8 60%, #EFF3FA 100%)",
        cornerStyle: "navy-gold",
        borderColor: "#C9A84C",
        borderThickness: 3,
        elements: [
            // Header section
            {
                id: "college-logo",
                type: "image",
                x: 44, y: 36,
                width: 150, height: 100,
                imageAlt: "College Logo",
                objectFit: "contain",
            },
            {
                id: "lab-name",
                type: "text",
                x: 200, y: 44,
                width: 722,
                text: "AiRA Lab",
                fontSize: 46, fontFamily: "Georgia, serif",
                fontWeight: "900", color: "#0A2540",
                textAlign: "center", letterSpacing: 5,
            },
            {
                id: "lab-tagline",
                type: "text",
                x: 200, y: 96,
                width: 722,
                text: "Innovation & Research Laboratory",
                fontSize: 10, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                textAlign: "center", uppercase: true, letterSpacing: 6, opacity: 0.7,
            },
            {
                id: "official-logo",
                type: "image",
                x: 928, y: 36,
                width: 150, height: 100,
                imageAlt: "Official Logo",
                objectFit: "contain",
            },
            // Separator
            {
                id: "header-divider",
                type: "divider",
                x: 44, y: 145,
                width: 1034, thickness: 2, color: "#C9A84C", height: 2,
            },
            // Title
            {
                id: "title",
                type: "text",
                x: 120, y: 165,
                width: 882,
                text: "Certificate of Excellence",
                fontSize: 52, fontFamily: "Georgia, serif",
                fontWeight: "900", color: "#C9A84C",
                textAlign: "center", uppercase: true, letterSpacing: 8,
            },
            // Event
            {
                id: "event",
                type: "text",
                x: 200, y: 265,
                width: 722,
                text: "Proudly Presented at AiRA Lab 2026",
                fontSize: 13, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                textAlign: "center", uppercase: true, letterSpacing: 5,
            },
            // "This certifies that"
            {
                id: "certifies-label",
                type: "text",
                x: 120, y: 310,
                width: 882,
                text: "This certifies that",
                fontSize: 18, fontFamily: "Georgia, serif",
                fontWeight: "400", color: "#64748b",
                textAlign: "center", fontStyle: "italic",
            },
            // Recipient Name
            {
                id: "name",
                type: "text",
                x: 120, y: 345,
                width: 882,
                text: "%%NAME%%",
                fontSize: 72, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                textAlign: "center",
            },
            // Gold divider line
            {
                id: "name-divider",
                type: "divider",
                x: 441, y: 452,
                width: 240, thickness: 3, color: "#C9A84C", height: 3, opacity: 0.8,
            },
            // Description
            {
                id: "description",
                type: "text",
                x: 120, y: 468,
                width: 882,
                text: "has successfully demonstrated exceptional dedication, skill, and commitment to excellence in the core tenets of AI research and application.",
                fontSize: 17, fontFamily: "Georgia, serif",
                fontWeight: "300", color: "#334155",
                textAlign: "center",
            },
            // Date
            {
                id: "date",
                type: "text",
                x: 44, y: 680,
                width: 240,
                text: "%%DATE%%",
                fontSize: 17, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                textAlign: "center",
            },
            {
                id: "date-label",
                type: "text",
                x: 44, y: 716,
                width: 240,
                text: "Date of Issuance",
                fontSize: 10, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                uppercase: true, letterSpacing: 4, textAlign: "center",
            },
            // Seal
            {
                id: "seal-label",
                type: "text",
                x: 486, y: 734,
                width: 150,
                text: "◎ AiRA Lab ◎",
                fontSize: 10, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#C9A84C",
                textAlign: "center", uppercase: true, letterSpacing: 3,
            },
            // Signature
            {
                id: "signature",
                type: "image",
                x: 838, y: 640,
                width: 240, height: 56,
                imageAlt: "Signature",
                objectFit: "contain",
            },
            {
                id: "director-label",
                type: "text",
                x: 838, y: 716,
                width: 240,
                text: "AiRA Lab Director",
                fontSize: 10, fontFamily: "Georgia, serif",
                fontWeight: "700", color: "#0A2540",
                uppercase: true, letterSpacing: 4, textAlign: "center",
            },
        ],
    };
}
