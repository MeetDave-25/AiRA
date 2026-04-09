import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function canAccessTask(taskId: string, userId: string, role: string) {
    if (role === "ADMIN") return true;
    const { data: task } = await db.from("Task").select("teamId, assignedTo").eq("id", taskId).single();
    if (!task) return false;
    if (task.assignedTo === userId) return true;
    const { data: membership } = await db.from("TeamMembership").select("id").eq("userId", userId).eq("teamId", task.teamId).maybeSingle();
    return Boolean(membership);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const userId = session.user.id;
    if (!(await canAccessTask(params.id, userId, role))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: updates } = await db
        .from("TaskUpdate")
        .select("*, User!authorId(id, name, email, role)")
        .eq("taskId", params.id)
        .order("createdAt", { ascending: false })
        .limit(30);

    return NextResponse.json(updates || []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const userId = session.user.id;
    if (!(await canAccessTask(params.id, userId, role))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const message = String(body?.message || "").trim();
    if (!message) return NextResponse.json({ error: "Update message is required" }, { status: 400 });

    const { data: update, error } = await db
        .from("TaskUpdate")
        .insert({ taskId: params.id, authorId: userId, message })
        .select("*, User!authorId(id, name, email, role)")
        .single();

    if (error) return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
    return NextResponse.json(update, { status: 201 });
}
