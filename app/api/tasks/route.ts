import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const role = (session.user as any).role;
        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let tasks: any[] = [];

        if (role === "ADMIN") {
            const query = db.from("Task").select("*, Team(id, name, color)").order("createdAt", { ascending: false });
            const { data } = teamId ? await query.eq("teamId", teamId) : await query;
            tasks = data || [];
        } else {
            const { data: memberships } = await db.from("TeamMembership").select("teamId").eq("userId", userId);
            const teamIds = (memberships || []).map((m: any) => m.teamId);

            let query = db.from("Task").select("*, Team(id, name, color)").order("createdAt", { ascending: false });
            if (teamId) query = query.eq("teamId", teamId);
            if (teamIds.length > 0) query = query.in("teamId", teamIds);
            else query = query.eq("teamId", "no-match");

            const { data } = await query;
            tasks = (data || []).filter((t: any) => t.assignedTo === userId || teamIds.includes(t.teamId));
        }

        // Enrich with assigned user info
        const assignedIds = Array.from(new Set(tasks.map((t: any) => t.assignedTo).filter(Boolean))) as string[];
        let usersById: Record<string, any> = {};
        if (assignedIds.length) {
            const { data: users } = await db.from("User").select("id, name, email").in("id", assignedIds);
            usersById = Object.fromEntries((users || []).map((u: any) => [u.id, u]));
        }

        const enriched = tasks.map((task: any) => ({
            ...task,
            assignedUser: task.assignedTo ? usersById[task.assignedTo] || null : null,
            isAssignedToMe: task.assignedTo === userId,
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tasks", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { title, description, status, dueDate, teamId, assignedTo } = body;
    const { data, error } = await db
        .from("Task")
        .insert({
            id: uuidv4(),
            title,
            description: description || null,
            status: status || "TODO",
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            teamId,
            assignedTo: assignedTo || null,
            updatedAt: new Date().toISOString()
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
