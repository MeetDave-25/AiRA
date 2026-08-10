import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AiraAiChatbot = dynamic(() => import("@/components/ui/AiraAiChatbot"), {
    ssr: false,
});

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            {/* Global Mevy AI Guide Chatbot */}
            <AiraAiChatbot />
        </div>
    );
}



