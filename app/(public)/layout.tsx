import dynamic from "next/dynamic";
import { ADSENSE_CLIENT } from "@/lib/site";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";

const AiraAiChatbot = dynamic(() => import("@/components/ui/AiraAiChatbot"), {
    ssr: false,
});

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col relative bg-nb-paper text-nb-ink">
            {/* Google AdSense — public pages only (never admin/portal/login). Consent Mode defaults run first in the root layout. */}
            {/* Plain tag so it is in the server-rendered HTML, where AdSense's site check looks for it. */}
            <script
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
                crossOrigin="anonymous"
            />
            <ScrollProgress />
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            {/* Global Mevy AI Guide Chatbot */}
            <AiraAiChatbot />
        </div>
    );
}



