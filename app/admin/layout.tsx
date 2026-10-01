"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FloatingAdminMenu from "@/components/admin/FloatingAdminMenu";
import BackButton from "@/components/ui/BackButton";
import ConsoleLoader from "@/components/admin/ConsoleLoader";
import ConsoleScrollReveal from "@/components/admin/ConsoleScrollReveal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/portal/login");
            return;
        }

        if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
            router.push("/portal/dashboard");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="nb-console min-h-screen flex items-center justify-center">
                <ConsoleLoader label="Unlocking the admin console…" />
            </div>
        );
    }

    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="nb-console min-h-screen flex">
            <FloatingAdminMenu />

            {/* Main content */}
            <main className="flex-1 min-h-screen overflow-y-auto">
                <div id="admin-content" className="p-6 md:p-8 max-w-7xl mx-auto">
                    <BackButton />
                    {children}
                </div>
                <ConsoleScrollReveal rootId="admin-content" />
            </main>
        </div>
    );
}
