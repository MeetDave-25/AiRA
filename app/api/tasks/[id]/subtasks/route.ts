import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// GET /api/tasks/:id/subtasks — fetch all sub-tasks of a parent task
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const role = session.user.role;

    // Fetch the parent task first to verify access
    const { data: parent, error: parentErr } = await db
        .from("Task").select("id, teamId, assignedTo").eq("id", params.id).single();
    if (parentErr || !parent) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Check access: admin, team lead, or the assigned user
    if (role !== "ADMIN") {
        const { data: membership } = await db
            .from("TeamMembership").select("memberRole")
            .eq("userId", userId).eq("teamId", parent.teamId).maybeSingle();
        if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: subtasks } = await db
        .from("Task")
        .select("*")
        .eq("parentTaskId", params.id)
        .order("createdAt", { ascending: true });

    const tasks = subtasks || [];

    // Enrich with assigned user info
    const assignedIds = Array.from(new Set(tasks.map((t: any) => t.assignedTo).filter(Boolean))) as string[];
    let usersById: Record<string, any> = {};
    if (assignedIds.length) {
        const { data: users } = await db.from("User").select("id, name, email").in("id", assignedIds);
        usersById = Object.fromEntries((users || []).map((u: any) => [u.id, u]));
    }

    const enriched = tasks.map((t: any) => ({
        ...t,
        assignedUser: t.assignedTo ? usersById[t.assignedTo] || null : null,
        isAssignedToMe: t.assignedTo === userId,
    }));

    return NextResponse.json(enriched);
}

// POST /api/tasks/:id/subtasks — Lead creates a sub-task under a parent
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const role = session.user.role;

    // Fetch parent task
    const { data: parent, error: parentErr } = await db
        .from("Task").select("id, teamId").eq("id", params.id).single();
    if (parentErr || !parent) return NextResponse.json({ error: "Parent task not found" }, { status: 404 });

    // Only ADMIN or TEAM_LEAD of this team can create sub-tasks
    if (role !== "ADMIN") {
        const { data: membership } = await db
            .from("TeamMembership").select("memberRole")
            .eq("userId", userId).eq("teamId", parent.teamId).maybeSingle();
        if (!membership || membership.memberRole !== "TEAM_LEAD") {
            return NextResponse.json({ error: "Only Team Leads can create sub-tasks" }, { status: 403 });
        }
    }

    const body = await req.json();
    const { title, description, assignedTo, dueDate } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const { data: subtask, error } = await db
        .from("Task")
        .insert({
            id: uuidv4(),
            title: title.trim(),
            description: description?.trim() || null,
            status: "TODO",
            teamId: parent.teamId,
            assignedTo: assignedTo || null,
            parentTaskId: params.id,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("SubTask INSERT error:", error);
        return NextResponse.json({ error: "Failed to create sub-task" }, { status: 500 });
    }

    // Enrich with assigned user
    let assignedUser = null;
    if (subtask.assignedTo) {
        const { data: u } = await db.from("User").select("id, name, email").eq("id", subtask.assignedTo).single();
        assignedUser = u || null;
    }

    return NextResponse.json({ ...subtask, assignedUser }, { status: 201 });
}
