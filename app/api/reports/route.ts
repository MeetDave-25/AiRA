import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireLeadOrAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");

    let query = db.from("Report").select("*, team:Team(*), author:User(id, name, email, role)");
    if (teamId) {
        query = query.eq("teamId", teamId);
    }

    if (role === "ADMIN") {
        // Admins can see reports strictly submitted by TEAM_LEADs
        query = query.eq("author.role", "TEAM_LEAD");
    } else if (role === "TEAM_LEAD") {
        // Team Leads can see reports strictly submitted by TEAM_MEMBERs in their specific team
        const { data: memberships } = await db.from("TeamMembership").select("teamId").eq("userId", userId);
        const teamIds = (memberships || []).map((m: any) => m.teamId);
        
        if (teamIds.length === 0) return NextResponse.json([]);
        
        query = query.in("teamId", teamIds).eq("author.role", "TEAM_MEMBER");
    } else {
        // TEAM_MEMBER cannot fetch reports
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { data: rawReports, error } = await query.order("createdAt", { ascending: false });
        if (error) throw error;
        
        // Supabase nested inner joins filter null parents.
        // We filter out null authors due to the eq('author.role', ...) strict match simulation in JS because supabase JS doesn't do deep filtering natively well without inner joins.
        let reports = rawReports || [];
        if (role === "ADMIN") {
            reports = reports.filter((r: any) => r.author?.role === "TEAM_LEAD");
        } else if (role === "TEAM_LEAD") {
            reports = reports.filter((r: any) => r.author?.role === "TEAM_MEMBER");
        }
        
        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { teamId, content } = body;
        const userId = session.user.id;

        if (!teamId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate user is actually in this team using TeamMembership table
        const { data: memberCheck } = await db
            .from("TeamMembership")
            .select("id")
            .eq("teamId", teamId)
            .eq("userId", userId)
            .maybeSingle();

        if (!memberCheck) {
            return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
        }

        const { data, error } = await db
            .from("Report")
            .insert({
                id: uuidv4(),
                teamId,
                authorId: userId,
                content,
                createdAt: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Report POST error:", error);
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
    }
}
