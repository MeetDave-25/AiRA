import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AiRA Lab — Student AI & Robotics Innovation Lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share card for every page that doesn't provide its own cover image.
export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "80px",
                    backgroundColor: "#060B14",
                    backgroundImage: "radial-gradient(circle at 75% 10%, rgba(56,189,248,0.35), transparent 60%)",
                    color: "white",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignSelf: "flex-start",
                        padding: "10px 22px",
                        borderRadius: 999,
                        border: "2px solid rgba(56,189,248,0.5)",
                        color: "#7dd3fc",
                        fontSize: 24,
                        letterSpacing: 6,
                    }}
                >
                    INNOVATION · RESEARCH · IMPACT
                </div>
                <div style={{ display: "flex", fontSize: 150, fontWeight: 900, marginTop: 30, lineHeight: 1 }}>
                    AiRA
                    <span style={{ color: "#38BDF8", marginLeft: 28 }}>Lab</span>
                </div>
                <div style={{ fontSize: 38, color: "#cbd5e1", marginTop: 28, maxWidth: 900 }}>
                    Student AI, Robotics & Research Lab — L J College of Computer Application, Ahmedabad
                </div>
                <div style={{ display: "flex", marginTop: 50, fontSize: 28, color: "#38BDF8" }}>www.aira-lab.in</div>
            </div>
        ),
        size
    );
}
