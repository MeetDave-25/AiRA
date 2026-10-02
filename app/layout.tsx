import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, Inter_Tight, IBM_Plex_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/providers/SessionProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import PwaProvider from "@/components/providers/PwaProvider";
import { SITE_URL, siteConfig, absoluteUrl, ADSENSE_CLIENT } from "@/lib/site";

// Self-hosted via next/font: no render-blocking Google Fonts request, no layout shift.
const orbitron = Orbitron({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-orbitron", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-grotesk", display: "swap" });
// Display face for headings + an editorial serif for italic accents (the "international studio" look).
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-display", display: "swap" });
// Technical mono for drawing annotations, part numbers and spec labels.
// Characterful display face for the homepage.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-brico", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: SITE_URL }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "education",
    manifest: "/manifest.webmanifest",
    icons: {
        icon: "/icon.svg",
        apple: "/apple-icon.svg",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: siteConfig.name,
    },
    openGraph: {
        type: "website",
        locale: siteConfig.locale,
        url: SITE_URL,
        siteName: siteConfig.name,
        title: siteConfig.title,
        description: siteConfig.description,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
    formatDetection: { telephone: false },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
        ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
        : {}),
    other: {
        "google-adsense-account": ADSENSE_CLIENT,
    },
};

export const viewport: Viewport = {
    themeColor: "#07080C",
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
};

// Organization + WebSite structured data so Google can show a knowledge panel / sitelinks.
const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": ["Organization", "EducationalOrganization"],
            "@id": `${SITE_URL}/#organization`,
            name: siteConfig.name,
            alternateName: ["AIRA Labs", "AiRA Labs"],
            url: SITE_URL,
            logo: absoluteUrl(siteConfig.logo),
            email: siteConfig.email,
            telephone: siteConfig.phone,
            description: siteConfig.description,
            address: {
                "@type": "PostalAddress",
                streetAddress: siteConfig.address.street,
                addressLocality: siteConfig.address.city,
                addressRegion: siteConfig.address.region,
                addressCountry: siteConfig.address.country,
            },
            sameAs: Object.values(siteConfig.social),
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            url: SITE_URL,
            name: siteConfig.name,
            inLanguage: "en-IN",
            publisher: { "@id": `${SITE_URL}/#organization` },
        },
    ],
};

// Google Consent Mode v2 defaults. Must run before the AdSense tag. Everything non-essential
// stays denied until the visitor chooses in <CookieConsent />.
const consentDefaults = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
var c=null;try{c=JSON.parse(localStorage.getItem('aira_cookie_consent_v1')||'null');}catch(e){}
var ads=!!(c&&c.ads),an=!!(c&&c.analytics);
gtag('consent','default',{ad_storage:ads?'granted':'denied',ad_user_data:ads?'granted':'denied',ad_personalization:ads?'granted':'denied',analytics_storage:an?'granted':'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
(window.adsbygoogle=window.adsbygoogle||[]).requestNonPersonalizedAds=ads?0:1;
`;

import LenisProvider from "@/components/providers/LenisProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import CookieConsent from "@/components/ui/CookieConsent";
import WalkInGate from "@/components/auth/WalkInGate";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en-IN" className={`dark ${orbitron.variable} ${spaceGrotesk.variable} ${interTight.variable} ${plexMono.variable} ${bricolage.variable}`}>
            <head>
                {/* Modern PWA Web App Capable Meta Tag */}
                <meta name="mobile-web-app-capable" content="yes" />

                <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />

                {/* AdSense loads only on public pages — see app/(public)/layout.tsx */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="bg-aira-bg text-slate-100 font-grotesk antialiased selection:bg-sky-400/30 selection:text-white">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000000] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-aira-cyan focus:text-slate-950 focus:font-bold"
                >
                    Skip to content
                </a>
                <LenisProvider>
                    <SessionProvider>
                        <NotificationProvider>
                            <PwaProvider />
                            <NoiseOverlay />
                            <CustomCursor />
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                            <CookieConsent />
                            <WalkInGate />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    // Neo-brutal toasts: paper card, ink outline, hard shadow.
                                    style: {
                                        background: "#F3EFE4",
                                        color: "#111111",
                                        border: "2px solid #111111",
                                        borderRadius: "14px",
                                        boxShadow: "4px 4px 0 0 #111111",
                                        padding: "10px 14px",
                                        fontWeight: 600,
                                        fontSize: "14px",
                                    },
                                    success: { iconTheme: { primary: "#6C5CE7", secondary: "#F3EFE4" } },
                                    error: { iconTheme: { primary: "#E5484D", secondary: "#F3EFE4" } },
                                }}
                            />
                        </NotificationProvider>
                    </SessionProvider>
                </LenisProvider>
            </body>
        </html>
    );
}
