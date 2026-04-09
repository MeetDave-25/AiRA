import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireLeadOrAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let query = db.from("Report").select("*, team:Team(name), author:User(name, email)");

        if (teamId) {
            query = query.eq("teamId", teamId);
        }

        const { data: reports, error } = await query.order("createdAt", { ascending: false });

        if (error) throw error;
        return NextResponse.json(reports || []);
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

        if (!teamId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate lead or admin for this team
        const auth = await requireLeadOrAdmin(teamId);
        if (auth.error) return auth.error;

        const { data, error } = await db
            .from("Report")
            .insert({
                id: uuidv4(),
                teamId,
                authorId: session.user.id,
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
