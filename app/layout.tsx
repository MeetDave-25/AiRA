import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
    title: "AIRA Labs — Innovation & Research Laboratory",
    description: "AIRA Labs is a premier college innovation lab fostering creativity, technology, and excellence through events, research, and collaborative projects.",
    keywords: "AIRA Labs, college innovation lab, events, research, technology",
    openGraph: {
        title: "AIRA Labs",
        description: "Where Innovation Meets Excellence",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-aira-bg text-slate-100 font-grotesk antialiased">
                <SessionProvider>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: "#0d1526",
                                color: "#e2e8f0",
                                border: "1px solid rgba(0, 212, 255, 0.3)",
                            },
                        }}
                    />
                </SessionProvider>
            </body>
        </html>
    );
}
