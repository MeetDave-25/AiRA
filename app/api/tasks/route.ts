import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, requireLeadOrAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const globalRole = (session.user as any).role;
        const userId = (session.user as any).id;
        const { searchParams } = new URL(req.url);
        const teamId = searchParams.get("teamId");

        let tasks: any[] = [];

        if (globalRole === "ADMIN") {
            const query = db.from("Task").select("*, Team(id, name, color)").order("createdAt", { ascending: false });
            const { data } = teamId ? await query.eq("teamId", teamId) : await query;
            tasks = data || [];
        } else {
            // Get user's memberships with per-team role
            const { data: memberships } = await db
                .from("TeamMembership")
                .select("teamId, memberRole")
                .eq("userId", userId);

            const leadTeamIds = (memberships || [])
                .filter((m: any) => m.memberRole === "TEAM_LEAD")
                .map((m: any) => m.teamId);
            const memberTeamIds = (memberships || [])
                .filter((m: any) => m.memberRole !== "TEAM_LEAD")
                .map((m: any) => m.teamId);

            // If asking for a specific team, check their role in that team
            if (teamId) {
                const teamMembership = (memberships || []).find((m: any) => m.teamId === teamId);
                const teamRole = teamMembership?.memberRole || "TEAM_MEMBER";

                if (teamRole === "TEAM_LEAD") {
                    // Lead sees all tasks in this team
                    const { data } = await db.from("Task").select("*, Team(id, name, color)")
                        .eq("teamId", teamId).order("createdAt", { ascending: false });
                    tasks = data || [];
                } else {
                    // Member only sees tasks assigned to them
                    const { data } = await db.from("Task").select("*, Team(id, name, color)")
                        .eq("teamId", teamId).eq("assignedTo", userId).order("createdAt", { ascending: false });
                    tasks = data || [];
                }
            } else {
                // All teams: leads see all tasks in lead teams, members only assigned tasks in member teams
                const leadTasks = leadTeamIds.length > 0
                    ? (await db.from("Task").select("*, Team(id, name, color)").in("teamId", leadTeamIds).order("createdAt", { ascending: false })).data || []
                    : [];
                const memberTasks = memberTeamIds.length > 0
                    ? (await db.from("Task").select("*, Team(id, name, color)").in("teamId", memberTeamIds).eq("assignedTo", userId).order("createdAt", { ascending: false })).data || []
                    : [];
                tasks = [...leadTasks, ...memberTasks];
            }
        }

        // Enrich with assigned user info
        const assignedIds = Array.from(new Set(tasks.map((t: any) => t.assignedTo).filter(Boolean))) as string[];
        let usersById: Record<string, any> = {};
        if (assignedIds.length) {
            const { data: users } = await db.from("User").select("id, name, email").in("id", assignedIds);
            usersById = Object.fromEntries((users || []).map((u: any) => [u.id, u]));
        }

        // Fetch sub-task counts for parent tasks
        const parentIds = tasks.map((t: any) => t.id);
        let subTaskMap: Record<string, { total: number; done: number }> = {};
        if (parentIds.length) {
            const { data: subs } = await db
                .from("Task")
                .select("parentTaskId, status")
                .in("parentTaskId", parentIds);
            for (const s of subs || []) {
                if (!subTaskMap[s.parentTaskId]) subTaskMap[s.parentTaskId] = { total: 0, done: 0 };
                subTaskMap[s.parentTaskId].total++;
                if (s.status === "DONE") subTaskMap[s.parentTaskId].done++;
            }
        }

        const enriched = tasks.map((task: any) => ({
            ...task,
            assignedUser: task.assignedTo ? usersById[task.assignedTo] || null : null,
            isAssignedToMe: task.assignedTo === userId,
            isSubTask: !!task.parentTaskId,
            subTaskCount: subTaskMap[task.id]?.total || 0,
            subTasksDone: subTaskMap[task.id]?.done || 0,
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tasks", details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    if (!body.teamId) return NextResponse.json({ error: "teamId is required" }, { status: 400 });

    const auth = await requireLeadOrAdmin(body.teamId);
    if (auth.error) return auth.error;
    const { title, description, status, dueDate, teamId, assignedTo, parentTaskId } = body;
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
            parentTaskId: parentTaskId || null,
            updatedAt: new Date().toISOString()
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
