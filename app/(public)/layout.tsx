import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlobalNetflixIntro from "@/components/ui/GlobalNetflixIntro";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* <GlobalNetflixIntro /> */}
            <Navbar />
            <main className="flex-1 page-enter">{children}</main>
            <Footer />
        </div>
    );
}
