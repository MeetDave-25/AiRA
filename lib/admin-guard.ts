import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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

/**
 * Returns the user's effective role in a specific team.
 * Admins always get "ADMIN". For others, checks TeamMembership.memberRole.
 * Falls back to global User.role if memberRole column doesn't exist yet.
 */
export async function getTeamRole(userId: string, teamId: string, globalRole: string): Promise<string> {
    if (globalRole === "ADMIN") return "ADMIN";
    try {
        const { data } = await db
            .from("TeamMembership")
            .select("memberRole")
            .eq("userId", userId)
            .eq("teamId", teamId)
            .maybeSingle();
        if (data?.memberRole) return data.memberRole;
    } catch {}
    // Fallback to global role if column doesn't exist yet
    return globalRole;
}

export async function requireLeadOrAdmin(teamId: string) {
    const session: any = await getServerSession(authOptions as any);

    if (!session?.user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const userId = (session.user as any).id;
    const globalRole = (session.user as any).role;

    if (globalRole === "ADMIN") return { session };

    // Check per-team role from TeamMembership
    const teamRole = await getTeamRole(userId, teamId, globalRole);
    if (teamRole === "TEAM_LEAD") {
        return { session };
    }

    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
}
