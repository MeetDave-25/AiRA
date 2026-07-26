"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

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
            <div className="min-h-screen bg-aira-bg flex items-center justify-center">
                <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
            </div>
        );
    }

    if (status !== "authenticated" || (session?.user as any)?.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="min-h-screen bg-aira-bg flex">
            {/* Sidebar */}
            <AdminNavbar />

            {/* Main content — offset by sidebar width */}
            <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
