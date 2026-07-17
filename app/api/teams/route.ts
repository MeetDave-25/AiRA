import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const role = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    try {
        let query = db
            .from("Team")
            .select("*, TeamMembership(*, User(id, name, email, role, avatar))")
            .order("createdAt", { ascending: true });

        // If not admin, strictly check the TeamMemberships
        if (role !== "ADMIN") {
            const { data: userMemberships } = await db
                .from("TeamMembership")
                .select("teamId")
                .eq("userId", userId);
            
            const allowedTeamIds = (userMemberships || []).map((m: any) => m.teamId);
            
            if (allowedTeamIds.length === 0) {
                return NextResponse.json([]);
            }
            query = query.in("id", allowedTeamIds);
        }

        const { data: teams, error } = await query;
        if (error) throw error;

        // Add _count for assignments and tasks
        const result = await Promise.all(
            (teams || []).map(async (team: any) => {
                const [{ count: assignmentCount }, { count: taskCount }] = await Promise.all([
                    db.from("EventAssignment").select("*", { count: "exact", head: true }).eq("teamId", team.id),
                    db.from("Task").select("*", { count: "exact", head: true }).eq("teamId", team.id),
                ]);
                return {
                    ...team,
                    memberships: (team.TeamMembership || []).map((m: any) => ({ ...m, user: m.User })),
                    _count: { assignments: assignmentCount || 0, tasks: taskCount || 0 }
                };
            })
        );

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    try {
        const { name, description, color } = body;
        const { data: team, error } = await db
            .from("Team")
            .insert({
                id: uuidv4(),
                name,
                description: description || null,
                color: color || "#00D4FF",
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(team, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
