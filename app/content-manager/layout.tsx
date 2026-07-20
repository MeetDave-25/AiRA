"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ALLOWED_ROLES = ["ADMIN", "CONTENT_MANAGER"];

export default function ContentManagerLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (status === "unauthenticated") { router.push("/portal/login"); return; }
        if (status === "authenticated" && !ALLOWED_ROLES.includes(role)) {
            router.push("/portal/dashboard");
        }
    }, [status, session, router, role]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-aira-bg flex items-center justify-center">
                <div className="netflix-loader">{Array.from({ length: 10 }).map((_, i) => <span key={i} />)}</div>
            </div>
        );
    }

    if (!ALLOWED_ROLES.includes(role)) return null;

    return <>{children}</>;
}
