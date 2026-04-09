import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const { searchParams } = new URL(req.url);
        const take = Math.min(Math.max(Number(searchParams.get("take") || 30), 1), 100);
        const teamId = searchParams.get("teamId");

        let taskIds: string[] | null = null;

        if (role !== "ADMIN") {
            const { data: memberships } = await db.from("TeamMembership").select("teamId").eq("userId", userId);
            const userTeamIds = (memberships || []).map((m: any) => m.teamId);
            const filterTeamId = teamId || undefined;
            const { data: tasks } = await db.from("Task").select("id").in("teamId", filterTeamId ? [filterTeamId] : userTeamIds);
            taskIds = (tasks || []).map((t: any) => t.id);
        } else if (teamId) {
            const { data: tasks } = await db.from("Task").select("id").eq("teamId", teamId);
            taskIds = (tasks || []).map((t: any) => t.id);
        }

        let query = db
            .from("TaskUpdate")
            .select("*, User!authorId(id, name, email, role), Task(id, title, status, teamId, Team(id, name, color))")
            .order("createdAt", { ascending: false })
            .limit(take);

        if (taskIds !== null) {
            query = query.in("taskId", taskIds.length ? taskIds : ["no-match"]);
        }

        const { data: updates, error } = await query;
        if (error) throw error;

        return NextResponse.json(updates || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch updates", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const role = (session.user as any).role;
        const body = await req.json();
        const { taskId, message } = body;

        if (!taskId || !message) return NextResponse.json({ error: "Missing taskId or message" }, { status: 400 });

        if (taskId === "ANNOUNCEMENT") {
            const { data: update, error } = await db
                .from("TaskUpdate")
                .insert({ taskId: null, message, authorId: userId })
                .select("*, User!authorId(id, name, email)")
                .single();
            if (error) throw error;
            return NextResponse.json(update, { status: 201 });
        }

        const { data: task } = await db.from("Task").select("*, Team(*)").eq("id", taskId).single();
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        if (role !== "ADMIN") {
            const { data: membership } = await db
                .from("TeamMembership").select("id").eq("userId", userId).eq("teamId", task.teamId).maybeSingle();
            if (!membership) return NextResponse.json({ error: "Access denied to this team" }, { status: 403 });
        }

        const { data: update, error } = await db
            .from("TaskUpdate")
            .insert({ taskId, message, authorId: userId })
            .select("*, User!authorId(id, name, email), Task(id, title, status, Team(id, name, color))")
            .single();

        if (error) throw error;
        return NextResponse.json(update, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create update", details: String(error) }, { status: 500 });
    }
}
