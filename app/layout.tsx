import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/providers/SessionProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import PwaProvider from "@/components/providers/PwaProvider";
export const metadata: Metadata = {
    title: "AiRA Lab — Innovation & Research Laboratory",
    description: "AiRA Lab is a premier college innovation lab fostering creativity, technology, and excellence through events, research, and collaborative projects.",
    keywords: "AiRA Lab, college innovation lab, events, research, technology",
    manifest: "/manifest.webmanifest",
    applicationName: "AiRA Lab",
    icons: {
        icon: "/icon.svg",
        apple: "/apple-icon.svg",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "AiRA Lab",
    },
    openGraph: {
        title: "AiRA Lab",
        description: "Where Innovation Meets Excellence",
        type: "website",
    },
};

export const viewport: Viewport = {
    themeColor: "#0B1120",
    colorScheme: "dark",
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
                    <NotificationProvider>
                        <PwaProvider />
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
                    </NotificationProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
