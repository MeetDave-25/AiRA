import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    if ((session.user as any).role !== "ADMIN") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { session };
}

export async function requireLeadOrAdmin(teamId: string) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const role = (session.user as any).role;
    if (role === "ADMIN") return { session };

    if (role === "TEAM_LEAD") {
        const teams = (session.user as any).teams || [];
        if (teams.some((t: any) => t.id === teamId)) {
            return { session };
        }
    }

    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}
