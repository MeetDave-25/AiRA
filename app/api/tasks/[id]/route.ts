import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session: any = await getServerSession(authOptions as any);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role === "ADMIN") {
        const { id, createdAt, updatedAt, Team, ...updateData } = body;
        const { data, error } = await db
            .from("Task")
            .update({ ...updateData, dueDate: updateData.dueDate ? new Date(updateData.dueDate).toISOString() : null })
            .eq("id", params.id)
            .select()
            .single();
        if (error) return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
        return NextResponse.json(data);
    }

    const { data: existing, error: fetchErr } = await db.from("Task").select("*").eq("id", params.id).single();
    if (fetchErr || !existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const { data: membership } = await db
        .from("TeamMembership").select("id").eq("userId", userId).eq("teamId", existing.teamId).maybeSingle();

    if (existing.assignedTo !== userId && !membership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { data, error } = await db.from("Task").update({ status: body.status }).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    await db.from("Task").delete().eq("id", params.id);
    return NextResponse.json({ success: true });
}
